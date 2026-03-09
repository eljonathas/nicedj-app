import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Code2,
  Crown,
  Disc3,
  Shield,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'

export type RoomRoleName =
  | 'guest'
  | 'user'
  | 'resident_dj'
  | 'coordinator'
  | 'manager'
  | 'cohost'
  | 'host'

export type PlatformRoleName = 'none' | 'developer' | 'ambassador'
export type UserPresenceGroupName =
  | Exclude<PlatformRoleName, 'none'>
  | RoomRoleName

export type RoomPermission =
  | 'send_chat'
  | 'join_queue'
  | 'bypass_queue_lock'
  | 'vote'
  | 'skip_self'
  | 'skip_others'
  | 'mute_user'
  | 'ban_user'
  | 'kick_user'
  | 'clear_chat'
  | 'manage_queue'
  | 'manage_emojis'
  | 'manage_roles'
  | 'manage_room'
  | 'view_audit_logs'
  | 'delete_room'

const ROOM_ROLE_ALIASES = {
  moderator: 'coordinator',
  bouncer: 'coordinator',
} as const

const ROOM_ROLE_ORDER: RoomRoleName[] = [
  'guest',
  'user',
  'resident_dj',
  'coordinator',
  'manager',
  'cohost',
  'host',
]

const ROOM_ROLE_PERMISSIONS: Record<RoomRoleName, RoomPermission[]> = {
  guest: [],
  user: ['send_chat', 'join_queue', 'vote', 'skip_self'],
  resident_dj: [
    'send_chat',
    'join_queue',
    'bypass_queue_lock',
    'vote',
    'skip_self',
  ],
  coordinator: [
    'send_chat',
    'join_queue',
    'vote',
    'skip_self',
    'skip_others',
    'mute_user',
    'clear_chat',
    'manage_queue',
    'manage_emojis',
    'manage_roles',
  ],
  manager: [
    'send_chat',
    'join_queue',
    'vote',
    'skip_self',
    'skip_others',
    'mute_user',
    'kick_user',
    'ban_user',
    'clear_chat',
    'manage_queue',
    'manage_emojis',
    'manage_roles',
  ],
  cohost: [
    'send_chat',
    'join_queue',
    'vote',
    'skip_self',
    'skip_others',
    'mute_user',
    'kick_user',
    'ban_user',
    'clear_chat',
    'manage_queue',
    'manage_emojis',
    'manage_roles',
    'manage_room',
    'view_audit_logs',
  ],
  host: [
    'send_chat',
    'join_queue',
    'vote',
    'skip_self',
    'skip_others',
    'mute_user',
    'kick_user',
    'ban_user',
    'clear_chat',
    'manage_queue',
    'manage_emojis',
    'manage_roles',
    'manage_room',
    'view_audit_logs',
    'delete_room',
  ],
}

const ROOM_ASSIGNABLE_ROLES: Record<RoomRoleName, RoomRoleName[]> = {
  guest: [],
  user: [],
  resident_dj: [],
  coordinator: ['user', 'resident_dj'],
  manager: ['user', 'resident_dj', 'coordinator'],
  cohost: ['user', 'resident_dj', 'coordinator', 'manager'],
  host: ['user', 'resident_dj', 'coordinator', 'manager', 'cohost'],
}

const ROOM_MANAGEMENT_PERMISSIONS: RoomPermission[] = [
  'mute_user',
  'kick_user',
  'ban_user',
  'manage_queue',
  'manage_emojis',
  'manage_roles',
  'manage_room',
  'view_audit_logs',
]

type RoomRoleMeta = {
  label: string
  shortLabel: string
  icon: LucideIcon
  pillClassName: string
  nameClassName: string
  rowClassName: string
  iconClassName: string
}

type PlatformRoleMeta = {
  label: string
  shortLabel: string
  icon: LucideIcon
  pillClassName: string
  iconClassName: string
}

type UserPresenceGroupMeta = {
  title: string
  icon: LucideIcon
  pillClassName: string
  iconClassName: string
}

type PresenceSortableUser = {
  username: string
  role?: string | null
  platformRole?: string | null
}

