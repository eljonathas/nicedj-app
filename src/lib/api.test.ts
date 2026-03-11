// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

describe('api auth session flow', () => {
  const authInvalidListener = vi.fn()

  beforeEach(() => {
    authInvalidListener.mockReset()
    document.cookie = 'nicedj_csrf_token=csrf-token'
    window.addEventListener('nicedj:auth-invalid', authInvalidListener)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.cookie =
      'nicedj_csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    window.removeEventListener('nicedj:auth-invalid', authInvalidListener)
  })

  it('sends the csrf header on mutating authenticated requests', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: ['playlist-1'] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ items: string[] }>('/api/playlists', {
      method: 'POST',
      body: { name: 'Summer' },
    })

    expect(result).toEqual({ items: ['playlist-1'] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/playlists$/),
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
        headers: expect.objectContaining({
          'X-CSRF-Token': 'csrf-token',
        }),
      }),
    )
    expect(authInvalidListener).not.toHaveBeenCalled()
  })

  it('invalidates auth when the session is rejected', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    await expect(api('/api/playlists')).rejects.toThrow('Invalid or expired token')
    expect(authInvalidListener).toHaveBeenCalledTimes(1)
  })
})
