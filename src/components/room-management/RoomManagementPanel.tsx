import { ScrollText, Settings2, SmilePlus, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useRoomStore } from '../../stores/roomStore'
import { useRoomManagementStore } from '../../stores/roomManagementStore'
import { hasRoomManagementAccess, roomRoleHasPermission } from '../../lib/roles'
import { RoomManagementAuditSection } from './RoomManagementAuditSection'
import { RoomManagementEmojiSection } from './RoomManagementEmojiSection'
import { RoomManagementSettingsSection } from './RoomManagementSettingsSection'
import { RoomManagementTabs } from './RoomManagementTabs'
import type {
  RoomManagementTabId,
  RoomManagementTabItem,
} from './RoomManagementTabs'
import { RoomManagementUsersSection } from './RoomManagementUsersSection'

export function RoomManagementPanel() {
  const currentRoom = useRoomStore((s) => s.room)
  const users = useRoomStore((s) => s.users)
  const setRoom = useRoomStore((s) => s.setRoom)
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const wsClient = useAuthStore((s) => s.wsClient)
  const [activeTab, setActiveTab] = useState<RoomManagementTabId>('users')
  const [auditRequestedForRoomId, setAuditRequestedForRoomId] = useState<
    string | null
  >(null)

  const currentUser = users.find((user) => user.id === currentUserId) ?? null
  const currentUserRole = currentUser?.role ?? null

  const {
    room,
    customEmojis,
    queueRestrictionUserIds,
    auditLogs,
    loading,
    auditLoading,
    saving,
    error,
    hydrate,
    fetchAuditLogs,
    updateSettings,
    setRole,
    setQueueAccess,
    createEmoji,
    deleteEmoji,
    reset,
  } = useRoomManagementStore()

  const canManageRoom = roomRoleHasPermission(currentUserRole, 'manage_room')
  const canManageEmojis = roomRoleHasPermission(
    currentUserRole,
    'manage_emojis',
  )
  const canViewAuditLogs = roomRoleHasPermission(
    currentUserRole,
    'view_audit_logs',
  )

  const tabs = useMemo(() => {
    const nextTabs: RoomManagementTabItem[] = [
      { id: 'users', label: 'Pessoas', icon: Users },
    ]

    if (canManageRoom) {
      nextTabs.push({ id: 'settings', label: 'Sala', icon: Settings2 })
    }

    if (canManageEmojis) {
      nextTabs.push({ id: 'emojis', label: 'Emojis', icon: SmilePlus })
    }

    if (canViewAuditLogs) {
      nextTabs.push({ id: 'audit', label: 'Auditoria', icon: ScrollText })
    }

    return nextTabs
  }, [canManageEmojis, canManageRoom, canViewAuditLogs])

  useEffect(() => {
    if (!currentRoom?.id || !hasRoomManagementAccess(currentUserRole)) {
      reset()
      return
    }

    void hydrate(currentRoom.id)

    return () => reset()
  }, [currentRoom?.id, currentUserRole, hydrate, reset])

  useEffect(() => {
    setAuditRequestedForRoomId(null)
  }, [currentRoom?.id])

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id ?? 'users')
    }
  }, [activeTab, tabs])

  useEffect(() => {
    if (
      !currentRoom?.id ||
      !canViewAuditLogs ||
      activeTab !== 'audit' ||
      auditRequestedForRoomId === currentRoom.id
    ) {
      return
    }

    setAuditRequestedForRoomId(currentRoom.id)
    void fetchAuditLogs(currentRoom.id)
  }, [
    activeTab,
    auditRequestedForRoomId,
    canViewAuditLogs,
    currentRoom?.id,
    fetchAuditLogs,
  ])

  if (!currentRoom) {
    return (
      <div className="flex h-full items-center justify-center px-5 text-center text-[14px] text-[var(--text-secondary)]">
        Entre em uma sala para abrir a gestão.
      </div>
    )
  }

  if (!hasRoomManagementAccess(currentUserRole)) {
    return (
      <div className="flex h-full items-center justify-center px-5 text-center text-[14px] text-[var(--text-secondary)]">
        Voce nao tem acesso a gestao desta sala.
      </div>
    )
  }

  if (loading && !room) {
    return (
      <div className="flex h-full items-center justify-center px-5 text-center text-[14px] text-[var(--text-secondary)]">
        Carregando gestao da sala...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 py-4 md:px-5 md:py-5">
      {error ? (
        <div className="mb-4 rounded-[1.35rem] border border-[rgba(255,97,88,0.18)] bg-[rgba(60,18,22,0.78)] px-4 py-3 text-[13px] font-medium text-[#ffd6d3]">
          {error}
        </div>
      ) : null}

      <div className="sticky top-0 z-10 mb-4 bg-[linear-gradient(180deg,rgba(8,12,18,0.96)_0%,rgba(8,12,18,0.84)_76%,rgba(8,12,18,0)_100%)] pb-3">
        <RoomManagementTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'users' ? (
        <RoomManagementUsersSection
          users={users}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          queueRestrictionUserIds={queueRestrictionUserIds}
          saving={saving}
          wsClient={wsClient}
          onSetRole={async (userId, role) => {
            await setRole(currentRoom.id, userId, role)
          }}
          onSetQueueAccess={async (userId, blocked) => {
            await setQueueAccess(currentRoom.id, userId, blocked)
          }}
        />
      ) : null}

      {activeTab === 'settings' && canManageRoom ? (
        <RoomManagementSettingsSection
          name={room?.name ?? currentRoom.name}
          description={room?.description ?? currentRoom.description}
          queueLocked={room?.queueLocked ?? currentRoom.queueLocked ?? false}
          saving={saving || loading}
          onSave={async (input) => {
            const nextRoom = await updateSettings(currentRoom.id, input)
            setRoom({
              id: nextRoom.id,
              name: nextRoom.name,
              slug: nextRoom.slug,
              description: nextRoom.description,
              ownerId: nextRoom.ownerId,
              ownerUsername: currentRoom.ownerUsername,
              queueLocked: nextRoom.queueLocked,
            })
          }}
        />
      ) : null}

      {activeTab === 'emojis' && canManageEmojis ? (
        <RoomManagementEmojiSection
          emojis={customEmojis}
          saving={saving}
          onCreate={async (input) => {
            await createEmoji(currentRoom.id, input)
          }}
          onDelete={async (emojiId) => {
            await deleteEmoji(currentRoom.id, emojiId)
          }}
        />
      ) : null}

      {activeTab === 'audit' && canViewAuditLogs ? (
        <RoomManagementAuditSection
          logs={auditLogs}
          loading={auditLoading}
          onRefresh={async () => {
            setAuditRequestedForRoomId(currentRoom.id)
            await fetchAuditLogs(currentRoom.id)
          }}
        />
      ) : null}
    </div>
  )
}