const ROOM_ROLE_META: Record<RoomRoleName, RoomRoleMeta> = {
  guest: {
    label: 'Visitante',
    shortLabel: 'Guest',
    icon: UserRound,
    pillClassName:
      'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]',
    nameClassName: 'text-[var(--text-primary)]',
    rowClassName: '',
    iconClassName: 'text-[var(--text-muted)]',
  },
  user: {
    label: 'Usuário',
    shortLabel: 'User',
    icon: UserRound,
    pillClassName:
      'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]',
    nameClassName: 'text-[var(--text-primary)]',
    rowClassName: '',
    iconClassName: 'text-[var(--text-muted)]',
  },
  resident_dj: {
    label: 'Resident DJ',
    shortLabel: 'Resident',
    icon: Disc3,
    pillClassName:
      'border-[rgba(137,180,97,0.28)] bg-[rgba(35,54,28,0.46)] text-[#a7c98a]',
    nameClassName: 'text-[#a7c98a]',
    rowClassName:
      'border-[rgba(137,180,97,0.22)] bg-[linear-gradient(135deg,rgba(26,34,22,0.96),rgba(16,24,20,0.94))]',
    iconClassName: 'text-[#98bb78]',
  },
  coordinator: {
    label: 'Moderador',
    shortLabel: 'Mod',
    icon: Shield,
    pillClassName:
      'border-[rgba(176,107,255,0.26)] bg-[rgba(66,35,105,0.34)] text-[#cdaeff]',
    nameClassName: 'text-[#d8c1ff]',
    rowClassName:
      'border-[rgba(176,107,255,0.18)] bg-[linear-gradient(135deg,rgba(30,22,43,0.96),rgba(18,17,29,0.94))]',
    iconClassName: 'text-[#c69dff]',
  },
  manager: {
    label: 'Coordenador',
    shortLabel: 'Coord',
    icon: Briefcase,
    pillClassName:
      'border-[rgba(176,107,255,0.26)] bg-[rgba(66,35,105,0.34)] text-[#d7baff]',
    nameClassName: 'text-[#e0cfff]',
    rowClassName:
      'border-[rgba(176,107,255,0.18)] bg-[linear-gradient(135deg,rgba(32,23,47,0.96),rgba(19,17,30,0.94))]',
    iconClassName: 'text-[#cfaeff]',
  },
  cohost: {
    label: 'Co-Host',
    shortLabel: 'Co-Host',
    icon: ShieldCheck,
    pillClassName:
      'border-[rgba(176,107,255,0.28)] bg-[rgba(73,38,117,0.38)] text-[#e3c8ff]',
    nameClassName: 'text-[#ead9ff]',
    rowClassName:
      'border-[rgba(176,107,255,0.2)] bg-[linear-gradient(135deg,rgba(35,24,53,0.96),rgba(21,17,32,0.95))]',
    iconClassName: 'text-[#dbbeff]',
  },
  host: {
    label: 'Host',
    shortLabel: 'Host',
    icon: Crown,
    pillClassName:
      'border-[rgba(176,107,255,0.3)] bg-[rgba(78,40,125,0.42)] text-[#f0dbff]',
    nameClassName: 'text-[#f3e7ff]',
    rowClassName:
      'border-[rgba(176,107,255,0.22)] bg-[linear-gradient(135deg,rgba(39,25,58,0.98),rgba(23,18,34,0.95))]',
    iconClassName: 'text-[#ecd4ff]',
  },
}

const PLATFORM_ROLE_META: Record<PlatformRoleName, PlatformRoleMeta> = {
  none: {
    label: 'Member',
    shortLabel: 'Member',
    icon: UserRound,
    pillClassName: '',
    iconClassName: '',
  },
  developer: {
    label: 'Developer',
    shortLabel: 'Dev',
    icon: Code2,
    pillClassName:
      'border-[rgba(86,185,255,0.28)] bg-[rgba(18,48,76,0.42)] text-[#8dd2ff]',
    iconClassName: 'text-[#7fd0ff]',
  },
  ambassador: {
    label: 'Ambassador',
    shortLabel: 'Ambassador',
    icon: Sparkles,
    pillClassName:
      'border-[rgba(255,195,102,0.28)] bg-[rgba(84,48,15,0.44)] text-[#ffd184]',
    iconClassName: 'text-[#ffcb74]',
  },
}

export const USER_PRESENCE_GROUP_ORDER: UserPresenceGroupName[] = [
  'developer',
  'ambassador',
  'host',
  'cohost',
  'manager',
  'coordinator',
  'resident_dj',
  'user',
  'guest',
]

