export interface StageUser {
  id: string
  username: string
  avatar: string | null
  role: string
  platformRole?: string | null
}

export interface PositionedStageUser {
  user: StageUser
  xPct: number
  yPct: number
  scale: number
  zIndex: number
  isCurrentUser: boolean
}

export interface StageViewportMetrics {
  sceneScale: number
  audienceLeft: number
  audienceWidth: number
  audienceBottom: number
  audienceHeight: number
  djCenterX: number
  djBottom: number
  djCanvasWidth: number
  djCanvasHeight: number
}

export interface DjSpriteRenderMetrics {
  sheetUrl: string
  frameWidth: number
  frameHeight: number
  frameCount: number
  animationSteps: number
  left: number
  top: number
}

export type StageLayoutMode = 'default' | 'compact' | 'hero'

type AvatarSpriteVariant = 'normal' | 'b' | 'dj'

type GridCell = {
  r: number
  c: number
}

type GridUser = StageUser & {
  _position?: GridCell
  isCurrentUser?: boolean
}

type GridBounds = {
  x: number
  y: number
  w: number
  h: number
}

type GridZone = {
  id: number
  bounds: GridBounds
}

type DjSpriteConfig = {
  x: number
  y: number
  width: number
  height: number
}

type StageImageBounds = {
  scale: number
  offsetX: number
  offsetY: number
  crowdLeft: number
  crowdRight: number
  crowdTop: number
  crowdBottom: number
  djCenterX: number
  djFeetY: number
}

const DEFAULT_AUDIENCE_SPRITE = '/sprites/free_15/free/base01.png'

export const MAX_STAGE_CHARACTERS = 150
export const AUDIENCE_CANVAS_HEIGHT = 207
export const AUDIENCE_CANVAS_BASE_WIDTH = 805
export const AUDIENCE_OFFSET_Y = 50
export const AUDIENCE_DANCE_FRAME_WIDTH = 150
export const AUDIENCE_DANCE_FRAME_HEIGHT = 150
export const AUDIENCE_SHEET_FRAME_COUNT = 24
export const AUDIENCE_DANCE_START_FRAME = 4
export const AUDIENCE_DANCE_STEPS = 20
export const DJ_SHEET_FRAME_COUNT = 20
export const SPRITE_ANIMATION_DURATION_MS = 2000
export const DJ_CANVAS_WIDTH = 340
export const DJ_CANVAS_HEIGHT = 275
export const DJ_BOOTH_BOTTOM = 30
export const AUDIENCE_BOTTOM = 200
export const LEGACY_STAGE_SCENE_HEIGHT =
  AUDIENCE_BOTTOM + AUDIENCE_CANVAS_HEIGHT
export const DESKTOP_STAGE_REFERENCE_WIDTH = 1176
export const STAGE_BACKGROUND_WIDTH = 1600
export const STAGE_BACKGROUND_HEIGHT = 900

const GRID_ROWS = 22
const GRID_CELL_SIZE = 10
const GRID_BACK_SCALE = 0.4
const GRID_BASE_COLUMNS = 196
const GRID_MIN_COLUMNS = 150
const GRID_MAX_COLUMNS = 250
const WIDE_SCREEN_LAYOUT_GROWTH_RATE = 0.58
const WIDE_SCREEN_SCALE_BOOST = 0.18
const WIDE_SCREEN_CURVE_DIVISOR = 520
// Author-time anchors measured against the original 1600x900 stage artwork.
const DEFAULT_STAGE_IMAGE_BOUNDS = {
  crowdLeft: 300,
  crowdRight: 1260,
  crowdTop: 480,
  crowdBottom: 645,
  djCenterX: 800,
  djFeetY: 850,
} as const

const DJ_DEFAULT_CONFIG: DjSpriteConfig = {
  x: 85,
  y: 55,
  width: 170,
  height: 220,
}

const DJ_DRAGON_CONFIG: DjSpriteConfig = {
  x: 0,
  y: 55,
  width: 340,
  height: 220,
}

const DJ_EPIC_CONFIG: DjSpriteConfig = {
  x: 60,
  y: 0,
  width: 220,
  height: 275,
}

const STAFF_ROLES = new Set([
  'host',
  'cohost',
  'manager',
  'coordinator',
  'bouncer',
  'resident_dj',
])

