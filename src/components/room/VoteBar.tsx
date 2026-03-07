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
  accent: string
  accentSoft: string
  border: string
  text: string
  background: string
  glow: string
}

const VOTE_APPEARANCE: Record<VoteType, VoteAppearance> = {
  woot: {
    label: 'Woot',
    helper: 'apoios',
    icon: ThumbsUp,
    accent: '#37d27c',
    accentSoft: 'rgba(55,210,124,0.16)',
    border: 'rgba(55,210,124,0.24)',
    text: '#93ffc0',
    background:
      'linear-gradient(180deg, rgba(12,28,20,0.96) 0%, rgba(8,16,13,0.94) 100%)',
    glow: 'rgba(55,210,124,0.22)',
  },
  grab: {
    label: 'Grab',
    helper: 'salvos',
    icon: Heart,
    accent: '#ffb547',
    accentSoft: 'rgba(255,181,71,0.16)',
    border: 'rgba(255,181,71,0.24)',
    text: '#ffd488',
    background:
      'linear-gradient(180deg, rgba(35,25,12,0.96) 0%, rgba(18,13,8,0.94) 100%)',
    glow: 'rgba(255,181,71,0.2)',
  },
  meh: {
    label: 'Meh',
    helper: 'vaias',
    icon: ThumbsDown,
    accent: '#ff6158',
    accentSoft: 'rgba(255,97,88,0.16)',
    border: 'rgba(255,97,88,0.24)',
    text: '#ffb0aa',
    background:
      'linear-gradient(180deg, rgba(37,16,18,0.96) 0%, rgba(18,9,10,0.94) 100%)',
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
      <div className="relative overflow-hidden rounded-[1.55rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(9,14,20,0.9)_0%,rgba(7,11,17,0.84)_100%)] p-2 shadow-[0_22px_42px_rgba(0,0,0,0.42)] backdrop-blur-[18px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,180,255,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(55,210,124,0.08),transparent_38%)]" />
        <div className="relative flex items-stretch gap-2">
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
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(180deg,rgba(9,14,20,0.92)_0%,rgba(7,11,17,0.86)_100%)] p-3 shadow-[0_24px_48px_rgba(0,0,0,0.38)] backdrop-blur-[18px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(130,170,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,181,71,0.08),transparent_32%)]" />
      <div className="relative flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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

        <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3 xl:max-w-[470px] xl:flex-none">
          <VoteButton
            type="woot"
            value={votes.woots}
            isSelected={hasWooted || recentVote?.type === 'woot'}
            interactionNonce={recentVote?.type === 'woot' ? recentVote.nonce : null}
            onClick={() => triggerVote('woot')}
          />
          <VoteButton
            type="grab"
            value={votes.grabs}
            isSelected={recentVote?.type === 'grab'}
            interactionNonce={recentVote?.type === 'grab' ? recentVote.nonce : null}
            onClick={() => triggerVote('grab')}
          />
          <VoteButton
            type="meh"
            value={votes.mehs}
            isSelected={recentVote?.type === 'meh'}
            interactionNonce={recentVote?.type === 'meh' ? recentVote.nonce : null}
            onClick={() => triggerVote('meh')}
          />
        </div>

        <div className="hidden min-w-[170px] items-center justify-end xl:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(14,19,27,0.86)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[0_12px_26px_rgba(0,0,0,0.28)]">
            <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Fila
            </span>
            <span>{queueLength}</span>
            {!isCurrentDJ && queueLength > 0 ? (
              <ArrowRight className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
            ) : null}
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
      className={`group relative isolate overflow-hidden rounded-[1.25rem] border text-left transition-all ${
        compact
          ? 'flex h-[84px] w-[76px] items-center justify-center p-2'
          : 'flex min-h-[84px] items-center p-3'
      }`}
      style={buttonStyle}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_42%)]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
      />

      <AnimatePresence>
        {interactionNonce ? (
          <motion.span
            key={`${type}-${interactionNonce}`}
            initial={{ opacity: 0.38, scale: 0.62 }}
            animate={{ opacity: 0, scale: 1.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.42 }}
            className="pointer-events-none absolute inset-[10px] rounded-[1rem] border"
            style={{ borderColor: appearance.border }}
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
          className={`relative flex shrink-0 items-center justify-center rounded-[1rem] border ${
            compact ? 'h-10 w-10' : 'h-12 w-12'
          }`}
          style={{
            backgroundColor: appearance.accentSoft,
            borderColor: appearance.border,
            boxShadow: isSelected ? `0 0 0 1px ${appearance.border}` : undefined,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 65%)',
            }}
          />
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
    borderColor: isSelected
      ? appearance.accent
      : appearance.border,
    background: appearance.background,
    boxShadow: isSelected
      ? `0 18px 34px ${appearance.glow}`
      : '0 16px 28px rgba(0,0,0,0.28)',
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