const USER_PRESENCE_GROUP_TITLES: Record<UserPresenceGroupName, string> = {
  developer: 'Developers',
  ambassador: 'Embaixadores',
  host: 'Hosts',
  cohost: 'Co-Hosts',
  manager: 'Coordenadores',
  coordinator: 'Moderadores',
  resident_dj: 'Resident DJs',
  user: 'Usuários',
  guest: 'Visitantes',
}

export function normalizeRoomRole(
  value: string | null | undefined,
): RoomRoleName {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return 'user'
  }

  if (normalized in ROOM_ROLE_ALIASES) {
    return ROOM_ROLE_ALIASES[normalized as keyof typeof ROOM_ROLE_ALIASES]
  }

  if (ROOM_ROLE_ORDER.includes(normalized as RoomRoleName)) {
    return normalized as RoomRoleName
  }

  return 'user'
}

export function normalizePlatformRole(
  value: string | null | undefined,
): PlatformRoleName {
  return value === 'developer' || value === 'ambassador' ? value : 'none'
}

export function getRoomRoleMeta(value: string | null | undefined) {
  return ROOM_ROLE_META[normalizeRoomRole(value)]
}

export function getPlatformRoleMeta(value: string | null | undefined) {
  return PLATFORM_ROLE_META[normalizePlatformRole(value)]
}

export function getUserPresenceGroup(
  platformRole: string | null | undefined,
  roomRole: string | null | undefined,
): UserPresenceGroupName {
  const normalizedPlatformRole = normalizePlatformRole(platformRole)
  if (normalizedPlatformRole !== 'none') {
    return normalizedPlatformRole
  }

  return normalizeRoomRole(roomRole)
}

export function getUserPresenceGroupMeta(
  group: UserPresenceGroupName,
): UserPresenceGroupMeta {
  if (group === 'developer' || group === 'ambassador') {
    const platformMeta = PLATFORM_ROLE_META[group]
    return {
      title: USER_PRESENCE_GROUP_TITLES[group],
      icon: platformMeta.icon,
      pillClassName: platformMeta.pillClassName,
      iconClassName: platformMeta.iconClassName,
    }
  }

  const roomMeta = ROOM_ROLE_META[group]
  return {
    title: USER_PRESENCE_GROUP_TITLES[group],
    icon: roomMeta.icon,
    pillClassName: roomMeta.pillClassName,
    iconClassName: roomMeta.iconClassName,
  }
}

export function compareUserPresencePriority(
  left: PresenceSortableUser,
  right: PresenceSortableUser,
) {
  const groupDelta =
    USER_PRESENCE_GROUP_ORDER.indexOf(
      getUserPresenceGroup(left.platformRole, left.role),
    ) -
    USER_PRESENCE_GROUP_ORDER.indexOf(
      getUserPresenceGroup(right.platformRole, right.role),
    )

  if (groupDelta !== 0) {
    return groupDelta
  }

  const roomDelta = compareRoomRoles(left.role, right.role)
  if (roomDelta !== 0) {
    return roomDelta
  }

  return left.username.localeCompare(right.username, undefined, {
    sensitivity: 'base',
  })
}

export function compareRoomRoles(
  left: string | null | undefined,
  right: string | null | undefined,
) {
  return (
    ROOM_ROLE_ORDER.indexOf(normalizeRoomRole(right)) -
    ROOM_ROLE_ORDER.indexOf(normalizeRoomRole(left))
  )
}

export function roomRoleHasPermission(
  role: string | null | undefined,
  permission: RoomPermission,
) {
  return ROOM_ROLE_PERMISSIONS[normalizeRoomRole(role)].includes(permission)
}

export function canManageRoomRole(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
) {
  return (
    ROOM_ROLE_ORDER.indexOf(normalizeRoomRole(actorRole)) >
    ROOM_ROLE_ORDER.indexOf(normalizeRoomRole(targetRole))
  )
}

export function canAssignRoomRole(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
) {
  return ROOM_ASSIGNABLE_ROLES[normalizeRoomRole(actorRole)].includes(
    normalizeRoomRole(targetRole),
  )
}

export function getAssignableRoomRoles(role: string | null | undefined) {
  return [...ROOM_ASSIGNABLE_ROLES[normalizeRoomRole(role)]]
}

export function hasRoomManagementAccess(role: string | null | undefined) {
  return ROOM_MANAGEMENT_PERMISSIONS.some((permission) =>
    roomRoleHasPermission(role, permission),
  )
}
