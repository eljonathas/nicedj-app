// @vitest-environment jsdom

import { Profiler } from 'react'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomPlaylistDock } from './RoomFooter'
import { useAuthStore } from '../../stores/authStore'
import { usePlaylistStore } from '../../stores/playlistStore'
import { useRoomStore } from '../../stores/roomStore'
import { useUIStore } from '../../stores/uiStore'

describe('RoomPlaylistDock renders', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        username: 'mars',
        email: 'mars@example.com',
        avatar: null,
        avatarId: null,
        platformRole: null,
        level: 1,
        xp: 10,
      },
      isLoading: false,
      error: null,
      wsClient: null,
      initialized: true,
    })

    useRoomStore.setState({
      room: {
        id: 'room-1',
        name: 'Sala',
        slug: 'sala',
        description: '',
        ownerId: 'user-1',
        ownerUsername: 'mars',
        queueLocked: false,
      },
      users: [],
      queue: [],
      playback: {
        trackId: 'track-1',
        source: 'youtube',
        sourceId: 'yt-1',
        title: 'Track 1',
        artist: 'Artist 1',
        thumbnailUrl: '',
        durationMs: 180000,
        startedAtServerMs: 0,
        paused: false,
        pauseOffsetMs: 0,
        serverTimeMs: 0,
        djId: 'user-1',
        djUsername: 'mars',
        clientSyncAtMs: 0,
      },
      votes: {
        woots: 0,
        mehs: 0,
        grabs: 0,
        wootUserIds: [],
      },
      clientVote: null,
      clientGrabbed: false,
      clientGrabPlaylistId: null,
      isInQueue: false,
      wootBursts: {},
      errorMessage: null,
      playerVolume: 70,
      activeRoom: {
        id: 'room-1',
        name: 'Sala',
        slug: 'sala',
      },
    })

    usePlaylistStore.setState((state) => ({
      ...state,
      playlists: [
        {
          id: 'playlist-1',
          name: 'Minha playlist',
          isActive: true,
          userId: 'user-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      activePlaylistId: 'playlist-1',
      tracks: [
        {
          id: 'track-1',
          sourceId: 'yt-1',
          source: 'youtube',
          title: 'Track 1',
          artist: 'Artist 1',
          durationMs: 180000,
          thumbnailUrl: null,
          position: 0,
        },
        {
          id: 'track-2',
          sourceId: 'yt-2',
          source: 'youtube',
          title: 'Track 2',
          artist: 'Artist 2',
          durationMs: 180000,
          thumbnailUrl: null,
          position: 1,
        },
      ],
      loadedTracksPlaylistId: 'playlist-1',
      loading: false,
      fetchPlaylists: vi.fn(async () => {}),
      fetchTracks: vi.fn(async () => {}),
      activatePlaylist: vi.fn(async () => {}),
    }))

    useUIStore.setState({
      isMobile: false,
      isRoomCompactLayout: false,
      sidebarOpen: true,
      activePanel: 'chat',
      modalOpen: null,
      roomSidebarWidth: 336,
      floatingPanel: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not commit on votes or progression-only updates', () => {
    const commits: string[] = []

    render(
      <Profiler
        id="dock"
        onRender={() => {
          commits.push('dock')
        }}
      >
        <RoomPlaylistDock />
      </Profiler>,
    )

    commits.length = 0

    act(() => {
      useRoomStore.setState({
        votes: {
          woots: 1,
          mehs: 0,
          grabs: 0,
          wootUserIds: ['user-1'],
        },
        clientVote: 'woot',
        wootBursts: { 'user-1': Number.POSITIVE_INFINITY },
      })
    })

    expect(commits).toHaveLength(0)

    act(() => {
      useAuthStore.getState().applyProgression({
        level: 1,
        xp: 12,
      })
    })

    expect(commits).toHaveLength(0)
  })
})
