import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Radio, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '../ui/Avatar'

export type RoomMobileSheetTab = 'users' | 'queue'

export interface RoomCompactSheetTab {
  id: RoomMobileSheetTab
  label: string
  icon: LucideIcon
  badge?: number
  content: ReactNode
}

interface RoomCompactLayoutProps {
  roomName: string
  hostName: string
  activeUsersCount: number
  errorMessage?: string | null
  currentUsername: string
  currentUserAvatar?: string | null
  isViewportMobile: boolean
  stage: ReactNode
  stageMedia?: ReactNode
  mobilePlayer?: ReactNode
  controls: ReactNode
  primaryAction?: ReactNode
  chat: ReactNode
  sheetTabs: RoomCompactSheetTab[]
  onOpenProfile: () => void
}

export function RoomCompactLayout({
  roomName,
  hostName,
  activeUsersCount,
  errorMessage,
  currentUsername,
  currentUserAvatar,
  isViewportMobile,
  stage,
  stageMedia,
  mobilePlayer,
  controls,
  primaryAction,
  chat,
  sheetTabs,
  onOpenProfile,
}: RoomCompactLayoutProps) {
  const [activeSheetTab, setActiveSheetTab] = useState<RoomMobileSheetTab>(
    () => sheetTabs[0]?.id ?? 'users',
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const activeTab = useMemo(
    () => sheetTabs.find((tab) => tab.id === activeSheetTab) ?? sheetTabs[0],
    [activeSheetTab, sheetTabs],
  )
  const contentBottomPadding = isViewportMobile ? 74 : 24
  const overlayBounds = isViewportMobile
    ? { top: 48, right: 0, bottom: 57, left: 0 }
    : { top: 0, right: 0, bottom: 0, left: 82 }
  const sheetMaxHeight = isViewportMobile
    ? 'min(72dvh, 540px)'
    : 'min(78vh, 680px)'
  const stageHeight = isViewportMobile
    ? 'clamp(248px, 31dvh, 296px)'
    : 'clamp(300px, 36dvh, 360px)'
  const actionCount = sheetTabs.length + (primaryAction ? 1 : 0)

  const openSheet = (tabId: RoomMobileSheetTab) => {
    setActiveSheetTab(tabId)
    setIsSheetOpen(true)
  }

  return (
    <div className="h-full w-full overflow-hidden bg-[#080c13]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="shrink-0 border-b border-[rgba(255,255,255,0.08)] bg-[#0b1018] shadow-[0_16px_38px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5">
                  <Radio className="h-3 w-3 text-[var(--accent-hover)]" />
                  Ao vivo
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {activeUsersCount}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-1.5">
                <p className="min-w-0 truncate text-[14px] font-semibold tracking-tight text-white">
                  {roomName}
                </p>
                <span className="truncate text-[9px] text-[var(--text-secondary)]">
                  Host {hostName}
                </span>
                {errorMessage ? (
                  <span className="truncate rounded-full border border-[rgba(255,97,88,0.26)] bg-[rgba(68,17,19,0.78)] px-1.5 py-0.5 text-[9px] font-semibold text-[rgba(255,214,211,0.94)]">
                    {errorMessage}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenProfile}
              title={currentUsername}
              className="shrink-0 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-0.5 transition-colors hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.06)]"
              aria-label={`Abrir perfil de ${currentUsername}`}
            >
              <Avatar
                username={currentUsername}
                src={currentUserAvatar}
                size="md"
                className="h-7 w-7"
              />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 pb-2 pt-1.5">
            <div className="relative overflow-hidden border-y border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,18,0.92)] shadow-[0_20px_42px_rgba(0,0,0,0.28)]">
              {stageMedia ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0"
                >
                  {stageMedia}
                </div>
              ) : null}

              <div className="relative">
                <div className="w-full" style={{ height: stageHeight }}>
                  {stage}
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,rgba(8,12,18,0)_0%,rgba(8,12,18,0.72)_58%,rgba(8,12,18,0.96)_100%)]" />
              </div>

              <div className="border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(7,10,15,0.96),rgba(10,14,21,0.98))] px-3 pb-3 pt-2.5">
                <div className="space-y-2">
                  <div>{controls}</div>

                  {isViewportMobile && mobilePlayer ? (
                    <div>{mobilePlayer}</div>
                  ) : null}

                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.max(1, actionCount)}, minmax(0, 1fr))`,
                    }}
                  >
                    {primaryAction ? (
                      <div data-testid="room-primary-action" className="w-full">
                        {primaryAction}
                      </div>
                    ) : null}

                    {sheetTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        data-testid={`room-view-cta-${tab.id}`}
                        onClick={() => openSheet(tab.id)}
                        className="flex h-11 min-w-0 items-center gap-2 rounded-[1.1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,16,24,0.72)] px-3 text-left shadow-[0_12px_24px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-colors hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(16,22,31,0.84)]"
                        aria-label={`Abrir ${tab.label}`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]">
                          <tab.icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-white">
                            {tab.label}
                          </p>
                        </div>

                        {typeof tab.badge === 'number' ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-secondary)]">
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-hidden px-3 pb-3"
            style={{ paddingBottom: `${contentBottomPadding}px` }}
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,13,19,0.88)] shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
              {chat}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSheetOpen ? (
          <div
            className="pointer-events-none fixed z-[110]"
            style={overlayBounds}
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="pointer-events-auto absolute inset-0 bg-[rgba(3,6,10,0.56)] backdrop-blur-[3px]"
              onClick={() => setIsSheetOpen(false)}
              aria-label="Fechar painel da sala"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <div className="pointer-events-auto mx-auto w-full max-w-[880px] px-2.5 pb-2.5">
                <motion.section
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 28 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex w-full flex-col overflow-hidden rounded-[1.7rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(10,15,22,0.98),rgba(8,12,18,0.97))] shadow-[0_24px_54px_rgba(0,0,0,0.42)]"
                  style={{ maxHeight: sheetMaxHeight }}
                >
                  <div className="px-4 pt-2">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-[rgba(255,255,255,0.16)]" />
                  </div>

                  <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-2.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        Painel da sala
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]">
                          <activeTab.icon className="h-4 w-4" />
                        </div>
                        <p className="truncate text-[15px] font-semibold text-white">
                          {activeTab.label}
                        </p>
                        {typeof activeTab.badge === 'number' ? (
                          <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                            {activeTab.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSheetOpen(false)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] transition-colors hover:text-white"
                      aria-label="Fechar painel da sala"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={activeTab.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.16 }}
                      className="min-h-0 flex-1 overflow-hidden border-t border-[rgba(255,255,255,0.08)] bg-[rgba(7,11,17,0.94)]"
                    >
                      {activeTab.content}
                    </motion.div>
                  </AnimatePresence>
                </motion.section>
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
