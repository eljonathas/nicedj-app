import { useEffect, useRef } from "react";
import { useRoomStore } from "../../stores/roomStore";
import { getPlaybackPositionMs } from "../../lib/playback";

declare global {
  interface Window {
    SC: any;
  }
}

export function SoundCloudPlayer() {
  const playback = useRoomStore((s) => s.playback);
  const playerVolume = useRoomStore((s) => s.playerVolume);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scriptLoaded = useRef(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const existing = document.querySelector('script[src*="soundcloud.com/player/api"]');
    if (existing) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !window.SC || !playback) return;

    const widget = window.SC.Widget(iframeRef.current);
    widgetRef.current = widget;

    widget.bind(window.SC.Widget.Events.READY, () => {
      widget.seekTo(getPlaybackPositionMs(playback));
      widget.setVolume(playerVolume);

      if (playback.paused) {
        widget.pause();
      } else {
        widget.play();
      }
    });
  }, [playback?.sourceId, playback?.paused, playback?.pauseOffsetMs, playback?.startedAtServerMs]);

  useEffect(() => {
    if (!widgetRef.current) return;
    widgetRef.current.setVolume(playerVolume);
  }, [playerVolume]);

  if (!playback || playback.source !== "soundcloud") return null;

  const scUrl = `https://api.soundcloud.com/tracks/${playback.sourceId}`;

  return (
    <div className="h-full w-full bg-black">
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&auto_play=true&show_artwork=true&visual=true&color=%231db954`}
      />
    </div>
  );
}
