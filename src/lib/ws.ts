import { getCsrfToken, probeSession } from './api'
import { emitAuthInvalidated } from './authEvents'

type EventHandler = (payload: Record<string, unknown>) => void

interface WsMessage {
  type: 'command' | 'event' | 'ack' | 'error'
  event: string
  requestId?: string
  version: 'v1'
  timestamp: string
  payload: Record<string, unknown>
}

type OutboundCommand = WsMessage & { type: 'command' }

const ROOM_SCOPED_COMMANDS = new Set([
  'send_chat',
  'vote',
  'join_queue',
  'leave_queue',
  'reorder_queue',
  'enqueue_track',
  'remove_from_playlist',
  'reorder_playlist',
  'skip',
  'pause',
  'resume',
  'ban_user',
  'mute_user',
  'kick_user',
  'clear_chat',
])

export class WsClient {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, Set<EventHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private requestIdCounter = 0
  private pendingCommands: OutboundCommand[] = []
  private readonly maxPendingCommands = 100
  private activeRoomId: string | null = null
  private authenticated = false
  private joinedRoomId: string | null = null

  constructor() {
    const base = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'
    this.url = base
  }

  connect(): void {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    )
      return

    this.ws = new WebSocket(this.buildUrl())

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.authenticated = false

      this.emit('_connected', {})
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data)
        this.handleInboundState(msg)
        this.emit(msg.event, msg.payload)
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      const wasAuthenticated = this.authenticated
      this.stopHeartbeat()
      this.authenticated = false
      this.joinedRoomId = null
      this.emit('_disconnected', {})
      if (!wasAuthenticated) {
        void this.recoverSession()
      }
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.stopHeartbeat()
    this.ws?.close()
    this.ws = null
    this.pendingCommands = []
    this.activeRoomId = null
    this.authenticated = false
    this.joinedRoomId = null
  }

  send(event: string, payload: Record<string, unknown> = {}): string {
    if (event === 'join_room' && typeof payload.roomId === 'string') {
      this.activeRoomId = payload.roomId
      this.joinedRoomId = null
      this.pendingCommands = this.pendingCommands.filter((command) => {
        if (command.event === 'leave_room') return false
        if (
          command.event === 'join_room' &&
          command.payload.roomId !== payload.roomId
        )
          return false
        return true
      })
    }

    if (event === 'leave_room') {
      this.activeRoomId = null
      this.joinedRoomId = null
      this.pendingCommands = this.pendingCommands.filter(
        (command) =>
          !ROOM_SCOPED_COMMANDS.has(command.event) &&
          command.event !== 'join_room',
      )
    }

    const msg = this.buildCommand(event, payload)

    if (this.ws?.readyState === WebSocket.OPEN) {
      if (!this.authenticated && event !== 'ping') {
        this.enqueue(msg)
        return msg.requestId || ''
      }

      if (this.shouldHoldUntilJoin(msg)) {
        this.enqueue(msg)
        this.ensureJoinQueued()
      } else {
        this.sendRaw(msg)
      }
    } else if (event !== 'ping') {
      this.enqueue(msg)
    }

    return msg.requestId || ''
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  private handleInboundState(msg: WsMessage): void {
    if (
      msg.type === 'ack' &&
      msg.event === 'connected' &&
      msg.payload.authenticated === true
    ) {
      this.authenticated = true
      this.stopHeartbeat()
      this.startHeartbeat()

      if (this.activeRoomId && this.joinedRoomId !== this.activeRoomId) {
        this.ensureJoinQueued()
      }

      this.flushPendingCommands()
      return
    }

    if (msg.type === 'ack' && msg.event === 'authenticate') {
      this.authenticated = true
      this.stopHeartbeat()
      this.startHeartbeat()

      if (this.activeRoomId && this.joinedRoomId !== this.activeRoomId) {
        this.ensureJoinQueued()
      }

      this.flushPendingCommands()
      return
    }

    if (
      msg.type === 'ack' &&
      msg.event === 'join_room' &&
      typeof msg.payload.roomId === 'string'
    ) {
      this.joinedRoomId = msg.payload.roomId
      this.flushPendingCommands()
      return
    }

    if (msg.type === 'ack' && msg.event === 'leave_room') {
      this.joinedRoomId = null
      return
    }

    const serverError = msg.type === 'error' ? msg.payload?.message : undefined
    if (serverError === 'Not in a room' && this.activeRoomId) {
      this.joinedRoomId = null
      this.ensureJoinQueued()
      this.flushPendingCommands()
    }
  }

  private emit(event: string, payload: Record<string, unknown>): void {
    this.listeners.get(event)?.forEach((handler) => handler(payload))
  }

  private buildCommand(
    event: string,
    payload: Record<string, unknown>,
  ): OutboundCommand {
    return {
      type: 'command',
      event,
      requestId: `req-${++this.requestIdCounter}-${Date.now()}`,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload,
    }
  }

  private sendRaw(msg: OutboundCommand): void {
    this.ws?.send(JSON.stringify(msg))
  }

  private enqueue(msg: OutboundCommand): void {
    this.pendingCommands.push(msg)

    if (this.pendingCommands.length > this.maxPendingCommands) {
      this.pendingCommands.shift()
    }
  }

  private ensureJoinQueued(): void {
    if (!this.activeRoomId) return

    const alreadyQueued = this.pendingCommands.some(
      (command) =>
        command.event === 'join_room' &&
        command.payload.roomId === this.activeRoomId,
    )

    if (alreadyQueued) return

    const joinCommand = this.buildCommand('join_room', {
      roomId: this.activeRoomId,
    })
    this.pendingCommands.unshift(joinCommand)
  }

  private flushPendingCommands(): void {
    if (
      this.ws?.readyState !== WebSocket.OPEN ||
      !this.authenticated ||
      this.pendingCommands.length === 0
    ) {
      return
    }

    const remaining: OutboundCommand[] = []

    for (const command of this.pendingCommands) {
      if (this.shouldHoldUntilJoin(command)) {
        remaining.push(command)
        continue
      }

      this.sendRaw(command)
    }

    this.pendingCommands = remaining
  }

  private shouldHoldUntilJoin(command: OutboundCommand): boolean {
    if (!ROOM_SCOPED_COMMANDS.has(command.event)) {
      return false
    }

    if (!this.activeRoomId) {
      return false
    }

    return this.joinedRoomId !== this.activeRoomId
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private async recoverSession(): Promise<void> {
    const result = await probeSession()
    if (result !== 'invalid') {
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.maxReconnectAttempts = 0
    emitAuthInvalidated()
  }

  private buildUrl(): string {
    const csrfToken = getCsrfToken()
    if (!csrfToken) {
      return this.url
    }

    const url = new URL(this.url)
    url.searchParams.set('csrf', csrfToken)
    return url.toString()
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send('ping')
    }, 25000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
