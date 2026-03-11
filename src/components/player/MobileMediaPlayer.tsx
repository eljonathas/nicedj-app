import { memo, useEffect, useRef } from 'react'
import { Music2 } from 'lucide-react'
import { getPlaybackPositionMs } from '../../lib/playback'
import { useRoomStore } from '../../stores/roomStore'

function formatTime(ms: number) {
  const safe = Math.max(0, ms)
  const m = Math.floor(safe / 60000)
  const s = Math.floor((safe % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

export const MobileMediaPlayer = memo(function MobileMediaPlayer() {
  const playback = useRoomStore((s) => s.playback)
  const barRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const bar = barRef.current
    const time = timeRef.current
    if (!bar || !time || !playback) return

    const update = () => {
      const pos = getPlaybackPositionMs(playback)
      const pct = playback.durationMs > 0 ? (pos / playback.durationMs) * 100 : 0
      bar.style.width = `${Math.min(100, pct)}%`
      time.textContent = `${formatTime(pos)} / ${formatTime(playback.durationMs)}`
    }

    update()
    if (playback.paused) return

    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [playback])

  if (!playback) return null

  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,16,24,0.88)] px-2.5 py-2">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[rgba(255,255,255,0.04)]">
        {playback.thumbnailUrl ? (
          <img
            src={playback.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
            <Music2 className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white">
          {playback.title}
        </p>
        <p className="truncate text-[10px] text-[var(--text-secondary)]">
          {playback.artist}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              ref={barRef}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#8fffb8)]"
              style={{ width: '0%' }}
            />
          </div>
          <span
            ref={timeRef}
            className="shrink-0 text-[9px] font-medium tabular-nums text-[var(--text-muted)]"
          />
        </div>
      </div>
    </div>
  )
})
