import { useEffect, useMemo, useState } from 'react'
import { useRoomStore } from '../../stores/roomStore'

interface StageUser {
  id: string
  username: string
  avatar: string | null
  role: string
}

interface StageProps {
  users: StageUser[]
  djId?: string
}

type PositionedUser = {
  user: StageUser
  xPct: number
  yPct: number
  scale: number
  zIndex: number
}

const SPRITE_SHEETS = [
  '/sprites/classic04.2dfe383e.png',
  '/sprites/classic10.ab150e5e.png',
  '/sprites/classic11.0e7f433a.png',
] as const

const STAGE_BACKGROUND = '/stages/default.b9f5c461.jpg'
const MAX_STAGE_CHARACTERS = 90
const SPRITE_FRAME_WIDTH = 150
const SPRITE_FRAME_HEIGHT = 150
const SPRITE_FRAME_COUNT = 24
const WOOT_FPS = 14
const DJ_WOOT_FPS = 17
const CROWD_ROWS = [
  { yPct: 42.5, scale: 0.4, maxSlots: 8, widthPct: 24, zIndex: 72 },
  { yPct: 45.8, scale: 0.46, maxSlots: 10, widthPct: 30, zIndex: 76 },
  { yPct: 49.2, scale: 0.53, maxSlots: 12, widthPct: 38, zIndex: 80 },
  { yPct: 52.6, scale: 0.61, maxSlots: 15, widthPct: 48, zIndex: 84 },
  { yPct: 56.1, scale: 0.7, maxSlots: 18, widthPct: 60, zIndex: 88 },
  { yPct: 59.4, scale: 0.8, maxSlots: 27, widthPct: 74, zIndex: 92 },
] as const

export function Stage({ users, djId }: StageProps) {
  const wootBursts = useRoomStore((s) => s.wootBursts)
  const hasActivePlayback = Boolean(useRoomStore((s) => s.playback))
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const tickTimer = window.setInterval(() => setNowMs(Date.now()), 1000 / 24)

    return () => {
      window.clearInterval(tickTimer)
    }
  }, [])

  const dj = useMemo(
    () => users.find((user) => user.id === djId) ?? null,
    [djId, users],
  )

  const crowdUsers = useMemo(() => {
    const maxCrowd = dj ? MAX_STAGE_CHARACTERS - 1 : MAX_STAGE_CHARACTERS
    return users.filter((user) => user.id !== djId).slice(0, maxCrowd)
  }, [dj, djId, users])

  const crowdLayout = useMemo(() => buildCrowdLayout(crowdUsers), [crowdUsers])

  return (
    <section className="relative h-full min-h-0 w-full overflow-hidden border-t border-[rgba(255,255,255,0.08)] bg-[#090d14]">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${STAGE_BACKGROUND})`,
          backgroundPosition: 'center bottom',
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.62)_0%,rgba(8,12,18,0.38)_35%,rgba(8,11,17,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-100px_120px_rgba(0,0,0,0.64)]" />

      <div className="pointer-events-none absolute left-1/2 top-2 z-[120] -translate-x-1/2">
        <div className="rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(8,12,18,0.78)] px-3 py-1 shadow-[0_14px_28px_rgba(0,0,0,0.42)] backdrop-blur-[6px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Usuários {Math.min(users.length, MAX_STAGE_CHARACTERS)}/
            {MAX_STAGE_CHARACTERS}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 max-w-8/12 mx-auto">
        {crowdLayout.map((entry) => (
          <SpriteCharacter
            key={entry.user.id}
            user={entry.user}
            xPct={entry.xPct}
            yPct={entry.yPct}
            scale={entry.scale}
            zIndex={entry.zIndex}
            nowMs={nowMs}
            isWooting={hasActivePlayback && Boolean(wootBursts[entry.user.id])}
          />
        ))}
      </div>

      {dj ? (
        <SpriteCharacter
          user={dj}
          xPct={50}
          yPct={67}
          scale={1.06}
          zIndex={110}
          nowMs={nowMs}
          isWooting={hasActivePlayback && Boolean(wootBursts[dj.id])}
          isDj
        />
      ) : (
        <div className="pointer-events-none absolute left-1/2 top-[65%] z-[110] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(10,15,22,0.75)] px-4 py-2 text-[11px] font-semibold text-[var(--text-muted)] shadow-[0_16px_32px_rgba(0,0,0,0.5)] backdrop-blur-[6px]">
          Aguardando DJ
        </div>
      )}
    </section>
  )
}

function SpriteCharacter({
  user,
  xPct,
  yPct,
  scale,
  zIndex,
  nowMs,
  isWooting,
  isDj = false,
}: {
  user: StageUser
  xPct: number
  yPct: number
  scale: number
  zIndex: number
  nowMs: number
  isWooting: boolean
  isDj?: boolean
}) {
  const seed = hashToInt(user.id)
  const spriteSheet = SPRITE_SHEETS[seed % SPRITE_SHEETS.length]
  const fps = isDj ? DJ_WOOT_FPS : WOOT_FPS
  const frame = isWooting
    ? Math.floor(((nowMs + (seed % 1200)) / 1000) * fps) % SPRITE_FRAME_COUNT
    : seed % SPRITE_FRAME_COUNT
  const bounce = isWooting ? Math.sin((nowMs + seed) / 92) * (isDj ? 8 : 6) : 0
  const lean = isWooting ? Math.sin((nowMs + seed) / 170) * (isDj ? 4 : 3) : 0
  const brightness = isWooting ? 1.08 : 1

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        zIndex,
        transform: 'translate(-50%, -50%)',
      }}
      title={user.username}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-[71%] h-3 rounded-full bg-[rgba(0,0,0,0.56)] blur-[1.5px]"
        style={{
          width: `${54 * scale}px`,
          transform: 'translateX(-50%)',
        }}
      />

      <div
        className={
          isDj
            ? 'drop-shadow-[0_22px_30px_rgba(0,0,0,0.62)]'
            : 'drop-shadow-[0_18px_25px_rgba(0,0,0,0.56)]'
        }
        style={{
          width: SPRITE_FRAME_WIDTH,
          height: SPRITE_FRAME_HEIGHT,
          backgroundImage: `url(${spriteSheet})`,
          backgroundSize: `${SPRITE_FRAME_WIDTH * SPRITE_FRAME_COUNT}px ${SPRITE_FRAME_HEIGHT}px`,
          backgroundPosition: `-${frame * SPRITE_FRAME_WIDTH}px center`,
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${bounce}px) scale(${scale}) rotate(${lean}deg)`,
          transformOrigin: '50% 86%',
          filter: `brightness(${brightness})`,
          willChange: 'transform, background-position',
        }}
      />

      <div className="mt-[-3px] flex justify-center">
        <span
          className={`max-w-[98px] truncate rounded-full border px-2 py-0.5 text-center text-[10px] font-semibold shadow-[0_10px_18px_rgba(0,0,0,0.4)] ${
            isDj
              ? 'border-[rgba(29,185,84,0.42)] bg-[rgba(11,29,19,0.9)] text-[var(--accent-hover)]'
              : 'border-[rgba(255,255,255,0.14)] bg-[rgba(7,11,17,0.82)] text-[var(--text-secondary)]'
          }`}
        >
          {user.username}
        </span>
      </div>
    </div>
  )
}

