import { motion } from "framer-motion";
import { Disc3 } from "lucide-react";
import { useRoomStore } from "../../stores/roomStore";
import { SoundCloudPlayer } from "./SoundCloudPlayer";
import { YouTubePlayer } from "./YouTubePlayer";

export function MediaPlayer() {
  const playback = useRoomStore((s) => s.playback);

  if (!playback) {
    return (
      <div className="h-full w-full rounded-[1.6rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(16,22,31,0.95),rgba(8,12,19,0.98))] overflow-hidden relative flex items-center justify-center px-6 py-10">
        <div className="absolute -left-16 -top-10 h-56 w-56 rounded-full bg-[rgba(30,215,96,0.15)] blur-3xl" />
        <div className="absolute -right-16 -bottom-10 h-56 w-56 rounded-full bg-[rgba(10,132,255,0.15)] blur-3xl" />

        <div className="relative z-10 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} className="mx-auto mb-5">
            <Disc3 className="mx-auto h-20 w-20 text-[var(--text-muted)]/70" />
          </motion.div>

          <h2 className="section-title text-2xl font-bold">Nenhuma track tocando</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Entre na fila para assumir o booth e iniciar o set.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-[1.6rem] border border-[var(--border-light)] bg-black shadow-[0_28px_65px_rgba(0,0,0,0.6)]">
      {playback.source === "youtube" && <YouTubePlayer />}
      {playback.source === "soundcloud" && <SoundCloudPlayer />}
    </div>
  );
}
