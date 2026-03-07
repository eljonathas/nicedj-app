import { useEffect, useRef } from 'react'
import YouTube, {
  type YouTubeEvent,
  type YouTubePlayer as YouTubePlayerApi,
} from 'react-youtube'
import { getPlaybackPositionMs } from '../../lib/playback'
import { useRoomStore } from '../../stores/roomStore'

export function YouTubePlayer() {
  const playback = useRoomStore((s) => s.playback)
  const playerVolume = useRoomStore((s) => s.playerVolume)
  const playerRef = useRef<YouTubePlayerApi | null>(null)

  const syncPlayback = (player: YouTubePlayerApi, shouldAutoplay: boolean) => {
    if (!playback) return

    const expectedSec = getPlaybackPositionMs(playback) / 1000
    const currentSec = player.getCurrentTime?.() || 0
    const drift = Math.abs(currentSec - expectedSec)

    if (drift > 2) {
      player.seekTo(expectedSec, true)
    }

    if (playback.paused) {
      player.pauseVideo?.()
      return
    }

    if (shouldAutoplay && playerVolume > 0) {
      player.mute?.()
    }

    player.playVideo?.()

    if (shouldAutoplay && playerVolume > 0) {
      window.setTimeout(() => {
        player.unMute?.()
        player.setVolume?.(playerVolume)
      }, 120)
    }
  }

  useEffect(() => {
    if (!playerRef.current || !playback) return
    syncPlayback(playerRef.current, true)
  }, [playback])

  useEffect(() => {
    if (!playerRef.current) return

    playerRef.current.setVolume?.(playerVolume)
    if (playerVolume === 0) {
      playerRef.current.mute?.()
      return
    }

    playerRef.current.unMute?.()
  }, [playerVolume])

  if (!playback || playback.source !== 'youtube') return null

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    const iframe = event.target.getIframe?.()
    iframe?.setAttribute(
      'allow',
      'autoplay; encrypted-media; picture-in-picture',
    )
    iframe?.setAttribute('tabindex', '-1')
    iframe?.classList.add('pointer-events-none', 'select-none')

    syncPlayback(event.target, true)
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
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
      }}
      onReady={onReady}
      className="h-full w-full"
      iframeClassName="h-full w-full pointer-events-none select-none"
    />
  )
}