export function resolveStageViewportMetrics(
  viewportWidth: number,
  viewportHeight: number,
  layoutMode: StageLayoutMode = 'default',
): StageViewportMetrics {
  const wideViewportBoost = resolveWideViewportBoost(viewportWidth)
  const narrowViewportTightness =
    layoutMode === 'default' ? 0 : resolveNarrowViewportTightness(viewportWidth)
  const widthScale =
    viewportWidth > 0 ? Math.min(1, viewportWidth / DJ_CANVAS_WIDTH) : 1
  const heightScaleLimit =
    viewportHeight > 0 ? viewportHeight / LEGACY_STAGE_SCENE_HEIGHT : 1

  if (layoutMode === 'hero') {
    if (viewportWidth < 768) {
      const sceneScale = clamp(
        Math.min(
          viewportWidth > 0 ? viewportWidth / 420 : 1,
          viewportHeight > 0 ? viewportHeight / 320 : 1,
        ),
        0.74,
        0.92,
      )

      return {
        sceneScale,
        audienceLeft: 0,
        audienceWidth: 0,
        audienceBottom: 0,
        audienceHeight: 0,
        djCenterX: viewportWidth / 2,
        djBottom: Math.max(6, viewportHeight * 0.04),
        djCanvasWidth: DJ_CANVAS_WIDTH * sceneScale,
        djCanvasHeight: DJ_CANVAS_HEIGHT * sceneScale,
      }
    }

    const heroZoom = resolveHeroStageZoom(viewportWidth)
    const widthDrivenScale = clamp(
      heroZoom * 0.9 + narrowViewportTightness * 0.04,
      1.14,
      1.32,
    )
    const heightDrivenScale = Math.min(1.34, heightScaleLimit + 0.5)
    const sceneScale = Math.max(
      1.08,
      Math.min(widthDrivenScale, heightDrivenScale),
    )

    return {
      sceneScale,
      audienceLeft: 0,
      audienceWidth: 0,
      audienceBottom:
        AUDIENCE_BOTTOM * sceneScale * (0.56 - narrowViewportTightness * 0.03),
      audienceHeight: AUDIENCE_CANVAS_HEIGHT * sceneScale * 0.8,
      djCenterX: viewportWidth / 2,
      djBottom:
        DJ_BOOTH_BOTTOM * sceneScale * (0.38 - narrowViewportTightness * 0.04),
      djCanvasWidth: DJ_CANVAS_WIDTH * sceneScale,
      djCanvasHeight: DJ_CANVAS_HEIGHT * sceneScale,
    }
  }

  const sceneScale = Math.min(
    heightScaleLimit,
    widthScale * wideViewportBoost * (1 + narrowViewportTightness * 0.04),
  )
  const imageBounds = resolveDefaultStageImageBounds(
    viewportWidth,
    viewportHeight,
  )

  return {
    sceneScale,
    audienceLeft: imageBounds.crowdLeft,
    audienceWidth: imageBounds.crowdRight - imageBounds.crowdLeft,
    audienceBottom: Math.max(0, viewportHeight - imageBounds.crowdBottom),
    audienceHeight: Math.max(0, imageBounds.crowdBottom - imageBounds.crowdTop),
    djCenterX: imageBounds.djCenterX,
    djBottom: Math.max(0, viewportHeight - imageBounds.djFeetY),
    djCanvasWidth: DJ_CANVAS_WIDTH * sceneScale,
    djCanvasHeight: DJ_CANVAS_HEIGHT * sceneScale,
  }
}

export function buildCrowdLayout(
  users: StageUser[],
  currentUserId: string | null,
  canvasWidth: number,
  layoutMode: StageLayoutMode = 'default',
): PositionedStageUser[] {
  if (users.length === 0) {
    return []
  }

  const grid = new AudienceGrid(
    resolveGridColumns(canvasWidth, layoutMode),
    layoutMode,
  )

  for (const user of users.slice(0, MAX_STAGE_CHARACTERS)) {
    grid.addUser({
      ...user,
      isCurrentUser: user.id === currentUserId,
    })
  }

  return users
    .slice(0, MAX_STAGE_CHARACTERS)
    .map((user) => {
      const gridUser = grid.userMap[user.id]
      if (gridUser === undefined || gridUser._position === undefined) {
        return null
      }

      const position = calculatePositionFromGrid(
        gridUser._position,
        grid.columns,
        canvasWidth,
      )

      return {
        user,
        xPct: clamp((position.x / canvasWidth) * 100, 4, 96),
        yPct: clamp((position.y / AUDIENCE_CANVAS_HEIGHT) * 100, 0, 100),
        scale: position.scale,
        zIndex: 40 + Math.round(position.y),
        isCurrentUser: user.id === currentUserId,
      } satisfies PositionedStageUser
    })
    .filter((entry): entry is PositionedStageUser => entry !== null)
    .sort((left, right) => left.yPct - right.yPct)
}

