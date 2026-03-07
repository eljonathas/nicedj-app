import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useRoomStore } from '../../stores/roomStore'
import {
  AUDIENCE_DANCE_FRAME_HEIGHT,
  AUDIENCE_DANCE_FRAME_WIDTH,
  AUDIENCE_DANCE_START_FRAME,
  AUDIENCE_DANCE_STEPS,
  AUDIENCE_SHEET_FRAME_COUNT,
  DJ_SHEET_FRAME_COUNT,
  LEGACY_STAGE_SCENE_HEIGHT,
  MAX_STAGE_CHARACTERS,
  SPRITE_ANIMATION_DURATION_MS,
  AUDIENCE_CANVAS_BASE_WIDTH,
  buildCrowdLayout,
  resolveAudienceSpriteSheet,
  resolveDjSpriteRenderMetrics,
  resolveStageLayoutWidth,
  resolveStageViewportMetrics,
} from './stageScene'
import type { PositionedStageUser, StageUser } from './stageScene'

interface StageProps {
  users: StageUser[]
  djId?: string
}

type ViewportSize = {
  width: number
  height: number
}

type SpriteStripProps = {
  sheetUrl: string
  frameWidth: number
  frameHeight: number
  sheetFrameCount: number
  startFrame?: number
  endFrame?: number
  animationSteps?: number
  animate?: boolean
  scale?: number
  className?: string
}

const defaultViewport: ViewportSize = {
  width: AUDIENCE_CANVAS_BASE_WIDTH,
  height: LEGACY_STAGE_SCENE_HEIGHT,
}

