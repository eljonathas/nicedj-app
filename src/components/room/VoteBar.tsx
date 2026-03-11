import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  Heart,
  ListMusic,
  Loader2,
  LogIn,
  LogOut as LogOutIcon,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { usePlaylistStore } from '../../stores/playlistStore'
import { useRoomStore } from '../../stores/roomStore'
import { useUIStore } from '../../stores/uiStore'
import { Button } from '../ui/Button'

type VoteBarVariant = 'floating' | 'inline' | 'compact' | 'sheet' | 'cta'

type VoteType = 'woot' | 'grab' | 'meh'
type PlaylistTrackRecord = {
  id: string
  source: 'youtube' | 'soundcloud'
  sourceId: string
}
const DUPLICATE_GRAB_MESSAGE = 'Essa música já está na playlist escolhida.'

type VoteAppearance = {
  label: string
  helper: string
  icon: typeof ThumbsUp
  accentSoft: string
  text: string
  surface: string
  selectedSurface: string
  glow: string
  borderActive: string
}

const VOTE_APPEARANCE: Record<VoteType, VoteAppearance> = {
  woot: {
    label: 'Woot',
    helper: 'apoios',
    icon: ThumbsUp,
    accentSoft: 'rgba(55,210,124,0.18)',
    text: '#93ffc0',
    surface: 'rgba(255,255,255,0.035)',
    selectedSurface:
      'linear-gradient(135deg, rgba(55,210,124,0.22) 0%, rgba(10,18,15,0.94) 100%)',
    glow: 'rgba(55,210,124,0.22)',
    borderActive: 'rgba(55,210,124,0.4)',
  },
  grab: {
    label: 'Grab',
    helper: 'salvos',
    icon: Heart,
    accentSoft: 'rgba(255,181,71,0.18)',
    text: '#ffd488',
    surface: 'rgba(255,255,255,0.035)',
    selectedSurface:
      'linear-gradient(135deg, rgba(255,181,71,0.24) 0%, rgba(20,15,10,0.94) 100%)',
    glow: 'rgba(255,181,71,0.2)',
    borderActive: 'rgba(255,181,71,0.4)',
  },
  meh: {
    label: 'Meh',
    helper: 'vaias',
    icon: ThumbsDown,
    accentSoft: 'rgba(255,97,88,0.18)',
    text: '#ffb0aa',
    surface: 'rgba(255,255,255,0.035)',
    selectedSurface:
      'linear-gradient(135deg, rgba(255,97,88,0.22) 0%, rgba(20,11,12,0.94) 100%)',
    glow: 'rgba(255,97,88,0.22)',
    borderActive: 'rgba(255,97,88,0.4)',
  },
}

