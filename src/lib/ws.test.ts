import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WsClient } from './ws'

type MessageEventLike = {
  data: string
}

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  static instances: MockWebSocket[] = []

  readonly url: string
  readonly protocols: string[]
  readyState = MockWebSocket.CONNECTING
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEventLike) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(url: string, protocols: string | string[]) {
    this.url = url
    if (typeof protocols === 'undefined') {
      this.protocols = []
    } else {
      this.protocols = Array.isArray(protocols) ? protocols : [protocols]
    }
    MockWebSocket.instances.push(this)
  }

  send(payload: string) {
    this.sent.push(payload)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }

  open() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  message(payload: Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(payload) })
  }

  static reset() {
    MockWebSocket.instances = []
  }
}

describe('WsClient', () => {
  beforeEach(() => {
    MockWebSocket.reset()
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('negotiates only the application protocol and authenticates after opening', () => {
    const client = new WsClient('token-123')

    client.connect()

    const socket = MockWebSocket.instances[0]!
    expect(socket.protocols).toEqual([])

    socket.open()

    expect(JSON.parse(socket.sent[0]!)).toMatchObject({
      event: 'authenticate',
      payload: { token: 'token-123' },
    })

    client.disconnect()
  })

  it('holds room commands until the authentication ack arrives', () => {
    const client = new WsClient('token-123')

    client.connect()

    const socket = MockWebSocket.instances[0]!
    socket.open()
    client.send('join_room', { roomId: 'room-1' })

    expect(socket.sent).toHaveLength(1)
    expect(JSON.parse(socket.sent[0]!).event).toBe('authenticate')

    socket.message({
      type: 'ack',
      event: 'authenticate',
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        userId: 'user-1',
        username: 'alice',
      },
    })

    expect(socket.sent).toHaveLength(2)
    expect(JSON.parse(socket.sent[1]!)).toMatchObject({
      event: 'join_room',
      payload: { roomId: 'room-1' },
    })

    client.disconnect()
  })
})
