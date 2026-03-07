import { describe, expect, it } from 'vitest'
import {
  AUDIENCE_BOTTOM,
  DJ_BOOTH_BOTTOM,
  DESKTOP_STAGE_REFERENCE_WIDTH,
  LEGACY_STAGE_SCENE_HEIGHT,
  AUDIENCE_CANVAS_HEIGHT,
  buildCrowdLayout,
  resolveAudienceSpriteSheet,
  resolveDjSpriteRenderMetrics,
  resolveStageLayoutWidth,
  resolveStageViewportMetrics,
} from './stageScene'

describe('stageScene', () => {
  it('preserves the frontend booth and audience offsets on full-size viewports', () => {
    expect(resolveStageViewportMetrics(DESKTOP_STAGE_REFERENCE_WIDTH, 640)).toEqual({
      sceneScale: 1,
      audienceBottom: AUDIENCE_BOTTOM,
      audienceHeight: AUDIENCE_CANVAS_HEIGHT,
      djBottom: DJ_BOOTH_BOTTOM,
      djCanvasWidth: 340,
      djCanvasHeight: 275,
    })
  })

  it('scales the full stage scene down when the viewport is shorter than the legacy layout', () => {
    const metrics = resolveStageViewportMetrics(280, 280)
    const expectedScale = 280 / LEGACY_STAGE_SCENE_HEIGHT

    expect(metrics.sceneScale).toBeCloseTo(expectedScale, 8)
    expect(metrics.audienceBottom).toBeCloseTo(AUDIENCE_BOTTOM * expectedScale, 8)
    expect(metrics.audienceHeight).toBeCloseTo(
      AUDIENCE_CANVAS_HEIGHT * expectedScale,
      8,
    )
    expect(metrics.djBottom).toBeCloseTo(DJ_BOOTH_BOTTOM * expectedScale, 8)
  })

  it('dampens the audience growth on larger desktop viewports instead of hard-capping it', () => {
    expect(resolveStageLayoutWidth(1176)).toBe(1176)
    expect(resolveStageLayoutWidth(1600)).toBeCloseTo(
      DESKTOP_STAGE_REFERENCE_WIDTH + (1600 - DESKTOP_STAGE_REFERENCE_WIDTH) * 0.58,
      8,
    )
    expect(resolveStageLayoutWidth(980)).toBe(980)
  })

  it('applies a smooth scene-scale boost only when the viewport grows beyond the desktop reference', () => {
    const baseline = resolveStageViewportMetrics(DESKTOP_STAGE_REFERENCE_WIDTH, 640)
    const wide = resolveStageViewportMetrics(1600, 640)

    expect(baseline.sceneScale).toBe(1)
    expect(wide.sceneScale).toBeGreaterThan(1)
    expect(wide.sceneScale).toBeCloseTo(1.10035556, 6)
    expect(wide.audienceBottom).toBeGreaterThan(AUDIENCE_BOTTOM)
  })

  it('keeps the current user in the same front-row slot used by the frontend grid', () => {
    const [entry] = buildCrowdLayout(
      [
        {
          id: 'self',
          username: 'self',
          avatar: '/sprites/free_15/free/base01.png',
          role: 'user',
        },
      ],
      'self',
      805,
    )

    expect(entry.isCurrentUser).toBe(true)
    expect(entry.xPct).toBeCloseTo(42.1456804, 6)
    expect(entry.yPct).toBeCloseTo(94.75186649, 6)
    expect(entry.scale).toBeCloseTo(0.97272727, 6)
    expect(entry.zIndex).toBe(236)
  })

  it('returns stable DJ booth render metrics for standard and special avatars', () => {
    const classicRender = resolveDjSpriteRenderMetrics('/sprites/free_15/free/base01.png')
    const dragonRender = resolveDjSpriteRenderMetrics(
      '/sprites/subscription_44/subscription_required/dragon-e01.png',
    )
    const danceVariant = resolveAudienceSpriteSheet('/sprites/free_15/free/base01.png', 'b')

    expect(danceVariant).toBe('/sprites/free_15/free/base01b.png')
    expect(classicRender.sheetUrl).toBe('/sprites/free_15/free/base01dj.png')
    expect(classicRender.left).toBeGreaterThan(0)
    expect(classicRender.top).toBeGreaterThan(0)
    expect(classicRender.frameWidth).toBeGreaterThanOrEqual(150)
    expect(classicRender.frameHeight).toBeGreaterThanOrEqual(150)
    expect(classicRender.animationSteps).toBe(20)

    expect(dragonRender.sheetUrl).toBe(
      '/sprites/subscription_44/subscription_required/dragon-e01dj.png',
    )
    expect(dragonRender.left).toBeGreaterThanOrEqual(0)
    expect(dragonRender.top).toBeGreaterThan(0)
    expect(dragonRender.frameWidth).toBeGreaterThanOrEqual(150)
    expect(dragonRender.frameHeight).toBeGreaterThanOrEqual(150)
    expect(dragonRender.animationSteps).toBe(20)
  })
})
