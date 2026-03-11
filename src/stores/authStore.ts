import { create } from 'zustand'
import { api } from '../lib/api'
import { WsClient } from '../lib/ws'

interface User {
  id: string
  username: string
  email: string
  avatarId?: string | null
  avatar?: string | null
  platformRole?: string | null
  level: number
  xp: number
}

interface ProgressionPayload {
  level: number
  xp: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  wsClient: WsClient | null
  initialized: boolean

  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  applyProgression: (progression: ProgressionPayload) => void
  setAvatarSelection: (avatarId: string, avatar: string) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  wsClient: null,
  initialized: false,

  initialize: async () => {
    const { user, wsClient, initialized } = get()
    if (initialized) return

    if (user && wsClient) {
      set({ initialized: true })
      return
    }

    try {
      const result = await api<{
        userId: string
        username: string
        email: string
        avatarId: string | null
        avatar: string | null
        platformRole: string | null
        level: number
        xp: number
      }>('/api/auth/me', { skipAuth: true })

      const ws = new WsClient()
      ws.connect()

      set({
        user: {
          id: result.userId,
          username: result.username,
          email: result.email,
          avatarId: result.avatarId,
          avatar: result.avatar,
          platformRole: result.platformRole,
          level: result.level,
          xp: result.xp,
        },
        wsClient: ws,
        initialized: true,
      })
    } catch {
      set({ user: null, wsClient: null, initialized: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api<{
        user: User
      }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      })

      const wsClient = new WsClient()
      wsClient.connect()

      set({
        user: result.user,
        isLoading: false,
        wsClient,
        initialized: true,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null })
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: { username, email, password },
        skipAuth: true,
      })
      await get().login(email, password)
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  logout: async () => {
    const { wsClient } = get()
    wsClient?.disconnect()
    set({ user: null, wsClient: null, initialized: true })

    try {
      await api('/api/auth/logout', {
        method: 'POST',
        skipAuth: true,
      })
    } catch {
      // Ignore logout request failures after local session teardown.
    }
  },

  setError: (error) => set({ error }),
  applyProgression: (progression) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            level: progression.level,
            xp: progression.xp,
          }
        : null,
    })),
  setAvatarSelection: (avatarId, avatar) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            avatarId,
            avatar,
          }
        : null,
    })),
}))
