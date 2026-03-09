import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { RoomManagementEmoji } from '../../stores/roomManagementStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { RoomManagementSection } from './RoomManagementSection'

export function RoomManagementEmojiSection({
  emojis,
  saving,
  onCreate,
  onDelete,
}: {
  emojis: RoomManagementEmoji[]
  saving: boolean
  onCreate: (input: { shortcode: string; imageUrl: string }) => Promise<void>
  onDelete: (emojiId: string) => Promise<void>
}) {
  const [shortcode, setShortcode] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const handleCreate = async () => {
    if (!shortcode.trim() || !imageUrl.trim()) return

    await onCreate({
      shortcode,
      imageUrl,
    })

    setShortcode('')
    setImageUrl('')
  }

  return (
    <RoomManagementSection title="Emojis">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto]">
          <Input
            value={shortcode}
            onChange={(event) => setShortcode(event.target.value)}
            placeholder="shortcode"
          />
          <Input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://"
            type="url"
          />
          <Button
            size="sm"
            isLoading={saving}
            disabled={!shortcode.trim() || !imageUrl.trim()}
            onClick={() => void handleCreate()}
          >
            Adicionar
          </Button>
        </div>

        {emojis.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {emojis.map((emoji) => (
              <div
                key={emoji.id}
                className="flex items-center gap-3 rounded-[1.25rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.05)]">
                  <img
                    src={emoji.imageUrl}
                    alt={emoji.shortcode}
                    className="h-8 w-8 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">
                    :{emoji.shortcode}:
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void onDelete(emoji.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] transition-colors hover:text-white"
                  aria-label={`Remover emoji ${emoji.shortcode}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-6 text-center text-[13px] text-[var(--text-secondary)]">
            Nenhum emoji customizado.
          </div>
        )}
      </div>
    </RoomManagementSection>
  )
}
