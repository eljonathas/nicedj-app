import { useEffect, useState } from 'react'
import { RoomManagementSection } from './RoomManagementSection'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Switch } from '../ui/Switch'

export function RoomManagementSettingsSection({
  name,
  description,
  queueLocked,
  saving,
  onSave,
}: {
  name: string
  description: string
  queueLocked: boolean
  saving: boolean
  onSave: (input: {
    name: string
    description: string
    queueLocked: boolean
  }) => Promise<void>
}) {
  const [draftName, setDraftName] = useState(name)
  const [draftDescription, setDraftDescription] = useState(description)
  const [draftQueueLocked, setDraftQueueLocked] = useState(queueLocked)

  useEffect(() => {
    setDraftName(name)
    setDraftDescription(description)
    setDraftQueueLocked(queueLocked)
  }, [description, name, queueLocked])

  const dirty =
    draftName !== name ||
    draftDescription !== description ||
    draftQueueLocked !== queueLocked

  return (
    <RoomManagementSection
      title="Sala"
      action={
        <Button
          size="sm"
          onClick={() =>
            void onSave({
              name: draftName,
              description: draftDescription,
              queueLocked: draftQueueLocked,
            })
          }
          disabled={!dirty}
          isLoading={saving}
        >
          Salvar
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Nome da sala"
        />

        <textarea
          value={draftDescription}
          onChange={(event) => setDraftDescription(event.target.value)}
          placeholder="Descrição"
          className="min-h-28 w-full rounded-[1.4rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.92)] px-4 py-3 text-[14px] text-white outline-none transition-colors focus:border-[rgba(176,107,255,0.32)]"
        />

        <div className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
          <span className="text-[13px] font-semibold text-white">
            Bloquear fila de espera
          </span>
          <Switch
            checked={draftQueueLocked}
            onCheckedChange={setDraftQueueLocked}
            ariaLabel="Bloquear fila de espera"
          />
        </div>
      </div>
    </RoomManagementSection>
  )
}