export function resolveAudienceSpriteSheet(
  avatar: string | null,
  variant: Extract<AvatarSpriteVariant, 'normal' | 'b'> = 'normal',
) {
  return resolveAvatarSpriteSheet(avatar, variant)
}

export function resolveDjSpriteRenderMetrics(
  avatar: string | null,
): DjSpriteRenderMetrics {
  const avatarKey = extractAvatarId(avatar)
  const config = resolveDjSpriteConfig(avatarKey)
  const centerX = config.x + config.width / 2
  const bottomY = config.y + config.height

  return {
    sheetUrl: resolveAvatarSpriteSheet(avatar, 'dj'),
    frameWidth: config.width,
    frameHeight: config.height,
    frameCount: DJ_SHEET_FRAME_COUNT,
    animationSteps: DJ_SHEET_FRAME_COUNT,
    left: centerX - config.width / 2,
    top: bottomY - config.height,
  }
}

export function extractAvatarId(avatar: string | null) {
  if (!avatar) {
    return ''
  }

  const filename = avatar.split('/').pop() ?? avatar
  return filename.replace(/\.(png|webp|jpg|jpeg)$/i, '').toLowerCase()
}

export function resolveStageLayoutWidth(
  viewportWidth: number,
  layoutMode: StageLayoutMode = 'default',
) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return AUDIENCE_CANVAS_BASE_WIDTH
  }

  if (layoutMode === 'hero') {
    return Math.round(viewportWidth * resolveHeroStageZoom(viewportWidth))
  }

  if (viewportWidth <= DESKTOP_STAGE_REFERENCE_WIDTH) {
    return viewportWidth
  }

  const overflowWidth = viewportWidth - DESKTOP_STAGE_REFERENCE_WIDTH
  return (
    DESKTOP_STAGE_REFERENCE_WIDTH +
    overflowWidth * WIDE_SCREEN_LAYOUT_GROWTH_RATE
  )
}

export function resolveHeroBackgroundZoom(viewportWidth: number) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return 1
  }

  if (viewportWidth < 768) {
    const clampedWidth = clamp(viewportWidth, 320, 520)
    const progress = (clampedWidth - 320) / 200
    return clamp(2 - progress * 0.22, 1.78, 2.04)
  }

  return resolveHeroStageZoom(viewportWidth)
}

function resolveAvatarSpriteSheet(
  avatar: string | null,
  variant: AvatarSpriteVariant,
) {
  const baseSpriteSheet = avatar?.includes('/sprites/')
    ? avatar
    : DEFAULT_AUDIENCE_SPRITE

  if (variant === 'normal') {
    return baseSpriteSheet
  }

  const extensionMatch = baseSpriteSheet.match(/\.[^.]+$/)
  if (!extensionMatch) {
    return baseSpriteSheet
  }

  const extension = extensionMatch[0]
  const basePath = baseSpriteSheet.slice(0, -extension.length)
  return `${basePath}${variant}${extension}`
}

function resolveGridColumns(canvasWidth: number, layoutMode: StageLayoutMode) {
  const safeWidth =
    Number.isFinite(canvasWidth) && canvasWidth > 0
      ? canvasWidth
      : AUDIENCE_CANVAS_BASE_WIDTH
  const widthRatio = safeWidth / AUDIENCE_CANVAS_BASE_WIDTH
  const nextColumns = Math.floor(GRID_BASE_COLUMNS * widthRatio)

  if (layoutMode === 'compact' || layoutMode === 'hero') {
    const minColumns = layoutMode === 'hero' ? 48 : 56
    const maxNarrowColumns = layoutMode === 'hero' ? 92 : 104
    const minWideColumns = layoutMode === 'hero' ? 84 : 92
    const maxWideColumns = layoutMode === 'hero' ? 156 : 168

    if (safeWidth < 420) {
      return clamp(nextColumns, minColumns, maxNarrowColumns)
    }

    if (safeWidth < 760) {
      return clamp(nextColumns, minWideColumns, maxWideColumns)
    }
  }

  return clamp(nextColumns, GRID_MIN_COLUMNS, GRID_MAX_COLUMNS)
}

