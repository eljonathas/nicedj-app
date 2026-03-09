import { create } from 'zustand'
import { api } from '../lib/api'

export interface RoomManagementEmoji {
  id: string
  shortcode: string
  imageUrl: string
  createdById: string
  createdByUsername: string | null
  createdAt: string
}

export interface RoomManagementAuditLog {
  id: string
  action: string
  actorId: string
  actorUsername: string | null
  targetId: string | null
  targetUsername: string | null
  details: Record<string, unknown>
  createdAt: string
}

interface RoomManagementRoom {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string
  queueLocked: boolean
}

interface RoomManagementState {
  roomId: string | null
  room: RoomManagementRoom | null
  customEmojis: RoomManagementEmoji[]
  queueRestrictionUserIds: string[]
  auditLogs: RoomManagementAuditLog[]
  loading: boolean
  auditLoading: boolean
  saving: boolean
  error: string | null

  hydrate: (roomId: string) => Promise<void>
  fetchAuditLogs: (roomId: string) => Promise<void>
  updateSettings: (
    roomId: string,
    input: { name: string; description: string; queueLocked: boolean },
  ) => Promise<RoomManagementRoom>
  setRole: (
    roomId: string,
    userId: string,
    role: string | null,
  ) => Promise<{ userId: string; role: string }>
  setQueueAccess: (
    roomId: string,
    userId: string,
    blocked: boolean,
  ) => Promise<{ userId: string; blocked: boolean }>
  createEmoji: (
    roomId: string,
    input: { shortcode: string; imageUrl: string },
  ) => Promise<RoomManagementEmoji>
  deleteEmoji: (roomId: string, emojiId: string) => Promise<void>
  reset: () => void
}

const initialState = {
  roomId: null,
  room: null,
  customEmojis: [],
  queueRestrictionUserIds: [],
  auditLogs: [],
  loading: false,
  auditLoading: false,
  saving: false,
  error: null,
}

export const useRoomManagementStore = create<RoomManagementState>((set) => ({
  ...initialState,

  hydrate: async (roomId) => {
    set((state) => ({
      ...state,
      roomId,
      loading: true,
      error: null,
    }))

    try {
      const result = await api<{
        room: RoomManagementRoom
        customEmojis: RoomManagementEmoji[]
        queueRestrictionUserIds: string[]
      }>(`/api/rooms/${roomId}/management`)

      set({
        roomId,
        room: result.room,
        customEmojis: result.customEmojis,
        queueRestrictionUserIds: result.queueRestrictionUserIds,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        loading: false,
        error: error.message ?? 'Nao foi possivel carregar a gestao da sala.',
      })
    }
  },

  fetchAuditLogs: async (roomId) => {
    set({ auditLoading: true, error: null })

    try {
      const result = await api<{
        logs: RoomManagementAuditLog[]
      }>(`/api/rooms/${roomId}/audit-logs?limit=30`)

      set({
        auditLogs: result.logs,
        auditLoading: false,
      })
    } catch (error: any) {
      set({
        auditLoading: false,
        error: error.message ?? 'Nao foi possivel carregar a auditoria.',
      })
    }
  },

  updateSettings: async (roomId, input) => {
    set({ saving: true, error: null })

    try {
      const result = await api<{
        room: RoomManagementRoom
      }>(`/api/rooms/${roomId}/settings`, {
        method: 'PATCH',
        body: input,
      })

      set({
        room: result.room,
        saving: false,
      })

      return result.room
    } catch (error: any) {
      set({
        saving: false,
        error: error.message ?? 'Nao foi possivel atualizar a sala.',
      })
      throw error
    }
  },

  setRole: async (roomId, userId, role) => {
    set({ saving: true, error: null })

    try {
      const result = await api<{ userId: string; role: string }>(
        `/api/rooms/${roomId}/roles/${userId}`,
        {
          method: 'PUT',
          body: { role },
        },
      )

      set({ saving: false })
      return result
    } catch (error: any) {
      set({
        saving: false,
        error: error.message ?? 'Nao foi possivel atualizar o cargo.',
      })
      throw error
    }
  },

  setQueueAccess: async (roomId, userId, blocked) => {
    set({ saving: true, error: null })

    try {
      const result = await api<{ userId: string; blocked: boolean }>(
        `/api/rooms/${roomId}/queue-access/${userId}`,
        {
          method: 'PUT',
          body: { blocked },
        },
      )

      set((state) => ({
        queueRestrictionUserIds: blocked
          ? Array.from(new Set([...state.queueRestrictionUserIds, userId]))
          : state.queueRestrictionUserIds.filter((id) => id !== userId),
        saving: false,
      }))

      return result
    } catch (error: any) {
      set({
        saving: false,
        error:
          error.message ??
          'Nao foi possivel atualizar o acesso a fila de espera.',
      })
      throw error
    }
  },

  createEmoji: async (roomId, input) => {
    set({ saving: true, error: null })

    try {
      const emoji = await api<RoomManagementEmoji>(`/api/rooms/${roomId}/emojis`, {
        method: 'POST',
        body: input,
      })

      set((state) => ({
        customEmojis: [emoji, ...state.customEmojis],
        saving: false,
      }))

      return emoji
    } catch (error: any) {
      set({
        saving: false,
        error: error.message ?? 'Nao foi possivel adicionar o emoji.',
      })
      throw error
    }
  },

  deleteEmoji: async (roomId, emojiId) => {
    set({ saving: true, error: null })

    try {
      await api(`/api/rooms/${roomId}/emojis/${emojiId}`, {
        method: 'DELETE',
      })

      set((state) => ({
        customEmojis: state.customEmojis.filter((emoji) => emoji.id !== emojiId),
        saving: false,
      }))
    } catch (error: any) {
      set({
        saving: false,
        error: error.message ?? 'Nao foi possivel remover o emoji.',
      })
      throw error
    }
  },

  reset: () => set(initialState),
}))
