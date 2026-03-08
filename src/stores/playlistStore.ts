import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './authStore'

interface Track {
  id: string
  sourceId: string
  source: 'youtube' | 'soundcloud'
  title: string
  artist: string
  durationMs: number
  thumbnailUrl: string | null
  position: number
}

interface AddTrackPayload {
  sourceId: string
  source: 'youtube' | 'soundcloud'
  title?: string
  artist?: string
  durationMs?: number | null
  thumbnailUrl?: string | null
}

interface Playlist {
  id: string
  name: string
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

interface PlaylistState {
  playlists: Playlist[]
  activePlaylistId: string | null
  tracks: Track[]
  loading: boolean

  fetchPlaylists: () => Promise<void>
  fetchTracks: (playlistId: string) => Promise<void>
  createPlaylist: (name: string) => Promise<string>
  deletePlaylist: (id: string) => Promise<void>
  activatePlaylist: (id: string) => Promise<void>
  addTrack: (playlistId: string, track: AddTrackPayload) => Promise<void>
  addTrackFromUrl: (playlistId: string, url: string) => Promise<void>
  removeTrack: (playlistId: string, trackId: string) => Promise<void>
  reorderTracks: (playlistId: string, trackIds: string[]) => Promise<void>
}

interface TrackMutationResponse {
  track: Track
  progression?: {
    level: number
    xp: number
  } | null
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  activePlaylistId: null,
  tracks: [],
  loading: false,

  fetchPlaylists: async () => {
    set({ loading: true })
    try {
      const data = await api<Playlist[]>('/api/playlists')
      const active = data.find((p) => p.isActive)
      set({ playlists: data, activePlaylistId: active?.id ?? null })
    } finally {
      set({ loading: false })
    }
  },

  fetchTracks: async (playlistId: string) => {
    const data = await api<Track[]>(`/api/playlists/${playlistId}/tracks`)
    set({ tracks: data })
  },

  createPlaylist: async (name: string) => {
    const created = await api<{ id: string }>('/api/playlists', {
      method: 'POST',
      body: { name },
    })
    await get().fetchPlaylists()
    return created.id
  },

  deletePlaylist: async (id: string) => {
    await api(`/api/playlists/${id}`, { method: 'DELETE' })
    set((s) => ({
      playlists: s.playlists.filter((p) => p.id !== id),
      activePlaylistId: s.activePlaylistId === id ? null : s.activePlaylistId,
      tracks: s.activePlaylistId === id ? [] : s.tracks,
    }))
  },

  activatePlaylist: async (id: string) => {
    await api(`/api/playlists/${id}`, {
      method: 'PUT',
      body: { isActive: true },
    })
    set((s) => ({
      playlists: s.playlists.map((p) => ({ ...p, isActive: p.id === id })),
      activePlaylistId: id,
    }))
  },

  addTrack: async (playlistId: string, track) => {
    const result = await api<TrackMutationResponse>(
      `/api/playlists/${playlistId}/tracks`,
      { method: 'POST', body: track },
    )
    if (result.progression) {
      useAuthStore.getState().applyProgression(result.progression)
    }
    set((s) => ({
      tracks: [...s.tracks, result.track].sort(
        (a, b) => a.position - b.position,
      ),
    }))
  },

  addTrackFromUrl: async (playlistId: string, url: string) => {
    const result = await api<TrackMutationResponse>(
      `/api/playlists/${playlistId}/tracks`,
      { method: 'POST', body: { url } },
    )
    if (result.progression) {
      useAuthStore.getState().applyProgression(result.progression)
    }
    set((s) => ({
      tracks: [...s.tracks, result.track].sort(
        (a, b) => a.position - b.position,
      ),
    }))
  },

  removeTrack: async (playlistId: string, trackId: string) => {
    await api(`/api/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    })
    await get().fetchTracks(playlistId)
  },

  reorderTracks: async (playlistId, trackIds) => {
    await api(`/api/playlists/${playlistId}/tracks/reorder`, {
      method: 'PUT',
      body: { trackIds },
    })
    set((s) => ({
      tracks: trackIds
        .map((trackId, index) => {
          const track = s.tracks.find((item) => item.id === trackId)
          return track ? { ...track, position: index } : null
        })
        .filter((track): track is Track => track !== null),
    }))
  },
}))
