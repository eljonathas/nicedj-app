const XP_PER_LEVEL = 100

export function getLevelProgress(level: number, xp: number) {
  const safeLevel = Math.max(1, level)
  const currentFloor = (safeLevel - 1) * XP_PER_LEVEL
  const nextThreshold = safeLevel * XP_PER_LEVEL
  const xpIntoLevel = Math.max(0, xp - currentFloor)
  const xpForNextLevel = Math.max(XP_PER_LEVEL, nextThreshold - currentFloor)
  const progressPct = Math.min((xpIntoLevel / xpForNextLevel) * 100, 100)

  return {
    xpIntoLevel,
    xpForNextLevel,
    progressPct,
    nextThreshold,
  }
}