export function VoteBar({
  variant = 'floating',
}: {
  variant?: VoteBarVariant
}) {
  const { handleVote, clientGrabbed, clientGrabPlaylistId, clientVote, votes } =
    useVoteBarState()
  const playback = useRoomStore((s) => s.playback)
  const openFloatingPanel = useUIStore((s) => s.openFloatingPanel)
  const {
    playlists,
    activePlaylistId,
    loading: playlistsLoading,
    fetchPlaylists,
    addTrack,
    removeTrack,
    grabUsesActivePlaylistByDefault,
  } = usePlaylistStore()
  const [recentVote, setRecentVote] = useState<{
    type: VoteType
    nonce: number
  } | null>(null)
  const [isGrabModalOpen, setIsGrabModalOpen] = useState(false)
  const [selectedGrabPlaylistId, setSelectedGrabPlaylistId] = useState<
    string | null
  >(null)
  const [isSavingGrab, setIsSavingGrab] = useState(false)
  const [isRemovingGrab, setIsRemovingGrab] = useState(false)
  const [grabError, setGrabError] = useState<string | null>(null)
  const [isGrabDuplicateSelection, setIsGrabDuplicateSelection] =
    useState(false)
  const [isValidatingGrabSelection, setIsValidatingGrabSelection] =
    useState(false)
  const [isGrabRemovalDialogOpen, setIsGrabRemovalDialogOpen] = useState(false)
  const resetRecentVoteTimerRef = useRef<number | null>(null)
  const grabbedPlaylistName =
    playlists.find((playlist) => playlist.id === clientGrabPlaylistId)?.name ??
    null

  useEffect(() => {
    if (!isGrabModalOpen || !selectedGrabPlaylistId || !playback) {
      setIsGrabDuplicateSelection(false)
      setIsValidatingGrabSelection(false)
      return
    }

    let cancelled = false
    setIsValidatingGrabSelection(true)
    setIsGrabDuplicateSelection(false)
    setGrabError((current) =>
      current === DUPLICATE_GRAB_MESSAGE ? null : current,
    )

    void findCurrentTrackInPlaylist(
      selectedGrabPlaylistId,
      playback.source,
      playback.sourceId,
    )
      .then((existingTrack) => {
        if (cancelled) {
          return
        }

        const isDuplicate = Boolean(existingTrack)
        setIsGrabDuplicateSelection(isDuplicate)

        if (isDuplicate) {
          setGrabError(DUPLICATE_GRAB_MESSAGE)
        } else {
          setGrabError((current) =>
            current === DUPLICATE_GRAB_MESSAGE ? null : current,
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsValidatingGrabSelection(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isGrabModalOpen, playback, selectedGrabPlaylistId])

  const markRecentVote = (type: VoteType) => {
    setRecentVote({
      type,
      nonce: Date.now(),
    })

    if (resetRecentVoteTimerRef.current !== null) {
      window.clearTimeout(resetRecentVoteTimerRef.current)
    }

    resetRecentVoteTimerRef.current = window.setTimeout(() => {
      setRecentVote((current) => (current?.type === type ? null : current))
    }, 900)
  }

  const saveCurrentTrackToPlaylist = async (
    playlistId: string,
    options?: { openModalOnError?: boolean },
  ) => {
    if (!playback) {
      return
    }

    setGrabError(null)
    setIsSavingGrab(true)

    try {
      const existingTrack = await findCurrentTrackInPlaylist(
        playlistId,
        playback.source,
        playback.sourceId,
      )
      if (existingTrack) {
        setIsGrabDuplicateSelection(true)
        setGrabError(DUPLICATE_GRAB_MESSAGE)

        if (options?.openModalOnError) {
          setIsGrabModalOpen(true)
        }
        return
      }

      await addTrack(playlistId, {
        sourceId: playback.sourceId,
        source: playback.source,
        title: playback.title,
        artist: playback.artist,
        durationMs: playback.durationMs,
        thumbnailUrl: playback.thumbnailUrl,
      })

      handleVote('grab', { active: true, playlistId })
      markRecentVote('grab')
      setIsGrabModalOpen(false)
      setIsGrabDuplicateSelection(false)
    } catch (error: any) {
      setGrabError(error.message || 'Não foi possível salvar a faixa.')

      if (options?.openModalOnError) {
        setIsGrabModalOpen(true)
      }
    } finally {
      setIsSavingGrab(false)
    }
  }

  const removeCurrentTrackFromGrab = async () => {
    if (!playback) {
      return
    }

    setGrabError(null)
    setIsRemovingGrab(true)

    try {
      if (clientGrabPlaylistId) {
        const existingTrack = await findCurrentTrackInPlaylist(
          clientGrabPlaylistId,
          playback.source,
          playback.sourceId,
        )

        if (existingTrack) {
          await removeTrack(clientGrabPlaylistId, existingTrack.id)
        }
      }

      handleVote('grab', { active: false })
      markRecentVote('grab')
      setIsGrabRemovalDialogOpen(false)
    } catch (error: any) {
      setGrabError(
        error.message || 'Não foi possível remover a faixa da playlist.',
      )
    } finally {
      setIsRemovingGrab(false)
    }
  }

  const triggerGrabFlow = async () => {
    if (!playback) {
      return
    }

    setGrabError(null)
    setIsGrabDuplicateSelection(false)

    if (clientGrabbed) {
      setIsGrabRemovalDialogOpen(true)
      return
    }

    if (playlists.length === 0) {
      await fetchPlaylists()
    }

    const {
      playlists: latestPlaylists,
      activePlaylistId: latestActivePlaylistId,
      grabUsesActivePlaylistByDefault: useActiveAsDefault,
    } = usePlaylistStore.getState()

    if (latestPlaylists.length === 0) {
      setSelectedGrabPlaylistId(null)
      setIsGrabModalOpen(true)
      return
    }

    const initialPlaylistId = latestActivePlaylistId ?? latestPlaylists[0].id

    setSelectedGrabPlaylistId(initialPlaylistId)

    if (useActiveAsDefault && latestActivePlaylistId) {
      await saveCurrentTrackToPlaylist(latestActivePlaylistId, {
        openModalOnError: true,
      })
      return
    }

    setIsGrabModalOpen(true)
  }

  const triggerVote = (type: VoteType) => {
    if (type === 'grab') {
      void triggerGrabFlow()
      return
    }

    handleVote(type)
    markRecentVote(type)
  }

  return (
    <>
      <div
        className={`backdrop-blur-[18px] ${
          variant === 'inline'
            ? ''
            : 'rounded-[1.45rem] p-1.5 bg-[rgba(8,13,19,0.78)] shadow-[0_18px_34px_rgba(0,0,0,0.34)]'
        }`}
      >
        <div className="flex items-stretch gap-1.5">
          <VoteButton
            type="woot"
            value={votes.woots}
            compact={variant === 'floating'}
            fill={variant === 'inline'}
            isSelected={clientVote === 'woot'}
            interactionNonce={
              recentVote?.type === 'woot' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('woot')}
          />
          <VoteButton
            type="grab"
            value={votes.grabs}
            compact={variant === 'floating'}
            fill={variant === 'inline'}
            isSelected={clientGrabbed}
            interactionNonce={
              recentVote?.type === 'grab' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('grab')}
          />
          <VoteButton
            type="meh"
            value={votes.mehs}
            compact={variant === 'floating'}
            fill={variant === 'inline'}
            isSelected={clientVote === 'meh'}
            interactionNonce={
              recentVote?.type === 'meh' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('meh')}
          />
        </div>
      </div>

      <GrabPlaylistModal
        isOpen={isGrabModalOpen}
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        selectedPlaylistId={selectedGrabPlaylistId}
        trackTitle={playback?.title ?? null}
        trackArtist={playback?.artist ?? null}
        isLoading={playlistsLoading || isSavingGrab}
        error={grabError}
        onClose={() => {
          if (isSavingGrab) {
            return
          }

          setIsGrabModalOpen(false)
          setGrabError(null)
          setIsGrabDuplicateSelection(false)
        }}
        onOpenPlaylists={() => {
          setIsGrabModalOpen(false)
          setGrabError(null)
          setIsGrabDuplicateSelection(false)
          openFloatingPanel('playlists')
        }}
        onSelectPlaylist={(playlistId) => {
          setSelectedGrabPlaylistId(playlistId)
          setGrabError(null)
          setIsGrabDuplicateSelection(false)
        }}
        isConfirmDisabled={
          isGrabDuplicateSelection || isValidatingGrabSelection
        }
        onConfirm={() => {
          if (!selectedGrabPlaylistId) {
            setGrabError('Selecione uma playlist para salvar a faixa.')
            return
          }

          void saveCurrentTrackToPlaylist(selectedGrabPlaylistId)
        }}
      />

      <GrabRemovalDialog
        isOpen={isGrabRemovalDialogOpen}
        playlistName={grabbedPlaylistName}
        trackTitle={playback?.title ?? null}
        trackArtist={playback?.artist ?? null}
        isLoading={isRemovingGrab}
        error={grabError}
        onClose={() => {
          if (isRemovingGrab) {
            return
          }

          setIsGrabRemovalDialogOpen(false)
          setGrabError(null)
        }}
        onConfirm={() => {
          void removeCurrentTrackFromGrab()
        }}
      />
    </>
  )
}

export function QueueActionButton({
  variant = 'floating',
}: {
  variant?: VoteBarVariant
}) {
  const { isInQueue, isCurrentDJ, handleToggleQueue } = useVoteBarState()

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={handleToggleQueue}
      className={`flex items-center border text-left backdrop-blur-[14px] transition-all ${
        variant === 'compact'
          ? 'min-w-0 justify-between gap-3 rounded-[1.35rem] px-3 py-2.5 shadow-[0_16px_28px_rgba(0,0,0,0.24)]'
          : variant === 'cta'
            ? 'h-11 w-full min-w-0 justify-start gap-2 rounded-[1.1rem] px-3 shadow-[0_12px_24px_rgba(0,0,0,0.16)]'
            : variant === 'sheet'
              ? 'min-w-0 justify-between gap-3 rounded-[1.35rem] px-3 py-2 shadow-none'
              : variant === 'inline'
                ? 'w-full min-w-0 justify-between gap-3 rounded-[1.35rem] px-4 py-3 shadow-[0_20px_38px_rgba(0,0,0,0.24)]'
                : 'min-w-[200px] justify-between gap-3 rounded-[1.35rem] px-4 py-3 shadow-[0_18px_34px_rgba(0,0,0,0.42)]'
      } ${
        isCurrentDJ
          ? 'border-[rgba(255,97,88,0.3)] bg-[rgba(68,17,19,0.78)] text-[rgba(255,214,211,0.94)]'
          : isInQueue
            ? 'border-[rgba(255,255,255,0.14)] bg-[rgba(12,17,24,0.82)] text-white'
            : 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.82)] text-[var(--accent-hover)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-2xl border border-current/15 bg-black/15 ${
            variant === 'compact'
              ? 'h-9 w-9'
              : variant === 'cta'
                ? 'h-7 w-7 rounded-xl'
                : variant === 'sheet'
                  ? 'h-8 w-8 rounded-xl'
                  : 'h-10 w-10'
          }`}
        >
          {isCurrentDJ || isInQueue ? (
            <LogOutIcon
              className={variant === 'cta' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
            />
          ) : (
            <LogIn className={variant === 'cta' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          )}
        </div>
        {variant === 'compact' ? (
          <div>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-current/70">
              Fila
            </span>
            <span className="block text-[12px] font-semibold">
              {isCurrentDJ ? 'Sair' : isInQueue ? 'Na fila' : 'Entrar'}
            </span>
          </div>
        ) : variant === 'cta' ? (
          <div className="min-w-0">
            <span className="block truncate text-[11px] font-semibold">
              {isCurrentDJ
                ? 'Sair do booth'
                : isInQueue
                  ? 'Sair da fila'
                  : 'Entrar na fila'}
            </span>
          </div>
        ) : variant === 'sheet' ? (
          <div>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-current/70">
              {isCurrentDJ ? 'Booth' : 'Fila'}
            </span>
            <span className="block text-[11px] font-semibold">
              {isCurrentDJ ? 'Sair' : isInQueue ? 'Na fila' : 'Entrar'}
            </span>
          </div>
        ) : (
          <div>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-current/70">
              {isCurrentDJ ? 'Booth ativo' : 'Sua vez'}
            </span>
            <span className="block text-[13px] font-semibold">
              {isCurrentDJ
                ? 'Sair do booth'
                : isInQueue
                  ? 'Sair da fila'
                  : 'Entrar na fila'}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  )
}

function useVoteBarState() {
  const votes = useRoomStore((s) => s.votes)
  const queue = useRoomStore((s) => s.queue)
  const playbackDjId = useRoomStore((s) => s.playback?.djId)
  const clientVote = useRoomStore((s) => s.clientVote)
  const clientGrabbed = useRoomStore((s) => s.clientGrabbed)
  const clientGrabPlaylistId = useRoomStore((s) => s.clientGrabPlaylistId)
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const wsClient = useAuthStore((s) => s.wsClient)

  const isInQueue = Boolean(currentUserId && queue.includes(currentUserId))
  const isCurrentDJ = playbackDjId === currentUserId

  const handleVote = (
    type: VoteType,
    options?: { active?: boolean; playlistId?: string | null },
  ) => {
    wsClient?.send('vote', {
      type,
      ...(typeof options?.active === 'boolean'
        ? { active: options.active }
        : {}),
      ...(options?.playlistId !== undefined
        ? { playlistId: options.playlistId }
        : {}),
    })
  }

  const handleToggleQueue = () => {
    if (isInQueue) {
      wsClient?.send('leave_queue')
      return
    }

    wsClient?.send('join_queue')
  }

  return {
    votes,
    isInQueue,
    isCurrentDJ,
    queueLength: queue.length,
    clientVote,
    clientGrabbed,
    clientGrabPlaylistId,
    handleToggleQueue,
    handleVote,
  }
}

async function findCurrentTrackInPlaylist(
  playlistId: string,
  source: 'youtube' | 'soundcloud',
  sourceId: string,
) {
  const tracks = await api<PlaylistTrackRecord[]>(
    `/api/playlists/${playlistId}/tracks`,
  )
  return (
    tracks.find(
      (track) => track.source === source && track.sourceId === sourceId,
    ) ?? null
  )
}

function GrabPlaylistModal({
  isOpen,
  playlists,
  activePlaylistId,
  selectedPlaylistId,
  trackTitle,
  trackArtist,
  isLoading,
  error,
  onClose,
  onOpenPlaylists,
  onSelectPlaylist,
  isConfirmDisabled,
  onConfirm,
}: {
  isOpen: boolean
  playlists: Array<{ id: string; name: string; isActive: boolean }>
  activePlaylistId: string | null
  selectedPlaylistId: string | null
  trackTitle: string | null
  trackArtist: string | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onOpenPlaylists: () => void
  onSelectPlaylist: (playlistId: string) => void
  isConfirmDisabled?: boolean
  onConfirm: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-lg rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.95),rgba(11,15,23,0.97))] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Grab
                  </p>
                  <h2 className="section-title mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                    <Sparkles className="h-5 w-5 text-[var(--accent-hover)]" />
                    Escolha a playlist
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Salve a faixa atual na playlist certa antes de confirmar o
                    grab.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-lg border border-[var(--border-light)] bg-[rgba(23,30,42,0.8)] text-[var(--text-secondary)] transition-colors hover:border-white/30 hover:text-white"
                  aria-label="Fechar modal"
                >
                  <X className="mx-auto h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-[1.25rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Tocando agora
                  </p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-white">
                    {trackTitle ?? 'Nenhuma faixa tocando agora'}
                  </p>
                  <p className="truncate text-[12px] text-[var(--text-secondary)]">
                    {trackArtist ?? 'Aguardando a próxima entrada'}
                  </p>
                </div>

                {playlists.length > 0 ? (
                  <div className="space-y-1.5">
                    {playlists.map((playlist) => {
                      const isSelected = playlist.id === selectedPlaylistId
                      const isActive = playlist.id === activePlaylistId

                      return (
                        <button
                          key={playlist.id}
                          type="button"
                          onClick={() => onSelectPlaylist(playlist.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-[rgba(53,35,14,0.62)] text-white ring-1 ring-[rgba(255,181,71,0.34)]'
                              : 'bg-[rgba(255,255,255,0.025)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]">
                              <ListMusic className="h-3.5 w-3.5" />
                            </div>
                            <p className="truncate text-[13px] font-semibold">
                              {playlist.name}
                            </p>
                          </div>

                          {isActive ? (
                            <span className="rounded-full border border-[rgba(55,210,124,0.18)] bg-[rgba(11,29,19,0.62)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-hover)]">
                              Ativa
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-5 text-center">
                    <p className="text-[13px] font-semibold text-white">
                      Você ainda não tem playlists
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                      Crie uma playlist para usar o grab como atalho de salvar
                      músicas durante a sessão.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-4"
                      onClick={onOpenPlaylists}
                    >
                      Abrir playlists
                    </Button>
                  </div>
                )}

                {error ? (
                  <div className="rounded-[1rem] border border-[rgba(255,97,88,0.28)] bg-[rgba(68,17,19,0.6)] px-4 py-3 text-sm font-medium text-[rgba(255,214,211,0.94)]">
                    {error}
                  </div>
                ) : null}

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={onConfirm}
                    disabled={
                      playlists.length === 0 ||
                      !selectedPlaylistId ||
                      isConfirmDisabled
                    }
                    isLoading={isLoading}
                  >
                    Confirmar grab
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function GrabRemovalDialog({
  isOpen,
  playlistName,
  trackTitle,
  trackArtist,
  isLoading,
  error,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  playlistName: string | null
  trackTitle: string | null
  trackArtist: string | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto w-full max-w-md rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.95),rgba(11,15,23,0.97))] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,181,71,0.22)] bg-[rgba(53,35,14,0.72)] text-[#ffd488]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Grab
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white">
                    Remover da playlist
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Desativar o grab vai remover esta faixa
                    {playlistName
                      ? ` da playlist ${playlistName}.`
                      : ' da playlist usada no grab.'}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Faixa
                </p>
                <p className="mt-1 truncate text-[14px] font-semibold text-white">
                  {trackTitle ?? 'Nenhuma faixa tocando agora'}
                </p>
                <p className="truncate text-[12px] text-[var(--text-secondary)]">
                  {trackArtist ?? 'Aguardando a próxima entrada'}
                </p>
              </div>

              {error ? (
                <div className="mt-4 rounded-[1rem] border border-[rgba(255,97,88,0.28)] bg-[rgba(68,17,19,0.6)] px-4 py-3 text-sm font-medium text-[rgba(255,214,211,0.94)]">
                  {error}
                </div>
              ) : null}

              <div className="mt-5 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="flex-1"
                  onClick={onConfirm}
                  isLoading={isLoading}
                >
                  Remover grab
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function VoteButton({
  type,
  value,
  onClick,
  compact = false,
  fill = false,
  isSelected = false,
  interactionNonce,
}: {
  type: VoteType
  value: number
  onClick: () => void
  compact?: boolean
  fill?: boolean
  isSelected?: boolean
  interactionNonce?: number | null
}) {
  const reduceMotion = useReducedMotion()
  const appearance = VOTE_APPEARANCE[type]
  const Icon = appearance.icon
  const buttonStyle = getVoteButtonStyle(appearance, isSelected)
  const iconAnimation = reduceMotion
    ? undefined
    : getVoteIconAnimation(type, interactionNonce)
  const iconTransition = reduceMotion
    ? undefined
    : {
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1] as const,
      }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      className={`group relative isolate overflow-hidden rounded-[1rem] border transition-all duration-200 ${
        compact
          ? 'flex h-10 min-w-[64px] items-center justify-center gap-1.5 px-3'
          : 'flex h-11 flex-1 min-w-[88px] items-center justify-center gap-2 px-4'
      } ${fill ? 'min-w-0 flex-1' : ''}`}
      style={buttonStyle}
    >
      <AnimatePresence>
        {interactionNonce ? (
          <motion.span
            key={`${type}-${interactionNonce}`}
            initial={{ opacity: 0.28, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.42 }}
            className="pointer-events-none absolute inset-[4px] rounded-[1rem]"
            style={{ backgroundColor: appearance.accentSoft }}
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        animate={iconAnimation}
        transition={iconTransition}
        className="relative flex items-center justify-center"
      >
        <Icon
          className={compact ? 'h-[14px] w-[14px]' : 'h-[16px] w-[16px]'}
          style={{
            color: isSelected ? appearance.text : 'rgba(255,255,255,0.6)',
            filter: isSelected
              ? `drop-shadow(0 2px 8px ${appearance.glow})`
              : undefined,
          }}
        />
      </motion.div>

      <div className="relative overflow-hidden text-left">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${type}-${value}`}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.22 }}
            className={`block font-bold tabular-nums ${
              compact ? 'text-[12px]' : 'text-[14px]'
            }`}
            style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)' }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  )
}

function getVoteButtonStyle(
  appearance: VoteAppearance,
  isSelected: boolean,
): CSSProperties {
  return {
    background: isSelected ? appearance.selectedSurface : appearance.surface,
    borderColor: isSelected
      ? appearance.borderActive
      : 'rgba(255,255,255,0.06)',
  }
}

function getVoteIconAnimation(
  type: VoteType,
  interactionNonce?: number | null,
) {
  if (!interactionNonce) {
    return {
      scale: 1,
      rotate: 0,
      y: 0,
    }
  }

  if (type === 'grab') {
    return {
      scale: [1, 1.18, 0.98, 1],
      rotate: [0, -10, 8, 0],
      y: [0, -2, 0],
    }
  }

  if (type === 'meh') {
    return {
      scale: [1, 1.14, 0.98, 1],
      rotate: [0, 8, -6, 0],
      y: [0, -1, 0],
    }
  }

  return {
    scale: [1, 1.18, 0.98, 1],
    rotate: [0, -8, 6, 0],
    y: [0, -2, 0],
  }
}
