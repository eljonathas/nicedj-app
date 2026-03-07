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
  audienceBottom: number
  audienceHeight: number
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

const GRID_ROWS = 22
const GRID_CELL_SIZE = 10
const GRID_BACK_SCALE = 0.4
const GRID_BASE_COLUMNS = 196
const GRID_MIN_COLUMNS = 150
const GRID_MAX_COLUMNS = 250
const WIDE_SCREEN_LAYOUT_GROWTH_RATE = 0.58
const WIDE_SCREEN_SCALE_BOOST = 0.18
const WIDE_SCREEN_CURVE_DIVISOR = 520

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
): StageViewportMetrics {
  const wideViewportBoost = resolveWideViewportBoost(viewportWidth)
  const widthScale =
    viewportWidth > 0 ? Math.min(1, viewportWidth / DJ_CANVAS_WIDTH) : 1
  const heightScaleLimit =
    viewportHeight > 0 ? viewportHeight / LEGACY_STAGE_SCENE_HEIGHT : 1
  const sceneScale = Math.min(heightScaleLimit, widthScale * wideViewportBoost)

  return {
    sceneScale,
    audienceBottom: AUDIENCE_BOTTOM * sceneScale,
    audienceHeight: AUDIENCE_CANVAS_HEIGHT * sceneScale,
    djBottom: DJ_BOOTH_BOTTOM * sceneScale,
    djCanvasWidth: DJ_CANVAS_WIDTH * sceneScale,
    djCanvasHeight: DJ_CANVAS_HEIGHT * sceneScale,
  }
}

export function buildCrowdLayout(
  users: StageUser[],
  currentUserId: string | null,
  canvasWidth: number,
): PositionedStageUser[] {
  if (users.length === 0) {
    return []
  }

  const grid = new AudienceGrid(resolveGridColumns(canvasWidth))

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

export function resolveStageLayoutWidth(viewportWidth: number) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return AUDIENCE_CANVAS_BASE_WIDTH
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

function resolveAvatarSpriteSheet(
  avatar: string | null,
  variant: AvatarSpriteVariant,
) {
  const baseSpriteSheet =
    avatar?.includes('/sprites/') ? avatar : DEFAULT_AUDIENCE_SPRITE

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

function resolveGridColumns(canvasWidth: number) {
  const safeWidth =
    Number.isFinite(canvasWidth) && canvasWidth > 0
      ? canvasWidth
      : AUDIENCE_CANVAS_BASE_WIDTH
  const widthRatio = safeWidth / AUDIENCE_CANVAS_BASE_WIDTH
  return clamp(
    Math.floor(GRID_BASE_COLUMNS * widthRatio),
    GRID_MIN_COLUMNS,
    GRID_MAX_COLUMNS,
  )
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
  userMap: Partial<Record<string, GridUser>> = {}
  priorityGrid: number[][] = []
  zones: GridZone[] = []

  constructor(columns: number) {
    this.columns = columns
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
    this.addZone(6, {
      x: 70,
      y: this.rows - 5,
      w: this.columns - 140,
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

  getCellsInZone(zoneId: number, includeInvalid = false) {
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
