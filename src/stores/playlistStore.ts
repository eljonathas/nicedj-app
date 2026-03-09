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
  loadedTracksPlaylistId: string | null
  loading: boolean
  grabUsesActivePlaylistByDefault: boolean

  fetchPlaylists: () => Promise<void>
  fetchTracks: (playlistId: string) => Promise<void>
  createPlaylist: (name: string) => Promise<string>
  deletePlaylist: (id: string) => Promise<void>
  activatePlaylist: (id: string) => Promise<void>
  setGrabUsesActivePlaylistByDefault: (value: boolean) => void
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

const GRAB_ACTIVE_PLAYLIST_STORAGE_KEY =
  'nicedj:grab-use-active-playlist-by-default'

function getInitialGrabUsesActivePlaylistByDefault() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.localStorage.getItem(GRAB_ACTIVE_PLAYLIST_STORAGE_KEY) === 'true'
  )
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  activePlaylistId: null,
  tracks: [],
  loadedTracksPlaylistId: null,
  loading: false,
  grabUsesActivePlaylistByDefault:
    getInitialGrabUsesActivePlaylistByDefault(),

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
    set({ tracks: data, loadedTracksPlaylistId: playlistId })
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
      tracks:
        s.activePlaylistId === id || s.loadedTracksPlaylistId === id
          ? []
          : s.tracks,
      loadedTracksPlaylistId:
        s.loadedTracksPlaylistId === id ? null : s.loadedTracksPlaylistId,
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

  setGrabUsesActivePlaylistByDefault: (value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        GRAB_ACTIVE_PLAYLIST_STORAGE_KEY,
        String(value),
      )
    }

    set({ grabUsesActivePlaylistByDefault: value })
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
      tracks:
        s.loadedTracksPlaylistId === playlistId
          ? [...s.tracks, result.track].sort((a, b) => a.position - b.position)
          : s.tracks,
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
      tracks:
        s.loadedTracksPlaylistId === playlistId
          ? [...s.tracks, result.track].sort((a, b) => a.position - b.position)
          : s.tracks,
    }))
  },

  removeTrack: async (playlistId: string, trackId: string) => {
    await api(`/api/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    })

    if (get().loadedTracksPlaylistId === playlistId) {
      await get().fetchTracks(playlistId)
    }
  },

  reorderTracks: async (playlistId, trackIds) => {
    await api(`/api/playlists/${playlistId}/tracks/reorder`, {
      method: 'PUT',
      body: { trackIds },
    })
    set((s) => ({
      tracks:
        s.loadedTracksPlaylistId === playlistId
          ? trackIds
              .map((trackId, index) => {
                const track = s.tracks.find((item) => item.id === trackId)
                return track ? { ...track, position: index } : null
              })
              .filter((track): track is Track => track !== null)
          : s.tracks,
    }))
  },
}))
