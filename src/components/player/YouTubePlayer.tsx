import { useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import type {
  YouTubeEvent,
  YouTubePlayer as YouTubePlayerApi,
} from 'react-youtube'
import { getPlaybackPositionMs } from '../../lib/playback'
import { useRoomStore } from '../../stores/roomStore'

export function YouTubePlayer() {
  const playback = useRoomStore((s) => s.playback)
  const playerVolume = useRoomStore((s) => s.playerVolume)
  const playerRef = useRef<YouTubePlayerApi | null>(null)
  const autoplayRetryRef = useRef(0)
  const autoplayTimerRef = useRef<number | null>(null)
  const pendingAutoplayRef = useRef(false)

  const clearAutoplayTimer = () => {
    if (autoplayTimerRef.current !== null) {
      window.clearTimeout(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }
  }

  const applyVolume = (player: YouTubePlayerApi) => {
    player.setVolume?.(playerVolume)

    if (playerVolume === 0) {
      player.mute?.()
      return
    }

    player.unMute?.()
  }

  const syncPlayback = (player: YouTubePlayerApi, shouldAutoplay: boolean) => {
    if (!playback) return

    const expectedSec = getPlaybackPositionMs(playback) / 1000
    const currentSec = player.getCurrentTime?.() || 0
    const drift = Math.abs(currentSec - expectedSec)

    if (drift > 2) {
      player.seekTo(expectedSec, true)
    }

    if (playback.paused) {
      pendingAutoplayRef.current = false
      clearAutoplayTimer()
      player.pauseVideo?.()
      return
    }

    pendingAutoplayRef.current = shouldAutoplay
    player.mute?.()

    player.playVideo?.()
  }

  const scheduleAutoplayRetry = (player: YouTubePlayerApi) => {
    if (!pendingAutoplayRef.current || autoplayRetryRef.current >= 4) {
      return
    }

    clearAutoplayTimer()
    autoplayRetryRef.current += 1
    autoplayTimerRef.current = window.setTimeout(() => {
      syncPlayback(player, true)
    }, 240)
  }

  useEffect(() => {
    if (!playerRef.current || !playback) return

    autoplayRetryRef.current = 0
    syncPlayback(playerRef.current, true)
  }, [playback])

  useEffect(() => {
    if (!playerRef.current) return

    if (playerVolume === 0) {
      playerRef.current.mute?.()
      playerRef.current.setVolume?.(0)
      return
    }

    playerRef.current.setVolume?.(playerVolume)
    if (!pendingAutoplayRef.current) {
      playerRef.current.unMute?.()
    }
  }, [playerVolume])

  useEffect(() => clearAutoplayTimer, [])

  if (!playback || playback.source !== 'youtube') return null

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    autoplayRetryRef.current = 0
    const iframe = event.target.getIframe?.()
    iframe?.setAttribute(
      'allow',
      'autoplay; encrypted-media; picture-in-picture',
    )
    iframe?.setAttribute('tabindex', '-1')
    iframe?.classList.add('pointer-events-none', 'select-none')

    syncPlayback(event.target, true)
  }

  const onStateChange = (event: YouTubeEvent<number>) => {
    if (!playback || playback.paused) {
      pendingAutoplayRef.current = false
      clearAutoplayTimer()
      return
    }

    if (event.data === 1) {
      pendingAutoplayRef.current = false
      autoplayRetryRef.current = 0
      clearAutoplayTimer()
      applyVolume(event.target)
      return
    }

    if (event.data === -1 || event.data === 2 || event.data === 5) {
      scheduleAutoplayRetry(event.target)
    }
  }

  return (
    <YouTube
      videoId={playback.sourceId}
      opts={{
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
      }}
      onReady={onReady}
      onStateChange={onStateChange}
      className="h-full w-full"
      iframeClassName="h-full w-full pointer-events-none select-none"
    />
  )
}
