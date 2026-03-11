// @vitest-environment jsdom

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
    document.cookie = 'nicedj_csrf_token=csrf-token'
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )
  })

  afterEach(() => {
    document.cookie =
      'nicedj_csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    vi.unstubAllGlobals()
  })

  it('passes the csrf token in the websocket URL', () => {
    const client = new WsClient()

    client.connect()

    const socket = MockWebSocket.instances[0]
    expect(socket.protocols).toEqual([])
    expect(socket.url).toContain('csrf=csrf-token')
    socket.open()
    socket.message({
      type: 'ack',
      event: 'connected',
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        authenticated: true,
      },
    })

    client.disconnect()
  })

  it('holds room commands until the authenticated connected ack arrives', () => {
    const client = new WsClient()

    client.connect()

    const socket = MockWebSocket.instances[0]
    socket.open()
    client.send('join_room', { roomId: 'room-1' })

    expect(socket.sent).toHaveLength(0)

    socket.message({
      type: 'ack',
      event: 'connected',
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        authenticated: true,
        userId: 'user-1',
        username: 'alice',
      },
    })

    expect(socket.sent).toHaveLength(1)
    expect(JSON.parse(socket.sent[0])).toMatchObject({
      event: 'join_room',
      payload: { roomId: 'room-1' },
    })

    client.disconnect()
  })
})