export function Stage({ users, djId }: StageProps) {
  const currentUserId = useAuthStore((state) => state.user?.id ?? null)
  const wootBursts = useRoomStore((state) => state.wootBursts)
  const stageRef = useRef<HTMLElement | null>(null)
  const [viewport, setViewport] = useState<ViewportSize>(defaultViewport)

  useEffect(() => {
    const element = stageRef.current
    if (!element) {
      return
    }

    const updateViewport = () => {
      const nextWidth = element.clientWidth || AUDIENCE_CANVAS_BASE_WIDTH
      const nextHeight = element.clientHeight || LEGACY_STAGE_SCENE_HEIGHT

      setViewport((current) => {
        if (
          Math.abs(current.width - nextWidth) < 1 &&
          Math.abs(current.height - nextHeight) < 1
        ) {
          return current
        }

        return {
          width: nextWidth,
          height: nextHeight,
        }
      })
    }

    updateViewport()

    const observer = new ResizeObserver(() => {
      updateViewport()
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const dj = useMemo(
    () => users.find((user) => user.id === djId) ?? null,
    [djId, users],
  )

  const crowdUsers = useMemo(() => {
    const maxCrowd = dj ? MAX_STAGE_CHARACTERS - 1 : MAX_STAGE_CHARACTERS
    return users.filter((user) => user.id !== djId).slice(0, maxCrowd)
  }, [dj, djId, users])

  const stageLayoutWidth = useMemo(
    () => resolveStageLayoutWidth(viewport.width),
    [viewport.width],
  )

  const crowdLayout = useMemo(
    () => buildCrowdLayout(crowdUsers, currentUserId, stageLayoutWidth),
    [crowdUsers, currentUserId, stageLayoutWidth],
  )

  const sceneMetrics = useMemo(
    () => resolveStageViewportMetrics(viewport.width, viewport.height),
    [viewport.height, viewport.width],
  )

  return (
    <section
      ref={stageRef}
      className="relative h-full min-h-0 w-full overflow-hidden border-t border-[rgba(255,255,255,0.08)] bg-[#090d14]"
    >
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: 'url(/stages/default.b9f5c461.jpg)',
          backgroundPosition: 'center bottom',
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.62)_0%,rgba(8,12,18,0.38)_35%,rgba(8,11,17,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-100px_120px_rgba(0,0,0,0.64)]" />

      <div
        className="pointer-events-none absolute inset-x-0 z-20"
        style={{
          bottom: `${sceneMetrics.djBottom}px`,
          height: `${sceneMetrics.djCanvasHeight}px`,
        }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${sceneMetrics.djCanvasWidth}px`,
            height: `${sceneMetrics.djCanvasHeight}px`,
          }}
        >
          {dj ? (
            <DjCharacter user={dj} sceneScale={sceneMetrics.sceneScale} />
          ) : (
            <div className="absolute inset-x-0 bottom-[22px] flex justify-center">
              <span className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(10,15,22,0.75)] px-4 py-2 text-[11px] font-semibold text-[var(--text-muted)] shadow-[0_16px_32px_rgba(0,0,0,0.5)] backdrop-blur-[6px]">
                Aguardando DJ
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 z-30"
        style={{
          bottom: `${sceneMetrics.audienceBottom}px`,
          height: `${sceneMetrics.audienceHeight}px`,
        }}
      >
        <div
          className="relative mx-auto h-full overflow-visible"
          style={{ width: `${stageLayoutWidth}px` }}
        >
          {crowdLayout.map((entry) => (
            <AudienceCharacter
              key={entry.user.id}
              entry={entry}
              sceneScale={sceneMetrics.sceneScale}
              isWooting={Boolean(wootBursts[entry.user.id])}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const AudienceCharacter = memo(function AudienceCharacter({
  entry,
  sceneScale,
  isWooting,
}: {
  entry: PositionedStageUser
  sceneScale: number
  isWooting: boolean
}) {
  const spriteScale = entry.scale * sceneScale

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${entry.xPct}%`,
        top: `${entry.yPct}%`,
        zIndex: entry.zIndex,
        transform: 'translate(-50%, -100%)',
      }}
      aria-hidden
    >
      <div className="relative h-[150px] w-[150px] overflow-visible">
        <SpriteStrip
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          sheetUrl={resolveAudienceSpriteSheet(
            entry.user.avatar,
            isWooting ? 'b' : 'normal',
          )}
          frameWidth={AUDIENCE_DANCE_FRAME_WIDTH}
          frameHeight={AUDIENCE_DANCE_FRAME_HEIGHT}
          sheetFrameCount={AUDIENCE_SHEET_FRAME_COUNT}
          animate={isWooting}
          animationSteps={AUDIENCE_DANCE_STEPS}
          startFrame={isWooting ? AUDIENCE_DANCE_START_FRAME : 0}
          endFrame={
            isWooting ? AUDIENCE_DANCE_START_FRAME + AUDIENCE_DANCE_STEPS : 0
          }
          scale={spriteScale}
        />

        {entry.isCurrentUser ? (
          <div className="absolute left-1/2 top-full mt-1 flex -translate-x-1/2 justify-center">
            <span className="max-w-[116px] truncate rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(7,11,17,0.82)] px-2 py-0.5 text-center text-[10px] font-semibold text-[var(--text-secondary)] shadow-[0_10px_18px_rgba(0,0,0,0.4)]">
              {entry.user.username}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
})

const DjCharacter = memo(function DjCharacter({
  user,
  sceneScale,
}: {
  user: StageUser
  sceneScale: number
}) {
  const renderMetrics = useMemo(
    () => resolveDjSpriteRenderMetrics(user.avatar),
    [user.avatar],
  )

  return (
    <>
      <div
        className="absolute"
        style={{
          left: `${renderMetrics.left * sceneScale}px`,
          top: `${renderMetrics.top * sceneScale}px`,
        }}
      >
        <SpriteStrip
          sheetUrl={renderMetrics.sheetUrl}
          frameWidth={renderMetrics.frameWidth * sceneScale}
          frameHeight={renderMetrics.frameHeight * sceneScale}
          sheetFrameCount={renderMetrics.frameCount}
          animate
          animationSteps={renderMetrics.animationSteps}
          startFrame={0}
          endFrame={renderMetrics.animationSteps}
        />
      </div>

      <div className="absolute inset-x-0 bottom-[-2px] flex justify-center">
        <span className="max-w-[140px] truncate rounded-full border border-[rgba(29,185,84,0.42)] bg-[rgba(11,29,19,0.9)] px-2 py-0.5 text-center text-[10px] font-semibold text-[var(--accent-hover)] shadow-[0_10px_18px_rgba(0,0,0,0.4)]">
          {user.username}
        </span>
      </div>
    </>
  )
})

function SpriteStrip({
  sheetUrl,
  frameWidth,
  frameHeight,
  sheetFrameCount,
  startFrame = 0,
  endFrame = 0,
  animationSteps = DJ_SHEET_FRAME_COUNT,
  animate = false,
  scale = 1,
  className = '',
}: SpriteStripProps) {
  const startOffset = -startFrame * frameWidth
  const endOffset = -endFrame * frameWidth
  const style = {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url(${sheetUrl})`,
    backgroundSize: `${frameWidth * sheetFrameCount}px ${frameHeight}px`,
    backgroundPosition: `${startOffset}px center`,
    transform: scale === 1 ? undefined : `scale(${scale})`,
    transformOrigin: '50% 100%',
    animation: animate
      ? `stage-scene-strip ${SPRITE_ANIMATION_DURATION_MS}ms steps(${animationSteps}) infinite`
      : undefined,
    willChange: animate ? 'background-position' : undefined,
    ['--stage-start-offset' as const]: `${startOffset}px`,
    ['--stage-end-offset' as const]: `${endOffset}px`,
  } satisfies CSSProperties

  return (
    <div
      className={`stage-scene-sprite bg-no-repeat ${className}`.trim()}
      style={style}
      aria-hidden
    />
  )
}
