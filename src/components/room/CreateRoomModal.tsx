import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Sparkles, X } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (roomSlug: string) => void
}

export function CreateRoomModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoomModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(50)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('O nome da sala é obrigatório.')
      return
    }

    setError(null)
    setIsLoading(true)

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    try {
      const result = await api<{ slug: string }>('/api/rooms', {
        method: 'POST',
        body: { name, slug, description, capacity, isPrivate },
      })

      onSuccess(result.slug)
      setName('')
      setDescription('')
      setCapacity(50)
      setIsPrivate(false)
    } catch (err: any) {
      setError(err.message || 'Não foi possível criar essa sala.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-lg rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.95),rgba(11,15,23,0.97))] p-6 md:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Nova comunidade
                  </p>
                  <h2 className="section-title mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                    <Sparkles className="h-5 w-5 text-[var(--accent-hover)]" />
                    Criar sala
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Defina identidade, capacidade e visibilidade da sala.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-lg border border-[var(--border-light)] bg-[rgba(23,30,42,0.8)] text-[var(--text-secondary)] hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                  aria-label="Fechar modal"
                >
                  <X className="mx-auto h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Input
                  label="Nome da sala"
                  placeholder="Ex: House & Vinyl Sessions"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  autoFocus
                />

                <Input
                  label="Descrição"
                  placeholder="Qual é a proposta da comunidade?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={160}
                />

                <div className="grid gap-4 sm:grid-cols-[0.65fr_0.35fr]">
                  <Input
                    label="Capacidade"
                    type="number"
                    min={2}
                    max={200}
                    value={capacity}
                    onChange={(event) =>
                      setCapacity(Number(event.target.value))
                    }
                  />

                  <label className="flex h-full items-end rounded-xl border border-[var(--border)] bg-[rgba(23,30,42,0.8)] px-4 py-3">
                    <span className="flex-1 text-sm font-medium text-[var(--text-secondary)]">
                      Sala privada
                    </span>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(event) => setIsPrivate(event.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)]"
                    />
                  </label>
                </div>

                {error && (
                  <div className="rounded-xl border border-[rgba(255,97,88,0.34)] bg-[rgba(62,17,19,0.52)] px-4 py-3 text-sm font-medium text-[var(--danger)] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Criar e entrar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
