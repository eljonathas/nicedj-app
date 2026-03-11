import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Disc3,
  LayoutGrid,
  ListMusic,
  Loader2,
  LogOut,
  Radio,
  Shield,
  ShoppingBag,
  User2,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { FloatingAppPanel } from '../components/layout/FloatingAppPanel'
import { subscribeToAuthInvalidated } from '../lib/authEvents'
import { hasRoomManagementAccess } from '../lib/roles'
import { useAuthStore } from '../stores/authStore'
import { useRoomStore } from '../stores/roomStore'
import { useUIStore } from '../stores/uiStore'

export const Route = createRootRoute({
  component: RootLayout,
})

const navItems = [
  { to: '/rooms', icon: LayoutGrid, label: 'Salas', floatingView: 'rooms' },
  {
    to: '/playlists',
    icon: ListMusic,
    label: 'Playlists',
    floatingView: 'playlists',
  },
  { to: '/friends', icon: Users, label: 'Amigos', floatingView: 'friends' },
  { to: '/shop', icon: ShoppingBag, label: 'Loja', floatingView: 'shop' },
] as const

type FloatingPanelView = NonNullable<
  ReturnType<typeof useUIStore.getState>['floatingPanel']
>['view']

type ConnectionBannerTone = 'warning' | 'danger'

type ConnectionBanner = {
  tone: ConnectionBannerTone
  message: string
}

