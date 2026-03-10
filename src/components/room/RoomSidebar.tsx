import { motion } from 'framer-motion'
import {
  Ban,
  GripVertical,
  LogOut,
  Mic2,
  UserRound,
  VolumeX,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { UserPresenceGroupName } from '../../lib/roles'
import { useAuthStore } from '../../stores/authStore'
import { useRoomStore } from '../../stores/roomStore'
import {
  canManageRoomRole,
  compareUserPresencePriority,
  getPlatformRoleMeta,
  getUserPresenceGroup,
  getUserPresenceGroupMeta,
  getRoomRoleMeta,
  normalizePlatformRole,
  roomRoleHasPermission,
  USER_PRESENCE_GROUP_ORDER,
} from '../../lib/roles'
import { Avatar } from '../ui/Avatar'

type RoomSidebarListVariant = 'default' | 'compact'

export function UserList({
  variant = 'default',
}: {
  variant?: RoomSidebarListVariant
} = {}) {
  const users = useRoomStore((s) => s.users)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const wsClient = useAuthStore((s) => s.wsClient)
  const isCompact = variant === 'compact'

  const currentUser = users.find((candidate) => candidate.id === currentUserId)
  const groupedUsers = useMemo(() => {
    const groups = new Map<UserPresenceGroupName, typeof users>()

    for (const user of [...users].sort(compareUserPresencePriority)) {
      const group = getUserPresenceGroup(user.platformRole, user.role)
      const currentGroup = groups.get(group)
      if (currentGroup) {
        currentGroup.push(user)
        continue
      }

      groups.set(group, [user])
    }

    return USER_PRESENCE_GROUP_ORDER.flatMap((group) => {
      const sectionUsers = groups.get(group)
      if (!sectionUsers?.length) {
        return []
      }

      return [
        {
          group,
          users: sectionUsers,
        },
      ]
    })
  }, [users])

  const handleModeration = (
    action: 'mute_user' | 'kick_user' | 'ban_user',
    targetUserId: string,
    username: string,
  ) => {
    if (!wsClient) return

    if (action === 'mute_user') {
      wsClient.send('mute_user', {
        targetUserId,
        reason: `Muted by room staff`,
        durationMs: 15 * 60 * 1000,
      })
      return
    }

    const confirmed = window.confirm(
      action === 'ban_user'
        ? `Banir ${username} da sala?`
        : `Expulsar ${username} da sala?`,
    )

    if (!confirmed) return

    wsClient.send(action, {
      targetUserId,
      reason:
        action === 'ban_user' ? 'Banned by room staff' : 'Kicked by room staff',
    })
  }

  if (users.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(16,21,30,0.95)] text-[var(--text-muted)]">
          <UserRound className="h-4.5 w-4.5" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          Sem usuários conectados
        </p>
      </div>
    )
  }

  return (
    <div
      className={`h-full overflow-y-auto ${
        isCompact ? 'space-y-3 px-3 py-3' : 'space-y-3 px-2.5 py-2'
      }`}
    >
      {groupedUsers.map((section, sectionIndex) => {
        const sectionMeta = getUserPresenceGroupMeta(section.group)
        const SectionIcon = sectionMeta.icon

        return (
          <section
            key={section.group}
            className={isCompact ? 'space-y-2' : 'space-y-1.5'}
          >
            <div
              className={`sticky top-0 z-[1] flex items-center justify-between backdrop-blur-md ${
                isCompact
                  ? 'border-b border-[rgba(255,255,255,0.08)] bg-[rgba(7,11,17,0.94)] px-0.5 py-2'
                  : 'rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(9,13,21,0.88)] px-2.5 py-2'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${sectionMeta.pillClassName}`}
                >
                  <SectionIcon
                    className={`h-3.5 w-3.5 ${sectionMeta.iconClassName}`}
                  />
                </span>
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  {sectionMeta.title}
                </p>
              </div>

              <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                {section.users.length}
              </span>
            </div>

            <div className={isCompact ? 'space-y-2' : 'space-y-1.5'}>
              {section.users.map((user, userIndex) => {
                const roomRole = getRoomRoleMeta(user.role)
                const platformRole = getPlatformRoleMeta(user.platformRole)
                const PlatformIcon = platformRole.icon
                const RoleIcon = roomRole.icon
                const canMute = Boolean(
                  currentUserId &&
                  currentUserId !== user.id &&
                  roomRoleHasPermission(currentUser?.role, 'mute_user') &&
                  canManageRoomRole(currentUser?.role, user.role),
                )
                const canKick = Boolean(
                  currentUserId &&
                  currentUserId !== user.id &&
                  roomRoleHasPermission(currentUser?.role, 'kick_user') &&
                  canManageRoomRole(currentUser?.role, user.role),
                )
                const canBan = Boolean(
                  currentUserId &&
                  currentUserId !== user.id &&
                  roomRoleHasPermission(currentUser?.role, 'ban_user') &&
                  canManageRoomRole(currentUser?.role, user.role),
                )

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.16,
                      delay: sectionIndex * 0.03 + userIndex * 0.015,
                    }}
                    className={`group flex items-center gap-2 border ${
                      isCompact
                        ? 'rounded-[1rem] px-3 py-2.5 shadow-none'
                        : 'rounded-lg px-2.5 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.24)]'
                    } ${
                      roomRole.rowClassName ||
                      'border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,29,0.95)]'
                    }`}
                  >
                    <Avatar
                      username={user.username}
                      src={user.avatar}
                      size="sm"
                      className={isCompact ? 'h-8 w-8' : 'h-7 w-7'}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`truncate text-[12px] font-semibold ${roomRole.nameClassName}`}
                        >
                          {user.username}
                        </p>
                        {normalizePlatformRole(user.platformRole) !==
                          'none' && (
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${platformRole.pillClassName}`}
                            title={platformRole.label}
                          >
                            <PlatformIcon
                              className={`h-2.5 w-2.5 ${platformRole.iconClassName}`}
                            />
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${roomRole.pillClassName}`}
                        >
                          <RoleIcon
                            className={`h-2.5 w-2.5 ${roomRole.iconClassName}`}
                          />
                          {roomRole.shortLabel}
                        </span>

                        {normalizePlatformRole(user.platformRole) !==
                          'none' && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${platformRole.pillClassName}`}
                          >
                            <PlatformIcon
                              className={`h-2.5 w-2.5 ${platformRole.iconClassName}`}
                            />
                            {platformRole.shortLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {(canMute || canKick || canBan) && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        {canMute && (
                          <button
                            type="button"
                            onClick={() =>
                              handleModeration(
                                'mute_user',
                                user.id,
                                user.username,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(14,18,27,0.9)] text-[var(--text-muted)] transition-colors hover:border-[rgba(176,107,255,0.28)] hover:text-[#d8c1ff]"
                            aria-label={`Mutar ${user.username}`}
                            title="Mutar no chat"
                          >
                            <VolumeX className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {canKick && (
                          <button
                            type="button"
                            onClick={() =>
                              handleModeration(
                                'kick_user',
                                user.id,
                                user.username,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(14,18,27,0.9)] text-[var(--text-muted)] transition-colors hover:border-[rgba(255,181,71,0.26)] hover:text-[var(--warning)]"
                            aria-label={`Expulsar ${user.username}`}
                            title="Expulsar da sala"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {canBan && (
                          <button
                            type="button"
                            onClick={() =>
                              handleModeration(
                                'ban_user',
                                user.id,
                                user.username,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(14,18,27,0.9)] text-[var(--text-muted)] transition-colors hover:border-[rgba(255,97,88,0.26)] hover:text-[var(--danger)]"
                            aria-label={`Banir ${user.username}`}
                            title="Banir da sala"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function DJQueue({
  variant = 'default',
}: {
  variant?: RoomSidebarListVariant
} = {}) {
  const queue = useRoomStore((s) => s.queue)
  const users = useRoomStore((s) => s.users)
  const playback = useRoomStore((s) => s.playback)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const wsClient = useAuthStore((s) => s.wsClient)
  const [draggedUserId, setDraggedUserId] = useState<string | null>(null)
  const [dropUserId, setDropUserId] = useState<string | null>(null)
  const isCompact = variant === 'compact'

  const getUser = (userId: string) => users.find((user) => user.id === userId)
  const currentUser = users.find((candidate) => candidate.id === currentUserId)
  const canManageQueue = roomRoleHasPermission(
    currentUser?.role,
    'manage_queue',
  )
  const pinnedDjId = playback?.djId ?? null

  const handleDrop = (targetUserId: string, targetIndex: number) => {
    if (!canManageQueue || !draggedUserId || !wsClient) return
    if (draggedUserId === targetUserId) {
      setDraggedUserId(null)
      setDropUserId(null)
      return
    }

    if (pinnedDjId && targetIndex === 0) {
      setDraggedUserId(null)
      setDropUserId(null)
      return
    }

    wsClient.send('reorder_queue', {
      targetUserId: draggedUserId,
      toPosition: targetIndex,
    })

    setDraggedUserId(null)
    setDropUserId(null)
  }

  if (queue.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(16,21,30,0.95)] text-[var(--text-muted)]">
          <Mic2 className="h-4.5 w-4.5" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          Fila vazia
        </p>
      </div>
    )
  }

  return (
    <div
      className={`h-full overflow-y-auto ${
        isCompact ? 'space-y-2 px-3 py-3' : 'space-y-1.5 px-2.5 py-2'
      }`}
    >
      {canManageQueue && (
        <p
          className={`text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)] ${
            isCompact ? 'px-0.5' : 'px-1'
          }`}
        >
          Arraste para reorganizar a fila
        </p>
      )}

      {queue.map((userId, index) => {
        const user = getUser(userId)
        const username = user?.username || userId
        const isPinnedDj = Boolean(
          pinnedDjId && userId === pinnedDjId && index === 0,
        )
        const draggable = canManageQueue && !isPinnedDj
        const isDropTarget = dropUserId === userId && draggedUserId !== userId

        return (
          <motion.div
            key={userId}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.16, delay: index * 0.015 }}
            draggable={draggable}
            onDragStart={() => {
              if (!draggable) return
              setDraggedUserId(userId)
            }}
            onDragEnd={() => {
              setDraggedUserId(null)
              setDropUserId(null)
            }}
            onDragOver={(event) => {
              if (!canManageQueue || !draggedUserId || isPinnedDj) return
              event.preventDefault()
              setDropUserId(userId)
            }}
            onDragLeave={() => {
              if (dropUserId === userId) {
                setDropUserId(null)
              }
            }}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop(userId, index)
            }}
            className={`flex items-center gap-2 border ${
              isCompact
                ? 'rounded-[1rem] px-3 py-2.5 shadow-none'
                : 'rounded-lg px-2.5 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.24)]'
            } ${
              isDropTarget
                ? 'border-[rgba(176,107,255,0.32)] bg-[rgba(42,27,61,0.92)]'
                : 'border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,29,0.95)]'
            } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            {canManageQueue ? (
              <div
                className={`flex h-6 w-4 shrink-0 items-center justify-center ${
                  draggable
                    ? 'text-[var(--text-muted)]'
                    : 'text-[rgba(255,255,255,0.2)]'
                }`}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            ) : null}

            <div className="h-6 w-6 shrink-0 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(8,12,18,0.9)] text-[10px] font-bold text-[var(--text-secondary)] flex items-center justify-center">
              {index + 1}
            </div>

            <Avatar
              username={username}
              src={user?.avatar}
              size="sm"
              className={isCompact ? 'h-8 w-8' : 'h-7 w-7'}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[var(--text-primary)]">
                {username}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {index === 0 ? 'DJ atual' : 'na fila'}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
