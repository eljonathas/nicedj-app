import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutGrid,
  ListMusic,
  ShoppingBag,
  User2,
  Users,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { FriendsPage } from '../../routes/friends'
import { PlaylistsPage } from '../../routes/playlists'
import { ProfilePage } from '../../routes/profile.$id'
import { RoomsPage } from '../../routes/rooms'
import { ShopPage } from '../../routes/shop'

const panelMeta = {
  rooms: { title: 'Salas Ativas', icon: LayoutGrid },
  playlists: { title: 'Playlists', icon: ListMusic },
  friends: { title: 'Amigos', icon: Users },
  shop: { title: 'Loja', icon: ShoppingBag },
  profile: { title: 'Perfil', icon: User2 },
} as const

export function FloatingAppPanel() {
  const panel = useUIStore((s) => s.floatingPanel)
  const closeFloatingPanel = useUIStore((s) => s.closeFloatingPanel)
  const isMobile = useUIStore((s) => s.isMobile)
  const roomSidebarWidth = useUIStore((s) => s.roomSidebarWidth)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!panel) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFloatingPanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeFloatingPanel, panel])

  const profileId =
    panel?.view === 'profile' ? (panel.profileId ?? user?.id ?? null) : null

  const content =
    panel?.view === 'rooms' ? (
      <RoomsPage />
    ) : panel?.view === 'playlists' ? (
      <PlaylistsPage />
    ) : panel?.view === 'friends' ? (
      <FriendsPage />
    ) : panel?.view === 'shop' ? (
      <ShopPage />
    ) : panel?.view === 'profile' && profileId ? (
      <ProfilePage profileId={profileId} />
    ) : null

  const meta = panel ? panelMeta[panel.view] : null
  const panelBounds = isMobile
    ? { top: 57, right: 0, bottom: 57, left: 0 }
    : { top: 0, right: roomSidebarWidth, bottom: 0, left: 82 }

  return (
    <AnimatePresence>
      {panel && meta && content && (
        <div className="pointer-events-none fixed z-[140]" style={panelBounds}>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={closeFloatingPanel}
            className="pointer-events-auto absolute inset-0 bg-[rgba(4,7,11,0.22)]"
            aria-label="Fechar menu da sala"
          />

          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto relative flex h-full w-full max-w-[980px] flex-col overflow-hidden border-r border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(10,15,22,0.96)_0%,rgba(8,12,18,0.94)_100%)] shadow-[20px_0_50px_rgba(0,0,0,0.32)] md:rounded-r-[2rem]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,22,0.98)] px-4 py-3 md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--accent-hover)]">
                  <meta.icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Menu da sala
                  </p>
                  <p className="truncate text-[15px] font-semibold text-white">
                    {meta.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFloatingPanel}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] transition-colors hover:text-white"
                aria-label="Fechar painel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
