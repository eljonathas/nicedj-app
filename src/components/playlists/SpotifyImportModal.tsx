import { AnimatePresence, motion } from 'framer-motion'
import { ListMusic, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface SpotifyImportModalProps {
  isOpen: boolean
  value: string
  error: string | null
  isLoading: boolean
  onChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void | Promise<void>
}

export function SpotifyImportModal({
  isOpen,
  value,
  error,
  isLoading,
  onChange,
  onClose,
  onSubmit,
}: SpotifyImportModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-lg rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.95),rgba(11,15,23,0.97))] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Spotify
                  </p>
                  <h2 className="section-title mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                    <ListMusic className="h-5 w-5 text-[var(--accent-hover)]" />
                    Importar playlist
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-lg border border-[var(--border-light)] bg-[rgba(23,30,42,0.8)] text-[var(--text-secondary)] transition-colors hover:border-white/30 hover:text-white"
                  aria-label="Fechar modal"
                >
                  <X className="mx-auto h-4 w-4" />
                </button>
              </div>

              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void onSubmit()
                }}
              >
                <Input
                  label="Link da playlist"
                  placeholder="https://open.spotify.com/playlist/..."
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  error={error ?? undefined}
                  autoFocus
                />

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                    disabled={!value.trim()}
                  >
                    Importar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
