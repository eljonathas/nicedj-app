import { RefreshCw } from 'lucide-react'
import type { RoomManagementAuditLog } from '../../stores/roomManagementStore'
import { Button } from '../ui/Button'
import { RoomManagementSection } from './RoomManagementSection'

function formatAuditAction(log: RoomManagementAuditLog) {
  switch (log.action) {
    case 'mute_user':
      return 'mutou'
    case 'kick_user':
      return 'expulsou'
    case 'ban_user':
      return 'baniu'
    case 'clear_chat':
      return 'limpou o chat'
    case 'queue_reordered':
      return 'reordenou a fila'
    case 'queue_access_blocked':
      return 'bloqueou a fila de'
    case 'queue_access_restored':
      return 'liberou a fila de'
    case 'role_updated':
      return 'alterou o cargo de'
    case 'room_updated':
      return 'atualizou a sala'
    case 'emoji_created':
      return 'adicionou emoji'
    case 'emoji_deleted':
      return 'removeu emoji'
    default:
      return log.action
  }
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function RoomManagementAuditSection({
  logs,
  loading,
  onRefresh,
}: {
  logs: RoomManagementAuditLog[]
  loading: boolean
  onRefresh: () => Promise<void>
}) {
  return (
    <RoomManagementSection
      title="Auditoria"
      action={
        <Button
          size="sm"
          variant="secondary"
          isLoading={loading}
          onClick={() => void onRefresh()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
    >
      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-[1.2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
            >
              <p className="text-[13px] text-white">
                <span className="font-semibold">
                  {log.actorUsername ?? 'Sistema'}
                </span>{' '}
                {formatAuditAction(log)}{' '}
                {log.targetUsername ? (
                  <span className="font-semibold">{log.targetUsername}</span>
                ) : null}
              </p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                {formatTimestamp(log.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-6 text-center text-[13px] text-[var(--text-secondary)]">
          Nenhum registro recente.
        </div>
      )}
    </RoomManagementSection>
  )
}
