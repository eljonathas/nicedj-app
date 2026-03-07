import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import {
  ArrowRight,
  Heart,
  LogIn,
  LogOut as LogOutIcon,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useRoomStore } from '../../stores/roomStore'
import { Button } from '../ui/Button'

interface VoteBarProps {
  showQueueAction?: boolean
  floating?: boolean
}

type VoteType = 'woot' | 'grab' | 'meh'

type VoteAppearance = {
  label: string
  helper: string
  icon: typeof ThumbsUp
  accentSoft: string
  text: string
  surface: string
  selectedSurface: string
  glow: string
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
  },
}

export function VoteBar({
  showQueueAction = true,
  floating = false,
}: VoteBarProps) {
  const {
    isInQueue,
    isCurrentDJ,
    queueLength,
    handleToggleQueue,
    handleVote,
    hasWooted,
    votes,
  } = useVoteBarState()
  const [recentVote, setRecentVote] = useState<{
    type: VoteType
    nonce: number
  } | null>(null)
  const resetRecentVoteTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetRecentVoteTimerRef.current !== null) {
        window.clearTimeout(resetRecentVoteTimerRef.current)
      }
    }
  }, [])

  const triggerVote = (type: VoteType) => {
    handleVote(type)
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

  if (floating) {
    return (
      <div className="rounded-[1.45rem] bg-[rgba(8,13,19,0.78)] p-1.5 shadow-[0_18px_34px_rgba(0,0,0,0.34)] backdrop-blur-[18px]">
        <div className="flex items-stretch gap-1.5">
          <VoteButton
            type="woot"
            value={votes.woots}
            compact
            isSelected={hasWooted || recentVote?.type === 'woot'}
            interactionNonce={
              recentVote?.type === 'woot' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('woot')}
          />
          <VoteButton
            type="grab"
            value={votes.grabs}
            compact
            isSelected={recentVote?.type === 'grab'}
            interactionNonce={
              recentVote?.type === 'grab' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('grab')}
          />
          <VoteButton
            type="meh"
            value={votes.mehs}
            compact
            isSelected={recentVote?.type === 'meh'}
            interactionNonce={
              recentVote?.type === 'meh' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('meh')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[1.65rem] bg-[rgba(8,13,19,0.8)] p-2.5 shadow-[0_20px_44px_rgba(0,0,0,0.34)] backdrop-blur-[20px]">
      <div className="flex w-full flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 items-center gap-3">
          {showQueueAction &&
            (isCurrentDJ ? (
              <Button variant="danger" onClick={handleToggleQueue}>
                Sair do booth
                <LogOutIcon className="h-4 w-4" />
              </Button>
            ) : isInQueue ? (
              <Button variant="secondary" onClick={handleToggleQueue}>
                Sair da fila
                <LogOutIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleToggleQueue}>
                Entrar na fila
                <LogIn className="h-4 w-4" />
              </Button>
            ))}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3 xl:max-w-[470px] xl:flex-none">
          <VoteButton
            type="woot"
            value={votes.woots}
            isSelected={hasWooted || recentVote?.type === 'woot'}
            interactionNonce={
              recentVote?.type === 'woot' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('woot')}
          />
          <VoteButton
            type="grab"
            value={votes.grabs}
            isSelected={recentVote?.type === 'grab'}
            interactionNonce={
              recentVote?.type === 'grab' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('grab')}
          />
          <VoteButton
            type="meh"
            value={votes.mehs}
            isSelected={recentVote?.type === 'meh'}
            interactionNonce={
              recentVote?.type === 'meh' ? recentVote.nonce : null
            }
            onClick={() => triggerVote('meh')}
          />
        </div>

        <div className="hidden min-w-[170px] items-center justify-end xl:flex">
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Fila
            </span>
            <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)]">
              <span className="tabular-nums">{queueLength}</span>
              {!isCurrentDJ && queueLength > 0 ? (
                <ArrowRight className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function QueueActionButton() {
  const { isInQueue, isCurrentDJ, handleToggleQueue, queueLength } =
    useVoteBarState()

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={handleToggleQueue}
      className={`flex min-w-[168px] items-center justify-between gap-3 rounded-[1.35rem] border px-4 py-3 text-left shadow-[0_18px_34px_rgba(0,0,0,0.42)] backdrop-blur-[14px] transition-all ${
        isCurrentDJ
          ? 'border-[rgba(255,97,88,0.3)] bg-[rgba(68,17,19,0.78)] text-[rgba(255,214,211,0.94)]'
          : isInQueue
            ? 'border-[rgba(255,255,255,0.14)] bg-[rgba(12,17,24,0.82)] text-white'
            : 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.82)] text-[var(--accent-hover)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-current/15 bg-black/15">
          {isCurrentDJ || isInQueue ? (
            <LogOutIcon className="h-4 w-4" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
        </div>
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
      </div>
      <span className="rounded-full border border-current/15 bg-black/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
        {isCurrentDJ ? 'No ar' : `Fila ${queueLength}`}
      </span>
    </motion.button>
  )
}

function useVoteBarState() {
  const votes = useRoomStore((s) => s.votes)
  const queue = useRoomStore((s) => s.queue)
  const playbackDjId = useRoomStore((s) => s.playback?.djId)
  const user = useAuthStore((s) => s.user)
  const wsClient = useAuthStore((s) => s.wsClient)

  const isInQueue = Boolean(user?.id && queue.includes(user.id))
  const isCurrentDJ = playbackDjId === user?.id
  const hasWooted = Boolean(
    user?.id && votes.wootUserIds.includes(user.id),
  )

  const handleVote = (type: VoteType) => {
    wsClient?.send('vote', { type })
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
    hasWooted,
    handleToggleQueue,
    handleVote,
  }
}

function VoteButton({
  type,
  value,
  onClick,
  compact = false,
  isSelected = false,
  interactionNonce,
}: {
  type: VoteType
  value: number
  onClick: () => void
  compact?: boolean
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
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
      whileTap={reduceMotion ? undefined : { scale: 0.975 }}
      className={`group relative isolate overflow-hidden rounded-[1.2rem] text-left transition-all duration-200 ${
        compact
          ? 'flex h-[82px] w-[76px] items-center justify-center p-2'
          : 'flex min-h-[82px] items-center p-3'
      }`}
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
            className="pointer-events-none absolute inset-[8px] rounded-[1rem]"
            style={{ backgroundColor: appearance.accentSoft }}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={`relative flex w-full ${
          compact
            ? 'flex-col items-center justify-center gap-1.5'
            : 'items-center gap-3'
        }`}
      >
        <motion.div
          animate={iconAnimation}
          transition={iconTransition}
          className={`relative flex shrink-0 items-center justify-center rounded-[0.95rem] ${
            compact ? 'h-10 w-10' : 'h-12 w-12'
          }`}
          style={{
            backgroundColor: isSelected
              ? appearance.accentSoft
              : 'rgba(255,255,255,0.055)',
            boxShadow: isSelected
              ? `0 10px 22px ${appearance.glow}`
              : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <Icon
            className={compact ? 'h-4 w-4' : 'h-4.5 w-4.5'}
            style={{ color: appearance.text }}
          />
        </motion.div>

        <div className={`min-w-0 ${compact ? 'text-center' : 'flex-1'}`}>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`block font-semibold uppercase tracking-[0.12em] ${
                compact ? 'text-[9px]' : 'text-[10px]'
              }`}
              style={{ color: appearance.text }}
            >
              {appearance.label}
            </span>
            {!compact ? (
              <span className="text-[10px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.42)]">
                {appearance.helper}
              </span>
            ) : null}
          </div>

          <div
            className={`mt-0.5 flex items-end ${
              compact ? 'justify-center gap-1' : 'justify-between gap-2'
            }`}
          >
            <div className="relative h-7 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${type}-${value}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.22 }}
                  className={`block font-bold tabular-nums ${
                    compact ? 'text-lg' : 'text-[1.05rem]'
                  }`}
                  style={{ color: '#f7fbff' }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </div>

            {!compact ? (
              <span className="text-[11px] font-medium text-[rgba(255,255,255,0.5)]">
                {value === 1 ? 'voto' : 'votos'}
              </span>
            ) : null}
          </div>
        </div>
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
    boxShadow: isSelected
      ? `0 16px 30px ${appearance.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
      : 'inset 0 1px 0 rgba(255,255,255,0.04)',
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