function buildCrowdLayout(users: StageUser[]): PositionedUser[] {
  const count = users.length
  if (count === 0) return []

  const rowsNeeded =
    count <= 8
      ? 1
      : count <= 20
        ? 2
        : count <= 36
          ? 3
          : count <= 51
            ? 4
            : count <= 69
              ? 5
              : 6
  const activeRows = CROWD_ROWS.slice(CROWD_ROWS.length - rowsNeeded)
  const rowCounts = distributeUsersAcrossRows(count, activeRows)
  const positions: PositionedUser[] = []
  let cursor = 0

  activeRows.forEach((row, rowIndex) => {
    const rowUsers = users.slice(cursor, cursor + rowCounts[rowIndex])
    cursor += rowUsers.length

    rowUsers.forEach((user, slotIndex) => {
      const seed = hashToInt(user.id)
      const rowUnit =
        rowUsers.length === 1 ? 0.5 : slotIndex / (rowUsers.length - 1)
      const centeredOffset = rowUnit - 0.5
      const jitterX = ((seed % 1000) / 1000 - 0.5) * 1.8
      const jitterY = (((seed >> 10) % 1000) / 1000 - 0.5) * 0.9
      const arcLift = Math.abs(centeredOffset) * 3.2
      const xPct = clamp(50 + centeredOffset * row.widthPct + jitterX, 10, 90)
      const yPct = clamp(row.yPct - arcLift + jitterY, 39, 62)
      const scale = clamp(
        row.scale + (((seed >> 20) % 100) / 100 - 0.5) * 0.04,
        0.36,
        0.86,
      )

      positions.push({
        user,
        xPct,
        yPct,
        scale,
        zIndex: row.zIndex,
      })
    })
  })

  return positions
}

function distributeUsersAcrossRows(
  totalUsers: number,
  rows: readonly (typeof CROWD_ROWS)[number][],
) {
  const counts = Array.from({ length: rows.length }, () => 0)
  const order: number[] = []

  for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex -= 1) {
    for (let repeat = 0; repeat < rowIndex + 1; repeat += 1) {
      order.push(rowIndex)
    }
  }

  let remaining = totalUsers

  while (remaining > 0) {
    let placedOnCycle = false

    for (const rowIndex of order) {
      if (remaining === 0) break
      if (counts[rowIndex] >= rows[rowIndex].maxSlots) continue

      counts[rowIndex] += 1
      remaining -= 1
      placedOnCycle = true
    }

    if (!placedOnCycle) {
      break
    }
  }

  return counts
}

function hashToInt(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