type NetworkInformationLike = {
  effectiveType?: string
  saveData?: boolean
  downlink?: number
  rtt?: number
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

function isSlowConnection(connection: NetworkInformationLike | undefined) {
  if (!connection) {
    return false
  }

  if (connection.saveData) {
    return true
  }

  if (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g'
  ) {
    return true
  }

  if (typeof connection.downlink === 'number' && connection.downlink < 1) {
    return true
  }

  return typeof connection.rtt === 'number' && connection.rtt > 650
}

function RootLayout() {
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const username = useAuthStore((s) => s.user?.username ?? null)
  const logout = useAuthStore((s) => s.logout)
  const initialized = useAuthStore((s) => s.initialized)
  const initialize = useAuthStore((s) => s.initialize)
  const wsClient = useAuthStore((s) => s.wsClient)
  const setError = useAuthStore((s) => s.setError)
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const currentUserRoomRole = useRoomStore((s) =>
    userId
      ? (s.users.find((member) => member.id === userId)?.role ?? null)
      : null,
  )
  const floatingPanel = useUIStore((s) => s.floatingPanel)
  const openFloatingPanel = useUIStore((s) => s.openFloatingPanel)
  const closeFloatingPanel = useUIStore((s) => s.closeFloatingPanel)
  const navigate = useNavigate()
  const location = useLocation()
  const [connectionBanner, setConnectionBanner] =
    useState<ConnectionBanner | null>(null)
  const [wsDisconnected, setWsDisconnected] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    return subscribeToAuthInvalidated(({ message }) => {
      logout()
      setError(message)
      closeFloatingPanel()
      useRoomStore.getState().reset()
      navigate({ to: '/login', replace: true })
    })
  }, [closeFloatingPanel, logout, navigate, setError])

  useEffect(() => {
    closeFloatingPanel()
  }, [closeFloatingPanel, location.pathname])

  useEffect(() => {
    setWsDisconnected(false)

    if (!wsClient) {
      return
    }

    const disconnect = wsClient.on('_disconnected', () => {
      setWsDisconnected(true)
    })
    const reconnect = wsClient.on('_connected', () => {
      setWsDisconnected(false)
    })

    return () => {
      disconnect()
      reconnect()
    }
  }, [wsClient])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const networkInfo = (
      navigator as Navigator & {
        connection?: NetworkInformationLike
      }
    ).connection

    const updateConnectionBanner = () => {
      if (!window.navigator.onLine) {
        setConnectionBanner({
          tone: 'danger',
          message: 'Sua conexão caiu. Tentando reconectar o app.',
        })
        return
      }

      if (wsDisconnected) {
        setConnectionBanner({
          tone: 'warning',
          message: 'Reconectando à sala. Chat e sincronização podem atrasar.',
        })
        return
      }

      if (isSlowConnection(networkInfo)) {
        setConnectionBanner({
          tone: 'warning',
          message:
            'Sua conexão está lenta. Mensagens, votos e player podem atrasar.',
        })
        return
      }

      setConnectionBanner(null)
    }

    const handleNetworkChange = () => {
      updateConnectionBanner()
    }

    updateConnectionBanner()
    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)
    networkInfo?.addEventListener?.('change', handleNetworkChange)

    return () => {
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
      networkInfo?.removeEventListener?.('change', handleNetworkChange)
    }
  }, [wsDisconnected])

  const handleLogout = () => {
    setError(null)
    logout()
    navigate({ to: '/login' })
  }

  const toggleFloatingPanel = (
    view: FloatingPanelView,
    options?: { profileId?: string | null },
  ) => {
    if (floatingPanel?.view === view) {
      closeFloatingPanel()
      return
    }

    openFloatingPanel(view, options)
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    )
  }

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register'
  const isMarketingPage = location.pathname === '/'
  const useFloatingMenus =
    Boolean(activeRoom) && location.pathname.startsWith('/room/')
  const canManageActiveRoom = hasRoomManagementAccess(currentUserRoomRole)

  if (isAuthPage || isMarketingPage) {
    return (
      <div className="min-h-screen shell-background text-[var(--text-primary)]">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen shell-background text-[var(--text-primary)]">
      {connectionBanner ? (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex justify-center px-4">
          <div
            className={`pointer-events-auto inline-flex max-w-[720px] items-center gap-3 rounded-full border px-4 py-2.5 text-[13px] font-medium shadow-[0_18px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl ${
              connectionBanner.tone === 'danger'
                ? 'border-[rgba(255,107,99,0.3)] bg-[rgba(53,18,20,0.9)] text-[#ffd6d3]'
                : 'border-[rgba(255,191,105,0.24)] bg-[rgba(44,28,12,0.88)] text-[#ffdba5]'
            }`}
            role="status"
            aria-live="polite"
          >
            {connectionBanner.tone === 'danger' ? (
              <WifiOff className="h-4 w-4 shrink-0" />
            ) : wsDisconnected ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Wifi className="h-4 w-4 shrink-0" />
            )}
            <span>{connectionBanner.message}</span>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen">
        <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-[82px] md:flex-col border-r border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <div className="flex h-full flex-col items-center justify-between py-4">
            <div className="flex w-full flex-col items-center gap-4 px-2">
              <Link
                to="/"
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[#031208]">
                  <Disc3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-[13px] font-bold tracking-tight text-white">
                    NiceDJ
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Live
                  </p>
                </div>
              </Link>

              <nav className="flex w-full flex-col items-center gap-2">
                {navItems.map((item) => {
                  const isActive = useFloatingMenus
                    ? floatingPanel?.view === item.floatingView
                    : location.pathname === item.to ||
                      location.pathname.startsWith(`${item.to}/`)
                  const itemClassName = `flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                    isActive
                      ? 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.86)] text-[var(--accent-hover)]'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] hover:text-white'
                  }`

                  if (useFloatingMenus) {
                    return (
                      <button
                        key={item.to}
                        type="button"
                        title={item.label}
                        onClick={() => toggleFloatingPanel(item.floatingView)}
                        className={itemClassName}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={item.label}
                      className={itemClassName}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </Link>
                  )
                })}

                {activeRoom ? (
                  <>
                    <div className="my-1 h-px w-8 bg-[rgba(255,255,255,0.1)]" />

                    <Link
                      to="/room/$slug"
                      params={{ slug: activeRoom.slug }}
                      title={activeRoom.name}
                      onClick={() => closeFloatingPanel()}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(55,210,124,0.26)] bg-[#1c4a3095] text-[var(--accent-hover)]"
                    >
                      <Radio className="h-4.5 w-4.5" />
                    </Link>

                    {useFloatingMenus && canManageActiveRoom ? (
                      <button
                        type="button"
                        title="Gestão da sala"
                        onClick={() => toggleFloatingPanel('room')}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                          floatingPanel?.view === 'room'
                            ? 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.86)] text-[var(--accent-hover)]'
                            : 'border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] hover:text-white'
                        }`}
                        aria-label="Abrir gestão da sala"
                      >
                        <Shield className="h-4.5 w-4.5" />
                      </button>
                    ) : null}
                  </>
                ) : null}
              </nav>
            </div>

            <div className="w-full px-2">
              {userId ? (
                <div className="flex flex-col items-center gap-2">
                  {useFloatingMenus ? (
                    <button
                      type="button"
                      title={username ?? 'Perfil'}
                      onClick={() =>
                        toggleFloatingPanel('profile', { profileId: userId })
                      }
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${
                        floatingPanel?.view === 'profile'
                          ? 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.86)] text-[var(--accent-hover)]'
                          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      <User2 className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <Link
                      to="/profile/$id"
                      params={{ id: userId }}
                      title={username ?? 'Perfil'}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-secondary)] transition-colors hover:text-white"
                    >
                      <User2 className="h-4.5 w-4.5" />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.66)] text-[var(--text-muted)] transition-colors hover:border-[rgba(255,97,88,0.3)] hover:text-[var(--danger)]"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex h-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[11px] font-semibold text-[#031208] transition-all hover:brightness-110"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 min-w-0 flex-col">
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-40 border-b border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-2.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[var(--accent)] text-[#031208] flex items-center justify-center">
                <Disc3 className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold tracking-tight">
                NiceDJ
              </span>
            </Link>

            {userId && (
              <button
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg border border-[var(--border-light)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--danger)] flex items-center justify-center cursor-pointer"
                aria-label="Sair"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </header>

          {/* Mobile Bottom Tab Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-light)] bg-[var(--bg-secondary)] flex items-center justify-around py-2 px-1">
            {navItems.map((item) => {
              const active = useFloatingMenus
                ? floatingPanel?.view === item.floatingView
                : location.pathname === item.to
              const itemClassName = `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`

              if (useFloatingMenus) {
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => toggleFloatingPanel(item.floatingView)}
                    className={itemClassName}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                )
              }

              return (
                <Link key={item.to} to={item.to} className={itemClassName}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}

            {useFloatingMenus && canManageActiveRoom ? (
              <button
                type="button"
                onClick={() => toggleFloatingPanel('room')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
                  floatingPanel?.view === 'room'
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <Shield className="h-5 w-5" />
                Gestão
              </button>
            ) : null}
          </nav>

          <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
            <Outlet />
          </main>

          {useFloatingMenus && <FloatingAppPanel />}
        </div>
      </div>
    </div>
  )
}