function calculatePositionFromGrid(
  gridPosition: GridCell,
  columns: number,
  canvasWidth: number,
) {
  const yScaleFactor = (1 - GRID_BACK_SCALE) / GRID_ROWS
  let scale = GRID_BACK_SCALE
  let offsetY = AUDIENCE_OFFSET_Y

  for (let row = 0; row < gridPosition.r; row += 1) {
    scale = yScaleFactor * row + GRID_BACK_SCALE
    offsetY += GRID_CELL_SIZE * scale
  }

  scale = yScaleFactor * gridPosition.r + GRID_BACK_SCALE

  const cellWidth = GRID_CELL_SIZE * scale
  const visibleWidth = columns * cellWidth
  const perspectiveOffset = (canvasWidth - visibleWidth) / 2

  return {
    x: perspectiveOffset + gridPosition.c * cellWidth + cellWidth / 2,
    y: offsetY + cellWidth / 2,
    scale,
  }
}

function resolveDjSpriteConfig(avatarKey: string): DjSpriteConfig {
  if (avatarKey.includes('dragon')) {
    return DJ_DRAGON_CONFIG
  }

  if (/-e\d+$/i.test(avatarKey) || avatarKey.includes('epic')) {
    return DJ_EPIC_CONFIG
  }

  return DJ_DEFAULT_CONFIG
}

class AudienceGrid {
  readonly rows = GRID_ROWS
  readonly cellSize = GRID_CELL_SIZE
  readonly backScale = GRID_BACK_SCALE
  readonly columns: number
  readonly layoutMode: StageLayoutMode
  userMap: Partial<Record<string, GridUser>> = {}
  priorityGrid: number[][] = []
  zones: GridZone[] = []

  constructor(columns: number, layoutMode: StageLayoutMode) {
    this.columns = columns
    this.layoutMode = layoutMode
    this.clear()
  }

  clear() {
    this.zones = []
    this.priorityGrid = []
    this.userMap = {}

    for (let row = 0; row < this.rows; row += 1) {
      this.priorityGrid.push(Array.from({ length: this.columns }, () => 100))
    }

    this.addZone(1, { x: 0, y: 0, w: this.columns, h: this.rows - 12 })
    this.addZone(2, { x: 0, y: this.rows - 12, w: this.columns, h: 6 })
    this.addZone(3, { x: 0, y: this.rows - 5, w: this.columns, h: 3 })
    this.addZone(4, {
      x: this.columns * (3 / 8),
      y: this.rows - 4,
      w: this.columns / 4,
      h: 2,
    })
    this.addZone(5, {
      x: Math.floor(this.columns / 2) - 7,
      y: this.rows - 1,
      w: 1,
      h: 1,
    })
    const spotlightInset =
      this.layoutMode === 'default'
        ? 70
        : this.layoutMode === 'hero'
          ? clamp(Math.floor(this.columns * 0.22), 10, 28)
          : clamp(Math.floor(this.columns * 0.18), 12, 36)
    this.addZone(6, {
      x: spotlightInset,
      y: this.rows - 5,
      w: Math.max(8, this.columns - spotlightInset * 2),
      h: 4,
    })

    for (let row = 0; row < this.rows; row += 1) {
      const taper = Math.floor(
        quadEaseOut(row, 0, 1 - this.backScale, this.rows) * (this.columns / 2),
      )
      const availableWidth = this.columns - 2 * taper - 4

      for (let col = 0; col < availableWidth; col += 1) {
        const priority =
          col < availableWidth / 2
            ? quadEaseOut(col, 50, 50, availableWidth / 2)
            : quadEaseIn(col - availableWidth / 2, 100, -50, availableWidth / 2)

        this.setCellPriority(row, col + taper + 2, priority)
      }

      this.invalidateCellsInBounds({ x: 0, y: row, w: 2 + taper, h: 1 })
      this.invalidateCellsInBounds({
        x: this.columns - taper - 2,
        y: row,
        w: 2 + taper,
        h: 1,
      })
    }

    this.invalidateCellsInBounds({
      x: 0,
      y: this.rows - 1,
      w: Math.floor(this.columns / 2) - 7,
      h: 1,
    })
    this.invalidateCellsInBounds({
      x: Math.floor(this.columns / 2) - 5,
      y: this.rows - 1,
      w: 5 + Math.floor(this.columns / 2),
      h: 1,
    })
  }

