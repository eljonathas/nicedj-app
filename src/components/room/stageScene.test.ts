import { describe, expect, it } from 'vitest'
import {
  DESKTOP_STAGE_REFERENCE_WIDTH,
  buildCrowdLayout,
  resolveAudienceSpriteSheet,
  resolveDjSpriteRenderMetrics,
  resolveHeroBackgroundZoom,
  resolveStageLayoutWidth,
  resolveStageViewportMetrics,
} from './stageScene'

describe('stageScene', () => {
  it('projects the crowd and dj anchors through the cover-cropped background on desktop', () => {
    const metrics = resolveStageViewportMetrics(DESKTOP_STAGE_REFERENCE_WIDTH, 640)

    expect(metrics.sceneScale).toBe(1)
    expect(metrics.audienceLeft).toBeCloseTo(220.5, 6)
    expect(metrics.audienceWidth).toBeCloseTo(705.6, 6)
    expect(metrics.audienceBottom).toBeCloseTo(187.425, 6)
    expect(metrics.audienceHeight).toBeCloseTo(121.275, 6)
    expect(metrics.djCenterX).toBeCloseTo(588, 6)
    expect(metrics.djBottom).toBeCloseTo(36.75, 6)
    expect(metrics.djCanvasWidth).toBe(340)
    expect(metrics.djCanvasHeight).toBe(275)
  })

  it('keeps the authored image anchors when the viewport matches the stage art ratio', () => {
    const metrics = resolveStageViewportMetrics(1600, 900)

    expect(metrics.audienceLeft).toBe(300)
    expect(metrics.audienceWidth).toBe(960)
    expect(metrics.audienceBottom).toBe(255)
    expect(metrics.audienceHeight).toBe(165)
    expect(metrics.djCenterX).toBe(800)
    expect(metrics.djBottom).toBe(50)
  })

  it('recomputes the mapped crowd bounds when width and height both force a new cover crop', () => {
    const metrics = resolveStageViewportMetrics(1000, 640)

    expect(metrics.audienceLeft).toBeCloseTo(144.44444444, 6)
    expect(metrics.audienceWidth).toBeCloseTo(682.66666667, 6)
    expect(metrics.audienceBottom).toBeCloseTo(181.33333333, 6)
    expect(metrics.audienceHeight).toBeCloseTo(117.33333333, 6)
    expect(metrics.djCenterX).toBeCloseTo(500, 6)
    expect(metrics.djBottom).toBeCloseTo(35.55555556, 6)
  })

  it('applies compact-stage tuning on narrow mobile viewports', () => {
    const compact = resolveStageViewportMetrics(320, 420, 'compact')
    const defaultMetrics = resolveStageViewportMetrics(320, 420, 'default')

    expect(compact.sceneScale).toBeGreaterThan(defaultMetrics.sceneScale)
    expect(compact.djBottom).toBe(defaultMetrics.djBottom)
    expect(compact.audienceBottom).toBe(defaultMetrics.audienceBottom)
    expect(compact.audienceWidth).toBe(defaultMetrics.audienceWidth)
  })

  it('hides the hero crowd on mobile while keeping the DJ centered in the crop', () => {
    const hero = resolveStageViewportMetrics(360, 248, 'hero')
    const compact = resolveStageViewportMetrics(360, 248, 'compact')

    expect(hero.sceneScale).toBeGreaterThan(compact.sceneScale)
    expect(hero.audienceBottom).toBe(0)
    expect(hero.audienceHeight).toBe(0)
    expect(hero.djCenterX).toBe(180)
    expect(hero.djCanvasHeight + hero.djBottom).toBeLessThan(248)
  })

  it('dampens the audience growth on larger desktop viewports instead of hard-capping it', () => {
    expect(resolveStageLayoutWidth(1176)).toBe(1176)
    expect(resolveStageLayoutWidth(1600)).toBeCloseTo(
      DESKTOP_STAGE_REFERENCE_WIDTH +
        (1600 - DESKTOP_STAGE_REFERENCE_WIDTH) * 0.58,
      8,
    )
    expect(resolveStageLayoutWidth(980)).toBe(980)
  })

  it('widens the mobile hero stage beyond the viewport to preserve crowd visibility around the booth', () => {
    expect(resolveStageLayoutWidth(360, 'hero')).toBe(511)
    expect(resolveStageLayoutWidth(390, 'hero')).toBe(554)
    expect(resolveStageLayoutWidth(768, 'hero')).toBe(906)
  })

  it('keeps the mobile hero background crop close to a 200 percent booth-focused zoom', () => {
    expect(resolveHeroBackgroundZoom(360)).toBeCloseTo(1.956, 3)
    expect(resolveHeroBackgroundZoom(390)).toBeCloseTo(1.923, 3)
    expect(resolveHeroBackgroundZoom(520)).toBeCloseTo(1.78, 3)
  })

  it('anchors the xl crowd width and dj baseline to the mapped background coordinates', () => {
    const metrics = resolveStageViewportMetrics(1600, 640)

    expect(metrics.sceneScale).toBeCloseTo(1.10035556, 6)
    expect(metrics.audienceLeft).toBe(300)
    expect(metrics.audienceWidth).toBe(960)
    expect(metrics.audienceBottom).toBe(255)
    expect(metrics.audienceHeight).toBe(165)
    expect(metrics.djCenterX).toBe(800)
    expect(metrics.djBottom).toBe(50)
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

  it('avoids collapsing the compact crowd layout into the stage edges on mobile widths', () => {
    const crowd = buildCrowdLayout(
      Array.from({ length: 12 }, (_, index) => ({
        id: `user-${index + 1}`,
        username: `user-${index + 1}`,
        avatar: '/sprites/free_15/free/base01.png',
        role: 'user',
      })),
      'user-1',
      320,
      'compact',
    )

    expect(Math.min(...crowd.map((entry) => entry.xPct))).toBeGreaterThan(4)
    expect(Math.max(...crowd.map((entry) => entry.xPct))).toBeLessThan(96)
  })

  it('keeps the hero crowd inside the mobile crop when only a few avatars are shown', () => {
    const crowd = buildCrowdLayout(
      Array.from({ length: 8 }, (_, index) => ({
        id: `hero-user-${index + 1}`,
        username: `hero-user-${index + 1}`,
        avatar: '/sprites/free_15/free/base01.png',
        role: 'user',
      })),
      'hero-user-1',
      360,
      'hero',
    )

    expect(Math.min(...crowd.map((entry) => entry.xPct))).toBeGreaterThan(4)
    expect(Math.max(...crowd.map((entry) => entry.xPct))).toBeLessThan(96)
  })

  it('returns stable DJ booth render metrics for standard and special avatars', () => {
    const classicRender = resolveDjSpriteRenderMetrics(
      '/sprites/free_15/free/base01.png',
    )
    const dragonRender = resolveDjSpriteRenderMetrics(
      '/sprites/subscription_44/subscription_required/dragon-e01.png',
    )
    const danceVariant = resolveAudienceSpriteSheet(
      '/sprites/free_15/free/base01.png',
      'b',
    )

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
