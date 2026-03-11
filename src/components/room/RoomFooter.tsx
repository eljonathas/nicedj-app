import {
  Disc3,
  ListMusic,
  Music2,
  PencilLine,
  Radio,
  SkipForward,
  User2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { getPlaybackPositionMs } from '../../lib/playback'
import { getLevelProgress } from '../../lib/progression'
import { useAuthStore } from '../../stores/authStore'
import { usePlaylistStore } from '../../stores/playlistStore'
import { useRoomStore } from '../../stores/roomStore'
import { useUIStore } from '../../stores/uiStore'
import { Avatar } from '../ui/Avatar'

export const RoomTopBar = memo(function RoomTopBar({
  roomName,
  hostName,
  activeUsersCount,
  errorMessage,
}: {
  roomName: string
  hostName: string
  activeUsersCount: number
  errorMessage?: string | null
}) {
  const hasPlayback = useRoomStore((s) => Boolean(s.playback))
  const playbackTitle = useRoomStore(
    (s) => s.playback?.title ?? 'Sem set no ar',
  )
  const playbackArtist = useRoomStore(
    (s) => s.playback?.artist ?? 'Aguardando o próximo DJ',
  )
  const playerVolume = useRoomStore((s) => s.playerVolume)
  const setPlayerVolume = useRoomStore((s) => s.setPlayerVolume)
  const volumeIcon = playerVolume === 0 ? VolumeX : Volume2
  const VolumeIcon = volumeIcon

  return (
    <div className="flex flex-col gap-3 px-4 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:px-5 md:py-0">
      <div className="flex items-center gap-3 md:w-100">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-white">
            {roomName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--text-muted)]">
            <span className="truncate">Host {hostName}</span>
            <span className="text-[rgba(255,255,255,0.22)]">•</span>
            <span>{activeUsersCount} ao vivo</span>
            {errorMessage ? (
              <span className="truncate rounded-full border border-[rgba(255,97,88,0.26)] bg-[rgba(68,17,19,0.78)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(255,214,211,0.94)]">
                {errorMessage}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid w-full gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.92)] text-[var(--text-muted)]">
            {hasPlayback ? (
              <Music2 className="h-4 w-4" />
            ) : (
              <Disc3 className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">
              {playbackTitle}
            </p>
            <p className="truncate text-[11px] text-[var(--text-secondary)]">
              {playbackArtist}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PlaybackTimecode />
            <div className="flex items-center gap-3">
              <VolumeIcon className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
              <input
                type="range"
                min={0}
                max={100}
                value={playerVolume}
                onChange={(event) =>
                  setPlayerVolume(Number(event.target.value))
                }
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[rgba(255,255,255,0.12)] accent-[var(--accent)]"
                aria-label="Volume do player"
              />
              <span className="w-9 shrink-0 text-right text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                {playerVolume}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

const PlaybackTimecode = memo(function PlaybackTimecode() {
  const playback = useRoomStore((s) => s.playback)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const label = labelRef.current
    if (!label) {
      return
    }

    const updateLabel = () => {
      const currentPositionMs = playback
        ? getPlaybackPositionMs(playback, Date.now())
        : 0

      label.textContent = `${formatTime(currentPositionMs)} / ${formatTime(
        playback?.durationMs ?? 0,
      )}`
    }

    updateLabel()

    if (!playback || playback.paused) {
      return
    }

    const timer = window.setInterval(updateLabel, 1000)
    return () => window.clearInterval(timer)
  }, [
    playback,
    playback?.paused,
    playback?.pauseOffsetMs,
    playback?.startedAtServerMs,
    playback?.trackId,
    playback?.durationMs,
  ])

  return (
    <span
      ref={labelRef}
      className="shrink-0 text-[11px] font-medium tabular-nums text-[var(--text-secondary)]"
    />
  )
})

export const RoomPlaylistDock = memo(function RoomPlaylistDock() {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const playbackTrackId = useRoomStore((s) => s.playback?.trackId)
  const openFloatingPanel = useUIStore((s) => s.openFloatingPanel)
  const playlists = usePlaylistStore((s) => s.playlists)
  const tracks = usePlaylistStore((s) => s.tracks)
  const activePlaylistId = usePlaylistStore((s) => s.activePlaylistId)
  const loading = usePlaylistStore((s) => s.loading)
  const fetchPlaylists = usePlaylistStore((s) => s.fetchPlaylists)
  const fetchTracks = usePlaylistStore((s) => s.fetchTracks)
  const activatePlaylist = usePlaylistStore((s) => s.activatePlaylist)
  const [changingPlaylist, setChangingPlaylist] = useState(false)

  useEffect(() => {
    if (!userId) return
    void fetchPlaylists()
  }, [fetchPlaylists, userId])

  useEffect(() => {
    if (!activePlaylistId) return
    void fetchTracks(activePlaylistId)
  }, [activePlaylistId, fetchTracks])

  const activePlaylist =
    playlists.find((playlist) => playlist.id === activePlaylistId) ?? null
  const upcomingTrack = useMemo(() => {
    if (tracks.length === 0) return null

    if (!playbackTrackId) {
      return tracks[0]
    }

    const currentIndex = tracks.findIndex(
      (track) => track.id === playbackTrackId,
    )
    if (currentIndex < 0) {
      return tracks[0]
    }

    return tracks[currentIndex + 1] ?? null
  }, [playbackTrackId, tracks])

  const handlePlaylistChange = async (playlistId: string) => {
    if (!playlistId || playlistId === activePlaylistId) return

    setChangingPlaylist(true)
    try {
      await activatePlaylist(playlistId)
      await fetchTracks(playlistId)
    } finally {
      setChangingPlaylist(false)
    }
  }

  return (
    <div className="flex min-h-19 items-center gap-8 overflow-hidden px-4 py-2.5 md:h-19.5 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {playlists.length > 0 ? (
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.86)] px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]">
              <ListMusic className="h-4 w-4" />
            </div>
            <div className="hidden items-center gap-1 rounded-full border border-[rgba(55,210,124,0.18)] bg-[rgba(11,29,19,0.72)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-hover)] md:inline-flex">
              <Radio className="h-3 w-3" />
              Ativa
            </div>
            <div className="min-w-0 w-45">
              <select
                value={activePlaylistId ?? ''}
                onChange={(event) =>
                  void handlePlaylistChange(event.target.value)
                }
                disabled={changingPlaylist}
                className="h-9 w-full bg-transparent pr-1 text-[12px] font-medium text-white outline-none"
                aria-label="Playlist ativa"
              >
                {!activePlaylistId && (
                  <option value="" disabled>
                    Selecione uma playlist
                  </option>
                )}
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => openFloatingPanel('playlists')}
              title="Editar playlists"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] transition-colors hover:text-white"
            >
              <PencilLine className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex h-11 items-center gap-2 rounded-[1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.86)] px-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]">
              <ListMusic className="h-4 w-4" />
            </div>
            <span className="text-[12px] text-[var(--text-secondary)]">
              Sem playlist
            </span>
            <button
              type="button"
              onClick={() => openFloatingPanel('playlists')}
              title="Criar playlists"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] transition-colors hover:text-white"
            >
              <PencilLine className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]">
          <SkipForward className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Próxima faixa
          </p>
          {loading && !activePlaylist ? (
            <p className="truncate text-[12px] text-[var(--text-secondary)]">
              Carregando playlists...
            </p>
          ) : upcomingTrack ? (
            <>
              <p className="truncate text-[13px] font-semibold text-white">
                {upcomingTrack.title}
              </p>
              <p className="truncate text-[11px] text-[var(--text-secondary)]">
                {upcomingTrack.artist}
              </p>
            </>
          ) : activePlaylist ? (
            <p className="truncate text-[13px] font-semibold text-white">
              {activePlaylist.name}
            </p>
          ) : (
            <p className="truncate text-[12px] text-[var(--text-secondary)]">
              Selecione uma playlist ativa.
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

export function RoomProfileDock({
  collapsed = false,
}: {
  collapsed?: boolean
}) {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const username = useAuthStore((s) => s.user?.username ?? null)
  const avatar = useAuthStore((s) => s.user?.avatar ?? null)
  const level = useAuthStore((s) => s.user?.level ?? 0)
  const xp = useAuthStore((s) => s.user?.xp ?? 0)
  const openFloatingPanel = useUIStore((s) => s.openFloatingPanel)

  if (!userId || !username) return null

  const { progressPct, nextThreshold } = getLevelProgress(level, xp)

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() =>
          openFloatingPanel('profile', {
            profileId: userId,
          })
        }
        title={username}
        className="block rounded-full border-0 bg-transparent p-0 cursor-pointer"
      >
        <Avatar
          username={username}
          src={avatar}
          size="sm"
          className="h-9 w-9 text-sm"
        />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 h-[78px]">
      <button
        type="button"
        onClick={() =>
          openFloatingPanel('profile', {
            profileId: userId,
          })
        }
        className="shrink-0 rounded-full border-0 bg-transparent p-0 cursor-pointer"
      >
        <Avatar
          username={username}
          src={avatar}
          size="md"
          className="h-11 w-11 text-sm"
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-[13px] font-semibold text-white">
            {username}
          </p>
          <span className="rounded-full border text-[10px] border-[rgba(55,210,124,0.18)] bg-[rgba(11,29,19,0.72)] px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-[var(--accent-hover)]">
            Lv {level}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#8fffb8)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between truncate text-[10px] text-(--text-muted)">
          <span>{xp} XP</span>
          <span>{nextThreshold} XP</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          openFloatingPanel('profile', {
            profileId: userId,
          })
        }
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.6)] px-3 text-[12px] font-semibold text-[var(--text-secondary)] transition-colors hover:text-white"
      >
        <User2 className="h-3.5 w-3.5" />
        Perfil
      </button>
    </div>
  )
}

function formatTime(durationMs: number) {
  const safeDuration = Math.max(0, durationMs)
  const minutes = Math.floor(safeDuration / 60000)
  const seconds = Math.floor((safeDuration % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