  addZone(id: number, bounds: GridBounds) {
    this.zones.push({ id, bounds })
  }

  addUser(user: GridUser) {
    if (this.userMap[user.id]) {
      return false
    }

    let zone = this.getZone(user)
    let cells: GridCell[] = []

    if (zone < 6) {
      while (zone > 0) {
        cells = this.getCellsInZone(zone)
        if (cells.length > 0) {
          break
        }
        zone -= 1
      }

      if (cells.length === 0) {
        for (zone = 4; zone > 0; zone -= 1) {
          cells = this.getCellsInZone(zone)
          if (cells.length > 0) {
            break
          }
        }
      }
    } else {
      cells = this.getCellsInZone(zone)
    }

    if (cells.length === 0) {
      return false
    }

    const position = this.pickPosition(cells, hashToInt(user.id))
    user._position = position
    this.userMap[user.id] = user

    this.invalidateCellAt(position.r, position.c)
    for (let step = 1; step <= 4; step += 1) {
      this.decrementCellsInBounds({
        x: position.c - step,
        y: position.r - 2 * step,
        w: 2 * step + 1,
        h: 3 * step,
      })
    }

    return true
  }

  getZone(user: GridUser) {
    if (user.isCurrentUser) {
      return 5
    }

    const avatarKey = extractAvatarId(user.avatar)
    if (avatarKey.includes('dragon') || /-e\d+$/i.test(avatarKey)) {
      return 6
    }

    if (user.platformRole || STAFF_ROLES.has(user.role)) {
      return 4
    }

    const seed = hashToInt(user.id) % 100
    if (seed > 72) return 3
    if (seed > 34) return 2
    return 1
  }

  getCellsInZone(zoneId: number, includeInvalid = false): GridCell[] {
    const cells: GridCell[] = []

    for (const zone of this.zones) {
      if (zone.id !== zoneId) {
        continue
      }

      const maxRow = Math.floor(zone.bounds.y + zone.bounds.h)
      const maxCol = Math.floor(zone.bounds.x + zone.bounds.w)

      for (let row = Math.floor(zone.bounds.y); row < maxRow; row += 1) {
        for (let col = Math.floor(zone.bounds.x); col < maxCol; col += 1) {
          if (this.getPriorityLevelForCellAt(row, col) > 0 || includeInvalid) {
            cells.push({ r: row, c: col })
          }
        }
      }

      break
    }

    if (zoneId === 5 && cells.length === 0 && !includeInvalid) {
      return this.getCellsInZone(zoneId, true)
    }

    return cells
  }

  pickPosition(cells: GridCell[], seed: number) {
    const high: GridCell[] = []
    const medium: GridCell[] = []
    const low: GridCell[] = []

    for (const cell of cells) {
      const priority = this.getPriorityLevelForCellAt(cell.r, cell.c)
      if (priority > 69) {
        high.push(cell)
      } else if (priority > 49) {
        medium.push(cell)
      } else if (priority > 24) {
        low.push(cell)
      }
    }

    if (high.length > 0) return high[seed % high.length]
    if (medium.length > 0) return medium[seed % medium.length]
    if (low.length > 0) return low[seed % low.length]
    return cells[seed % cells.length]
  }

