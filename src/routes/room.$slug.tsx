import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Disc3,
  ListMusic,
  Loader2,
  Lock,
  MessageSquare,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useRoomStore } from '../stores/roomStore'
import { useUIStore } from '../stores/uiStore'
import { useWsEvents } from '../hooks/useWsEvents'
import { api } from '../lib/api'
import { MediaPlayer } from '../components/player/MediaPlayer'
import {
  RoomPlaylistDock,
  RoomProfileDock,
  RoomTopBar,
} from '../components/room/RoomFooter'
import { QueueActionButton, VoteBar } from '../components/room/VoteBar'
import { ChatPanel } from '../components/chat/ChatPanel'
import { Stage } from '../components/room/Stage'
import { DJQueue, UserList } from '../components/room/RoomSidebar'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/room/$slug')({
  component: RoomPage,
})

interface RoomData {
  id: string
  name: string
  slug: string
  description: string
  ownerId: string
  ownerUsername: string
  capacity: number
  isPrivate: boolean
  queueLocked?: boolean
}

function RoomPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const wsClient = useAuthStore((s) => s.wsClient)

  const room = useRoomStore((s) => s.room)
  const users = useRoomStore((s) => s.users)
  const playback = useRoomStore((s) => s.playback)
  const currentDjId = playback?.djId
  const roomEventError = useRoomStore((s) => s.errorMessage)
  const reset = useRoomStore((s) => s.reset)
  const setRoom = useRoomStore((s) => s.setRoom)

  const {
    activePanel,
    setActivePanel,
    isMobile,
    setIsMobile,
    setRoomSidebarWidth,
  } = useUIStore()
  const [loadingRoom, setLoadingRoom] = useState(true)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

  useWsEvents(wsClient)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoadingRoom(true)
        setRoomError(null)

        const data = await api<RoomData>(`/api/rooms/${slug}`)
        setRoom({
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          ownerId: data.ownerId,
          ownerUsername: data.ownerUsername,
          queueLocked: data.queueLocked ?? false,
        })
      } catch (err: any) {
        setRoomError(err.message || 'Sala indisponível.')
      } finally {
        setLoadingRoom(false)
      }
    }

    void fetchRoom()
  }, [setRoom, slug])

  useEffect(() => {
    if (!wsClient || !room?.id) return

    wsClient.send('join_room', { roomId: room.id })
  }, [room?.id, wsClient])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024)
    handler()

    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [setIsMobile])

  useEffect(() => {
    if (isMobile) {
      setRoomSidebarWidth(0)
      return
    }

    setRoomSidebarWidth(isPanelCollapsed ? 58 : 336)
  }, [isMobile, isPanelCollapsed, setRoomSidebarWidth])

  useEffect(() => {
    return () => {
      setRoomSidebarWidth(336)
    }
  }, [setRoomSidebarWidth])

  const panelTabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'users' as const, label: 'Pessoas', icon: Users },
    { id: 'queue' as const, label: 'Fila', icon: ListMusic },
  ]

  const hostName = useMemo(() => {
    if (!room) return 'aguardando host'

    const hostUser =
      users.find((candidate) => candidate.role === 'host') ??
      users.find((candidate) => candidate.id === room.ownerId)

    return hostUser?.username ?? room.ownerUsername ?? 'aguardando host'
  }, [room, users])

  if (loadingRoom) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    )
  }

  if (roomError) {
    return (
      <div className="mx-auto flex h-full w-full max-w-lg items-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card w-full rounded-[1.8rem] p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(255,97,88,0.14)] text-[var(--danger)]">
            <Disc3 className="h-7 w-7" />
          </div>
          <h2 className="section-title text-2xl font-bold">
            Sala não encontrada
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {roomError}
          </p>
          <Button onClick={() => navigate({ to: '/rooms' })} className="mt-6">
            Voltar para salas
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex h-full w-full max-w-lg items-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card w-full rounded-[1.8rem] p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(10,132,255,0.14)] text-[#79bdff]">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="section-title text-2xl font-bold">Acesso restrito</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Faça login para participar da sala e interagir em tempo real.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={() => navigate({ to: '/login' })}>Entrar</Button>
            <Button
              variant="secondary"
              onClick={() => navigate({ to: '/register' })}
            >
              Criar conta
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const panelHeader = (
    <div className="shrink-0 border-b border-[rgba(255,255,255,0.08)] bg-[#0c1119] shadow-[0_14px_32px_rgba(0,0,0,0.35)]">
      <div
        className={`flex items-center ${isPanelCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-3'}`}
      >
        {!isPanelCollapsed && (
          <div className="mr-2 grid w-full grid-cols-3 gap-1 p-1">
            {panelTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex h-8 items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition-all ${
                  activePanel === tab.id
                    ? 'bg-[rgba(255,255,255,0.1)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsPanelCollapsed((value) => !value)}
          className="h-8 w-8 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(13,18,27,0.95)] text-[var(--text-secondary)] transition-colors hover:text-white"
          aria-label={isPanelCollapsed ? 'Expandir painel' : 'Recolher painel'}
        >
          {isPanelCollapsed ? (
            <ChevronLeft className="mx-auto h-4 w-4" />
          ) : (
            <ChevronRight className="mx-auto h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )

  const stageContent = (
    <div className="relative h-full min-h-0 flex-1">
      <Stage users={users} djId={currentDjId} />

      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-160">
          <div className="mx-auto aspect-video w-full overflow-hidden rounded-2xl">
            <MediaPlayer />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-40">
        <div className="pointer-events-auto">
          <QueueActionButton />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-40">
        <div className="pointer-events-auto">
          <VoteBar floating showQueueAction={false} />
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full w-full bg-[#080c13]"
      >
        <div className="flex h-full flex-col">
          <header className="shrink-0 border-b border-[rgba(255,255,255,0.08)] bg-[#0b1018] shadow-[0_16px_38px_rgba(0,0,0,0.4)]">
            <RoomTopBar
              roomName={room?.name || 'Sala'}
              hostName={hostName}
              activeUsersCount={users.length}
              errorMessage={roomEventError}
            />
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            <section className="relative flex-[1.05] min-h-[280px]">
              {stageContent}
            </section>

            <section className="flex min-h-0 flex-1 flex-col border-t border-[rgba(255,255,255,0.08)] bg-[#0a0f17]">
              <div className="border-b border-[rgba(255,255,255,0.08)] px-2 py-2">
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-[rgba(9,13,20,0.96)] p-1">
                  {panelTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePanel(tab.id)}
                      className={`flex h-8 items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition-all ${
                        activePanel === tab.id
                          ? 'bg-[rgba(255,255,255,0.1)] text-white'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePanel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute inset-0"
                  >
                    {activePanel === 'chat' && <ChatPanel />}
                    {activePanel === 'users' && <UserList />}
                    {activePanel === 'queue' && <DJQueue />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="shrink-0 border-t border-[rgba(255,255,255,0.08)]">
                <RoomProfileDock />
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-[rgba(255,255,255,0.08)] bg-[#0a0f17] shadow-[0_-10px_24px_rgba(0,0,0,0.34)]">
            <RoomPlaylistDock />
          </footer>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full bg-[#080c13]"
    >
      <div className="flex h-full w-full min-h-0">
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-[rgba(255,255,255,0.08)] bg-[#0b1018] shadow-[0_16px_38px_rgba(0,0,0,0.4)]">
            <RoomTopBar
              roomName={room?.name || 'Sala'}
              hostName={hostName}
              activeUsersCount={users.length}
              errorMessage={roomEventError}
            />
          </header>

          {stageContent}

          <footer className="shrink-0 border-t border-[rgba(255,255,255,0.08)] bg-[#0a0f17] shadow-[0_-10px_24px_rgba(0,0,0,0.34)]">
            <RoomPlaylistDock />
          </footer>
        </section>

        <aside
          className={`shrink-0 border-l border-[rgba(255,255,255,0.08)] bg-[#0a0f17] transition-all duration-300 ${
            isPanelCollapsed ? 'w-[58px]' : 'w-[336px]'
          }`}
        >
          <div className="flex h-full min-h-0 flex-col">
            {panelHeader}

            {isPanelCollapsed ? (
              <div className="flex flex-1 flex-col items-center gap-1 py-2.5">
                {panelTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePanel(tab.id)
                      setIsPanelCollapsed(false)
                    }}
                    className={`h-9 w-9 rounded-md border transition-colors ${
                      activePanel === tab.id
                        ? 'border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] text-white'
                        : 'border-[rgba(255,255,255,0.1)] bg-[rgba(13,18,27,0.92)] text-[var(--text-muted)]'
                    }`}
                    aria-label={tab.label}
                  >
                    <tab.icon className="mx-auto h-4 w-4" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative flex-1 min-h-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activePanel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute inset-0"
                  >
                    {activePanel === 'chat' && <ChatPanel />}
                    {activePanel === 'users' && <UserList />}
                    {activePanel === 'queue' && <DJQueue />}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <div
              className={`shrink-0 border-t border-[rgba(255,255,255,0.08)]`}
            >
              <div className={isPanelCollapsed ? 'flex justify-center' : ''}>
                <RoomProfileDock collapsed={isPanelCollapsed} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}
