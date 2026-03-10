import { Ban, Lock, LogOut, VolumeX } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WsClient } from '../../lib/ws'
import {
  canManageRoomRole,
  compareUserPresencePriority,
  getAssignableRoomRoles,
  getRoomRoleMeta,
  normalizeRoomRole,
  roomRoleHasPermission,
} from '../../lib/roles'
import type { RoomUser } from '../../stores/roomStore'
import { Avatar } from '../ui/Avatar'
import { RoomManagementSection } from './RoomManagementSection'

function actionButtonClassName(active = false) {
  return [
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
    active
      ? 'border-[rgba(255,191,105,0.32)] bg-[rgba(63,38,12,0.88)] text-[#ffdba5]'
      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:text-white',
  ].join(' ')
}

export function RoomManagementUsersSection({
  users,
  currentUserId,
  currentUserRole,
  queueRestrictionUserIds,
  saving,
  wsClient,
  onSetRole,
  onSetQueueAccess,
}: {
  users: RoomUser[]
  currentUserId: string | null
  currentUserRole: string | null | undefined
  queueRestrictionUserIds: string[]
  saving: boolean
  wsClient: WsClient | null
  onSetRole: (userId: string, role: string | null) => Promise<void>
  onSetQueueAccess: (userId: string, blocked: boolean) => Promise<void>
}) {
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const sortedUsers = useMemo(
    () => [...users].sort(compareUserPresencePriority),
    [users],
  )
  const assignableRoles = getAssignableRoomRoles(currentUserRole)
  const blockedIds = useMemo(
    () => new Set(queueRestrictionUserIds),
    [queueRestrictionUserIds],
  )

  const handleRoleChange = async (userId: string, role: string) => {
    setPendingKey(`role:${userId}`)
    try {
      await onSetRole(userId, role === 'user' ? null : role)
    } finally {
      setPendingKey(null)
    }
  }

  const handleQueueToggle = async (userId: string, blocked: boolean) => {
    setPendingKey(`queue:${userId}`)
    try {
      await onSetQueueAccess(userId, blocked)
    } finally {
      setPendingKey(null)
    }
  }

  const handleModeration = (
    action: 'mute_user' | 'kick_user' | 'ban_user',
    user: RoomUser,
  ) => {
    if (!wsClient) return

    if (action === 'mute_user') {
      wsClient.send('mute_user', {
        targetUserId: user.id,
        reason: 'Muted by room staff',
        durationMs: 15 * 60 * 1000,
      })
      return
    }

    const confirmed = window.confirm(
      action === 'ban_user'
        ? `Banir ${user.username} da sala?`
        : `Expulsar ${user.username} da sala?`,
    )
    if (!confirmed) return

    wsClient.send(action, {
      targetUserId: user.id,
      reason:
        action === 'ban_user' ? 'Banned by room staff' : 'Kicked by room staff',
    })
  }

  return (
    <RoomManagementSection title="Pessoas">
      <div className="space-y-3">
        {sortedUsers.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-6 text-center text-[13px] text-[var(--text-secondary)]">
            Sem usuarios conectados.
          </div>
        ) : null}

        {sortedUsers.map((user) => {
          const roleMeta = getRoomRoleMeta(user.role)
          const canManageTarget = Boolean(
            currentUserId &&
            currentUserId !== user.id &&
            canManageRoomRole(currentUserRole, user.role),
          )
          const canMute =
            canManageTarget &&
            roomRoleHasPermission(currentUserRole, 'mute_user')
          const canKick =
            canManageTarget &&
            roomRoleHasPermission(currentUserRole, 'kick_user')
          const canBan =
            canManageTarget &&
            roomRoleHasPermission(currentUserRole, 'ban_user')
          const canManageQueue =
            canManageTarget &&
            roomRoleHasPermission(currentUserRole, 'manage_queue')
          const canManageRoles =
            canManageTarget &&
            roomRoleHasPermission(currentUserRole, 'manage_roles') &&
            assignableRoles.length > 0
          const isQueueBlocked = blockedIds.has(user.id)
          const isBusy =
            saving ||
            pendingKey === `role:${user.id}` ||
            pendingKey === `queue:${user.id}`

          return (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-[1.3rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  username={user.username}
                  src={user.avatar}
                  size="sm"
                  className="h-10 w-10"
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {user.username}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${roleMeta.pillClassName}`}
                    >
                      {roleMeta.shortLabel}
                    </span>
                    {isQueueBlocked ? (
                      <span className="inline-flex items-center rounded-full border border-[rgba(255,191,105,0.24)] bg-[rgba(63,38,12,0.76)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ffdba5]">
                        Fila bloqueada
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                {(canManageQueue || canMute || canKick || canBan) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {canManageQueue ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          void handleQueueToggle(user.id, !isQueueBlocked)
                        }
                        className={actionButtonClassName(isQueueBlocked)}
                        aria-label={
                          isQueueBlocked
                            ? `Liberar fila para ${user.username}`
                            : `Bloquear fila para ${user.username}`
                        }
                        title={
                          isQueueBlocked
                            ? 'Liberar fila de espera'
                            : 'Bloquear fila de espera'
                        }
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    ) : null}

                    {canMute ? (
                      <button
                        type="button"
                        onClick={() => handleModeration('mute_user', user)}
                        className={actionButtonClassName()}
                        aria-label={`Mutar ${user.username}`}
                        title="Mutar chat"
                      >
                        <VolumeX className="h-4 w-4" />
                      </button>
                    ) : null}

                    {canKick ? (
                      <button
                        type="button"
                        onClick={() => handleModeration('kick_user', user)}
                        className={actionButtonClassName()}
                        aria-label={`Expulsar ${user.username}`}
                        title="Expulsar"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    ) : null}

                    {canBan ? (
                      <button
                        type="button"
                        onClick={() => handleModeration('ban_user', user)}
                        className={actionButtonClassName()}
                        aria-label={`Banir ${user.username}`}
                        title="Banir"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                )}

                {canManageRoles ? (
                  <select
                    value={normalizeRoomRole(user.role)}
                    disabled={isBusy}
                    onChange={(event) =>
                      void handleRoleChange(user.id, event.target.value)
                    }
                    className="h-10 min-w-44 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.92)] px-3 text-[12px] font-medium text-white outline-none transition-colors focus:border-[rgba(176,107,255,0.32)]"
                  >
                    {assignableRoles.map((role) => (
                      <option key={role} value={role}>
                        {getRoomRoleMeta(role).label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </RoomManagementSection>
  )
}