  getPriorityLevelForCellAt(row: number, col: number) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.columns) {
      return 0
    }

    return Math.max(0, this.priorityGrid[row][col])
  }

  getZoneIDsForCellAt(row: number, col: number) {
    const zoneIds: number[] = []

    for (const zone of this.zones) {
      if (
        col >= zone.bounds.x &&
        col <= zone.bounds.x + zone.bounds.w &&
        row >= zone.bounds.y &&
        row <= zone.bounds.y + zone.bounds.h
      ) {
        zoneIds.push(zone.id)
      }
    }

    return zoneIds
  }

  setCellPriority(row: number, col: number, priority: number) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      this.priorityGrid[row][col] = priority
    }
  }

  invalidateCellAt(row: number, col: number) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      this.priorityGrid[row][col] -= 100
    }
  }

  decrementCellAt(row: number, col: number) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.columns) {
      return
    }

    const zoneIds = this.getZoneIDsForCellAt(row, col).sort((a, b) => a - b)
    if (zoneIds.length === 0) {
      return
    }

    this.priorityGrid[row][col] -= getAdjustment(zoneIds[zoneIds.length - 1])
  }

  decrementCellsInBounds(bounds: GridBounds) {
    for (
      let row = Math.floor(bounds.y);
      row < Math.floor(bounds.y + bounds.h);
      row += 1
    ) {
      for (
        let col = Math.floor(bounds.x);
        col < Math.floor(bounds.x + bounds.w);
        col += 1
      ) {
        this.decrementCellAt(row, col)
      }
    }
  }

  invalidateCellsInBounds(bounds: GridBounds) {
    for (
      let row = Math.floor(bounds.y);
      row < Math.floor(bounds.y + bounds.h);
      row += 1
    ) {
      for (
        let col = Math.floor(bounds.x);
        col < Math.floor(bounds.x + bounds.w);
        col += 1
      ) {
        this.invalidateCellAt(row, col)
      }
    }
  }
}

function getAdjustment(zoneId: number) {
  if (zoneId === 5 || zoneId === 4) return 45
  if (zoneId === 3) return 30
  if (zoneId === 2) return 25
  return 15
}

function quadEaseOut(t: number, b: number, c: number, d: number) {
  const progress = t / d
  return -c * progress * (progress - 2) + b
}

function quadEaseIn(t: number, b: number, c: number, d: number) {
  const progress = t / d
  return c * progress * progress + b
}

function hashToInt(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveDefaultStageImageBounds(
  viewportWidth: number,
  viewportHeight: number,
): StageImageBounds {
  const safeWidth =
    Number.isFinite(viewportWidth) && viewportWidth > 0
      ? viewportWidth
      : DESKTOP_STAGE_REFERENCE_WIDTH
  const safeHeight =
    Number.isFinite(viewportHeight) && viewportHeight > 0
      ? viewportHeight
      : LEGACY_STAGE_SCENE_HEIGHT
  const scale = Math.max(
    safeWidth / STAGE_BACKGROUND_WIDTH,
    safeHeight / STAGE_BACKGROUND_HEIGHT,
  )
  const renderedWidth = STAGE_BACKGROUND_WIDTH * scale
  const renderedHeight = STAGE_BACKGROUND_HEIGHT * scale
  const offsetX = (safeWidth - renderedWidth) / 2
  const offsetY = safeHeight - renderedHeight

  return {
    scale,
    offsetX,
    offsetY,
    crowdLeft: offsetX + DEFAULT_STAGE_IMAGE_BOUNDS.crowdLeft * scale,
    crowdRight: offsetX + DEFAULT_STAGE_IMAGE_BOUNDS.crowdRight * scale,
    crowdTop: offsetY + DEFAULT_STAGE_IMAGE_BOUNDS.crowdTop * scale,
    crowdBottom: offsetY + DEFAULT_STAGE_IMAGE_BOUNDS.crowdBottom * scale,
    djCenterX: offsetX + DEFAULT_STAGE_IMAGE_BOUNDS.djCenterX * scale,
    djFeetY: offsetY + DEFAULT_STAGE_IMAGE_BOUNDS.djFeetY * scale,
  }
}

function resolveWideViewportBoost(viewportWidth: number) {
  if (
    !Number.isFinite(viewportWidth) ||
    viewportWidth <= DESKTOP_STAGE_REFERENCE_WIDTH
  ) {
    return 1
  }

  const overflowWidth = viewportWidth - DESKTOP_STAGE_REFERENCE_WIDTH
  return (
    1 +
    WIDE_SCREEN_SCALE_BOOST *
      (1 - Math.exp(-overflowWidth / WIDE_SCREEN_CURVE_DIVISOR))
  )
}

function resolveNarrowViewportTightness(viewportWidth: number) {
  if (!Number.isFinite(viewportWidth) || viewportWidth >= 520) {
    return 0
  }

  return clamp((520 - viewportWidth) / 220, 0, 1)
}

function resolveHeroStageZoom(viewportWidth: number) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return 1
  }

  if (viewportWidth < 400) {
    return 1.42
  }

  if (viewportWidth < 520) {
    return 1.34
  }

  if (viewportWidth < DESKTOP_STAGE_REFERENCE_WIDTH) {
    return 1.18
  }

  return 1
}
