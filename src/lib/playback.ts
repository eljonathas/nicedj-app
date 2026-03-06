type PlaybackLike = {
  durationMs: number;
  startedAtServerMs: number;
  paused: boolean;
  pauseOffsetMs: number;
  serverTimeMs: number;
  clientSyncAtMs?: number;
};

export function getPlaybackPositionMs(playback: PlaybackLike, nowMs: number = Date.now()) {
  const elapsedOnServer = Math.max(0, playback.serverTimeMs - playback.startedAtServerMs);
  const syncedElapsed = playback.pauseOffsetMs + (playback.paused ? 0 : elapsedOnServer);

  if (playback.paused) {
    return Math.min(playback.durationMs, syncedElapsed);
  }

  const clientElapsed = Math.max(0, nowMs - (playback.clientSyncAtMs ?? nowMs));
  return Math.min(playback.durationMs, syncedElapsed + clientElapsed);
}
