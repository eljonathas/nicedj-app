import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Heart,
  LogIn,
  LogOut as LogOutIcon,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useRef, useState } from 'react'
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

export function VoteBar() {
  const {
    handleVote,
    clientVote,
    votes,
  } = useVoteBarState()
  const [recentVote, setRecentVote] = useState<{
    type: VoteType
    nonce: number
  } | null>(null)
  const resetRecentVoteTimerRef = useRef<number | null>(null)

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

  return (
    <div className="rounded-[1.45rem] bg-[rgba(8,13,19,0.78)] p-1.5 shadow-[0_18px_34px_rgba(0,0,0,0.34)] backdrop-blur-[18px]">
      <div className="flex items-stretch gap-1.5">
        <VoteButton
          type="woot"
          value={votes.woots}
          compact
          isSelected={clientVote === 'woot'}
          interactionNonce={
            recentVote?.type === 'woot' ? recentVote.nonce : null
          }
          onClick={() => triggerVote('woot')}
        />
        <VoteButton
          type="grab"
          value={votes.grabs}
          compact
          isSelected={clientVote === 'grab'}
          interactionNonce={
            recentVote?.type === 'grab' ? recentVote.nonce : null
          }
          onClick={() => triggerVote('grab')}
        />
        <VoteButton
          type="meh"
          value={votes.mehs}
          compact
          isSelected={clientVote === 'meh'}
          interactionNonce={
            recentVote?.type === 'meh' ? recentVote.nonce : null
          }
          onClick={() => triggerVote('meh')}
        />
      </div>
    </div>
  )
}

export function QueueActionButton() {
  const { isInQueue, isCurrentDJ, handleToggleQueue } =
    useVoteBarState()

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={handleToggleQueue}
      className={`flex min-w-[200px] items-center justify-between gap-3 rounded-[1.35rem] border px-4 py-3 text-left shadow-[0_18px_34px_rgba(0,0,0,0.42)] backdrop-blur-[14px] transition-all ${isCurrentDJ
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
    </motion.button>
  )
}

function useVoteBarState() {
  const votes = useRoomStore((s) => s.votes)
  const queue = useRoomStore((s) => s.queue)
  const playbackDjId = useRoomStore((s) => s.playback?.djId)
  const clientVote = useRoomStore((s) => s.clientVote)
  const user = useAuthStore((s) => s.user)
  const wsClient = useAuthStore((s) => s.wsClient)

  const isInQueue = Boolean(user?.id && queue.includes(user.id))
  const isCurrentDJ = playbackDjId === user?.id

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
    clientVote,
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
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      className={`group relative isolate overflow-hidden rounded-[1rem] border transition-all duration-200 ${compact
        ? 'flex h-10 min-w-[64px] items-center justify-center gap-1.5 px-3'
        : 'flex h-11 flex-1 min-w-[88px] items-center justify-center gap-2 px-4'
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
            className={`block font-bold tabular-nums ${compact ? 'text-[12px]' : 'text-[14px]'
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
