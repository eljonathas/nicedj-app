import { useEffect, useRef } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { getPlaybackPositionMs } from "../../lib/playback";
import { useRoomStore } from "../../stores/roomStore";

export function YouTubePlayer() {
  const playback = useRoomStore((s) => s.playback);
  const playerVolume = useRoomStore((s) => s.playerVolume);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current || !playback) return;

    const player = playerRef.current;

    if (playback.paused) {
      player.pauseVideo?.();
      return;
    }

    const expectedSec = getPlaybackPositionMs(playback) / 1000;
    const currentSec = player.getCurrentTime?.() || 0;
    const drift = Math.abs(currentSec - expectedSec);

    if (drift > 2) {
      player.seekTo(expectedSec, true);
    }

    player.playVideo?.();
  }, [playback]);

  useEffect(() => {
    if (!playerRef.current) return;

    playerRef.current.setVolume?.(playerVolume);
    if (playerVolume === 0) {
      playerRef.current.mute?.();
      return;
    }

    playerRef.current.unMute?.();
  }, [playerVolume]);

  if (!playback || playback.source !== "youtube") return null;

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    event.target.setVolume?.(playerVolume);

    event.target.seekTo(getPlaybackPositionMs(playback) / 1000, true);

    if (playback.paused) {
      event.target.pauseVideo();
    } else {
      event.target.playVideo();
    }
  };

  return (
    <div className="h-full w-full bg-black">
      <YouTube
        videoId={playback.sourceId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
        }}
        onReady={onReady}
        className="h-full w-full"
        iframeClassName="h-full w-full"
      />
    </div>
  );
}
