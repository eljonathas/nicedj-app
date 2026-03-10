import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Check,
  Coins,
  Gem,
  Loader2,
  Lock,
  Package,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../components/ui/Button'
import { SpriteAvatar } from '../components/ui/SpriteAvatar'
import { getLevelProgress } from '../lib/progression'
import { useAuthStore } from '../stores/authStore'
import { useEconomyStore } from '../stores/economyStore'
import type { AvatarStoreItem } from '../stores/economyStore'

const ITEM_BATCH_SIZE = 24
const LEVEL_GROUP_BATCH_SIZE = 3

export const Route = createFileRoute('/shop')({
  component: ShopPage,
})

export function ShopPage() {
  const user = useAuthStore((state) => state.user)
  const {
    coins,
    diamonds,
    sections,
    ownedAvatarIds,
    equippedAvatarId,
    loading,
    fetchStore,
    fetchWallet,
    fetchInventory,
    purchase,
    equip,
  } = useEconomyStore()
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<
    'inventory' | 'free' | 'level' | 'premium' | null
  >('inventory')
  const [visibleItemCount, setVisibleItemCount] = useState(ITEM_BATCH_SIZE)
  const [visibleLevelGroupCount, setVisibleLevelGroupCount] = useState(
    LEVEL_GROUP_BATCH_SIZE,
  )
  const [pendingLevelScroll, setPendingLevelScroll] = useState<number | null>(
    null,
  )
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const levelGroupRefs = useRef<Record<number, HTMLElement | null>>({})

  useEffect(() => {
    if (!user) return

    void Promise.all([fetchStore(), fetchWallet(), fetchInventory()])
  }, [fetchInventory, fetchStore, fetchWallet, user])

  const ownedAvatarIdsSet = useMemo(
    () => new Set(ownedAvatarIds),
    [ownedAvatarIds],
  )
  const allItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  )
  const activeSection = useMemo(() => {
    if (sections.length === 0) return null

    return (
      sections.find((section) => section.id === activeSectionId) ??
      sections.find((section) => section.id === 'free') ??
      sections[0] ??
      null
    )
  }, [activeSectionId, sections])
  const equippedAvatar =
    allItems.find((item) => item.id === equippedAvatarId) ?? null
  const levelGroups = useMemo(() => {
    if (activeSection?.id !== 'level') {
      return []
    }

    const groups = new Map<number, AvatarStoreItem[]>()
    for (const item of activeSection.items) {
      const unlockLevel = item.unlockLevel ?? 1
      const currentGroup = groups.get(unlockLevel) ?? []
      currentGroup.push(item)
      groups.set(unlockLevel, currentGroup)
    }

    return Array.from(groups.entries())
      .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
      .map(([level, items]) => ({
        level,
        items,
      }))
  }, [activeSection])
  const visibleItems = useMemo(() => {
    if (!activeSection || activeSection.id === 'level') {
      return []
    }

    return activeSection.items.slice(0, visibleItemCount)
  }, [activeSection, visibleItemCount])
  const visibleLevelGroups = useMemo(
    () => levelGroups.slice(0, visibleLevelGroupCount),
    [levelGroups, visibleLevelGroupCount],
  )
  const inventoryItems = useMemo(() => {
    if (activeSectionId !== 'inventory') return []

    return allItems.filter(
      (item) => item.type === 'free' || ownedAvatarIdsSet.has(item.id),
    )
  }, [activeSectionId, allItems, ownedAvatarIdsSet])
  const visibleInventoryItems = useMemo(
    () => inventoryItems.slice(0, visibleItemCount),
    [inventoryItems, visibleItemCount],
  )
  const levelProgress = user
    ? getLevelProgress(user.level, user.xp)
    : { progressPct: 0, xpIntoLevel: 0, xpForNextLevel: 100 }

  useEffect(() => {
    if (sections.length === 0) return

    if (
      activeSectionId !== 'inventory' &&
      !sections.some((section) => section.id === activeSectionId)
    ) {
      setActiveSectionId(
        sections.find((section) => section.id === 'free')?.id ??
        sections[0]?.id ??
        null,
      )
    }
  }, [activeSectionId, sections])

  useEffect(() => {
    setVisibleItemCount(ITEM_BATCH_SIZE)
    setVisibleLevelGroupCount(LEVEL_GROUP_BATCH_SIZE)
  }, [activeSectionId])

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node) return

    const isInventory = activeSectionId === 'inventory'
    if (!isInventory && !activeSection) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return
        }

        if (isInventory) {
          setVisibleItemCount((current) =>
            Math.min(current + ITEM_BATCH_SIZE, inventoryItems.length),
          )
          return
        }

        if (activeSection!.id === 'level') {
          setVisibleLevelGroupCount((current) =>
            Math.min(current + LEVEL_GROUP_BATCH_SIZE, levelGroups.length),
          )
          return
        }

        setVisibleItemCount((current) =>
          Math.min(current + ITEM_BATCH_SIZE, activeSection!.items.length),
        )
      },
      { rootMargin: '320px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [activeSection, activeSectionId, inventoryItems.length, levelGroups.length])

  useEffect(() => {
    if (pendingLevelScroll === null) return

    const target = levelGroupRefs.current[pendingLevelScroll]
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setPendingLevelScroll(null)
  }, [pendingLevelScroll, visibleLevelGroups])

  const handleItemAction = async (item: AvatarStoreItem) => {
    if (!user) return

    const isOwned = item.type === 'free' || ownedAvatarIdsSet.has(item.id)
    setActiveItemId(item.id)

    try {
      if (isOwned) {
        await equip(item.id)
        return
      }

      await purchase(item.id)
    } finally {
      setActiveItemId(null)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center px-6 py-8 md:px-8">
        <div className="w-full rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.95),rgba(11,15,23,0.97))] p-8 text-center shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
          <ShoppingBag className="mx-auto h-10 w-10 text-[var(--accent-hover)]" />
          <h1 className="mt-4 text-2xl font-bold text-white">
            Loja de avatares
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Entre na sua conta para comprar, equipar e evoluir sua colecao.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-6 md:px-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-[var(--border-light)] bg-[linear-gradient(145deg,rgba(18,26,38,0.98),rgba(10,15,22,0.96))] shadow-[0_28px_60px_rgba(0,0,0,0.32)]"
      >
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[1.7rem] border border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top,rgba(30,215,96,0.2),rgba(12,18,28,0.96)_65%)]">
              {user.avatar ? (
                <SpriteAvatar
                  src={user.avatar}
                  alt={user.username}
                  size={72}
                  animate
                  className="rounded-[1.2rem]"
                />
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(30,215,96,0.18)] bg-[rgba(11,29,19,0.74)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-hover)]">
                <Sparkles className="h-3.5 w-3.5" />
                Avatar Shop
              </div>
              <h1 className="mt-3 truncate text-2xl font-bold tracking-tight text-white">
                {equippedAvatar?.name ?? 'Base 01'}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Equipada por {user.username}
              </p>
              <div className="mt-3 flex max-w-sm items-center gap-3">
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Lv {user.level}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#1db954,#6bffb0)]"
                    style={{ width: `${levelProgress.progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {levelProgress.xpForNextLevel - levelProgress.xpIntoLevel} XP
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <WalletStat
              icon={Coins}
              label="Coins"
              value={coins}
              tone="text-[#ffd166]"
            />
            <WalletStat
              icon={Gem}
              label="Diamonds"
              value={diamonds}
              tone="text-[#7de0ff]"
            />
          </div>
        </div>
      </motion.section>

      {loading && sections.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.94),rgba(10,15,22,0.96))] p-3 shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveSectionId('inventory')}
                className={[
                  'group flex min-w-[158px] shrink-0 items-center justify-between gap-3 rounded-[1.2rem] border px-4 py-3 text-left transition-all',
                  activeSectionId === 'inventory'
                    ? 'border-[rgba(30,215,96,0.24)] bg-[rgba(14,24,18,0.92)] text-white shadow-[0_14px_24px_rgba(8,18,12,0.24)]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.14)] hover:text-white',
                ].join(' ')}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    <span className="truncate text-[13px] font-semibold uppercase tracking-[0.12em]">
                      Inventário
                    </span>
                  </div>
                  <p
                    className={[
                      'mt-1 truncate text-[11px]',
                      'text-[var(--text-muted)]',
                    ].join(' ')}
                  >
                    Seus avatares
                  </p>
                </div>
                <span
                  className={[
                    'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                    activeSectionId === 'inventory'
                      ? 'bg-[rgba(255,255,255,0.06)] text-white'
                      : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]',
                  ].join(' ')}
                >
                  {ownedAvatarIds.length}
                </span>
              </button>
              {sections.map((section) => {
                const isActive = activeSectionId === section.id
                const isPremium = section.id === 'premium'

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSectionId(section.id)
                    }}
                    className={[
                      'group flex min-w-[158px] shrink-0 items-center justify-between gap-3 rounded-[1.2rem] border px-4 py-3 text-left transition-all',
                      isPremium
                        ? isActive
                          ? 'border-[rgba(255,227,168,0.45)] bg-[linear-gradient(135deg,rgba(255,196,94,0.95),rgba(125,224,255,0.95))] text-[#081019] shadow-[0_18px_30px_rgba(70,163,210,0.22)]'
                          : 'border-[rgba(255,227,168,0.18)] bg-[linear-gradient(135deg,rgba(82,56,18,0.7),rgba(18,54,66,0.72))] text-white hover:border-[rgba(255,227,168,0.34)]'
                        : isActive
                          ? 'border-[rgba(30,215,96,0.24)] bg-[rgba(14,24,18,0.92)] text-white shadow-[0_14px_24px_rgba(8,18,12,0.24)]'
                          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.14)] hover:text-white',
                    ].join(' ')}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold uppercase tracking-[0.12em]">
                          {section.label}
                        </span>
                        {isPremium ? (
                          <span
                            className={[
                              'inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]',
                              isActive
                                ? 'bg-[rgba(8,16,25,0.16)] text-[#081019]'
                                : 'bg-[rgba(255,255,255,0.08)] text-[#ffe7a8]',
                            ].join(' ')}
                          >
                            Destaque
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={[
                          'mt-1 truncate text-[11px]',
                          isPremium && isActive
                            ? 'text-[rgba(8,16,25,0.82)]'
                            : 'text-[var(--text-muted)]',
                        ].join(' ')}
                      >
                        {section.marker}
                      </p>
                    </div>
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                        isPremium
                          ? isActive
                            ? 'bg-[rgba(8,16,25,0.16)] text-[#081019]'
                            : 'bg-[rgba(255,255,255,0.06)] text-[#ffe7a8]'
                          : isActive
                            ? 'bg-[rgba(255,255,255,0.06)] text-white'
                            : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]',
                      ].join(' ')}
                    >
                      {section.items.length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {activeSectionId === 'inventory' ? (
            <motion.section
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    Seus avatares
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-white">
                    Meu Inventário
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {visibleInventoryItems.length} de {inventoryItems.length} avatares
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleInventoryItems.map((item) => {
                  const isEquipped = equippedAvatarId === item.id

                  return (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      isEquipped={isEquipped}
                      isBusy={activeItemId === item.id}
                      onEquip={() => {
                        setActiveItemId(item.id)
                        void equip(item.id).finally(() =>
                          setActiveItemId(null),
                        )
                      }}
                    />
                  )
                })}
              </div>

              {inventoryItems.length > visibleInventoryItems.length ? (
                <div
                  ref={loadMoreRef}
                  className="mt-6 h-12 w-full"
                  aria-hidden="true"
                >
                  <div className="mx-auto h-1.5 w-24 rounded-full bg-[rgba(255,255,255,0.06)]" />
                </div>
              ) : null}
            </motion.section>
          ) : activeSection ? (
            <motion.section
              key={activeSection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                      activeSection.id === 'premium'
                        ? 'border-[rgba(255,227,168,0.2)] bg-[rgba(82,56,18,0.42)] text-[#ffe7a8]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'h-2 w-2 rounded-full',
                        activeSection.id === 'premium'
                          ? 'bg-[#ffd166]'
                          : 'bg-[var(--accent)]',
                      ].join(' ')}
                    />
                    {activeSection.marker}
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-white">
                    {activeSection.label}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {activeSection.id === 'level'
                      ? `${visibleLevelGroups.reduce(
                        (total, group) => total + group.items.length,
                        0,
                      )} de ${activeSection.items.length} avatares`
                      : `${visibleItems.length} de ${activeSection.items.length} avatares`}
                  </p>
                </div>
              </div>

              {activeSection.id === 'level' ? (
                <>
                  <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                    {levelGroups.map((group) => {
                      const isVisible =
                        group.level <= (visibleLevelGroups.at(-1)?.level ?? 0)
                      return (
                        <button
                          key={group.level}
                          type="button"
                          onClick={() => {
                            const targetIndex = levelGroups.findIndex(
                              (entry) => entry.level === group.level,
                            )
                            setVisibleLevelGroupCount((current) =>
                              Math.max(
                                current,
                                Math.min(levelGroups.length, targetIndex + 1),
                              ),
                            )
                            setPendingLevelScroll(group.level)
                          }}
                          className={[
                            'shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors',
                            group.level === pendingLevelScroll
                              ? 'border-[rgba(30,215,96,0.28)] bg-[rgba(11,29,19,0.88)] text-[var(--accent-hover)]'
                              : isVisible
                                ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-white'
                                : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[var(--text-muted)]',
                          ].join(' ')}
                        >
                          Nivel {group.level}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-col gap-7">
                    {visibleLevelGroups.map((group) => (
                      <section
                        key={group.level}
                        ref={(node) => {
                          levelGroupRefs.current[group.level] = node
                        }}
                        className="scroll-mt-6"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                              Secao de desbloqueio
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-white">
                              Nivel {group.level}
                            </h3>
                          </div>
                          <span className="text-[12px] text-[var(--text-secondary)]">
                            {group.items.length} avatares
                          </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {group.items.map((item) => {
                            const isOwned =
                              item.type === 'free' ||
                              ownedAvatarIdsSet.has(item.id)
                            const isEquipped = equippedAvatarId === item.id
                            const isLevelLocked =
                              user.level < (item.unlockLevel ?? 1)
                            const hasFunds = coins >= item.price

                            return (
                              <AvatarStoreCard
                                key={item.id}
                                item={item}
                                isOwned={isOwned}
                                isEquipped={isEquipped}
                                isLevelLocked={isLevelLocked}
                                hasFunds={hasFunds}
                                isBusy={activeItemId === item.id}
                                onAction={() => void handleItemAction(item)}
                              />
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleItems.map((item) => {
                    const isOwned =
                      item.type === 'free' || ownedAvatarIdsSet.has(item.id)
                    const isEquipped = equippedAvatarId === item.id
                    const isLevelLocked =
                      item.type === 'level' &&
                      user.level < (item.unlockLevel ?? 1)
                    const hasFunds =
                      item.currency === 'diamonds'
                        ? diamonds >= item.price
                        : coins >= item.price

                    return (
                      <AvatarStoreCard
                        key={item.id}
                        item={item}
                        isOwned={isOwned}
                        isEquipped={isEquipped}
                        isLevelLocked={isLevelLocked}
                        hasFunds={hasFunds}
                        isBusy={activeItemId === item.id}
                        onAction={() => void handleItemAction(item)}
                      />
                    )
                  })}
                </div>
              )}

              {(activeSection.id === 'level' &&
                visibleLevelGroups.length < levelGroups.length) ||
                (activeSection.id !== 'level' &&
                  activeSection.items.length > visibleItems.length) ? (
                <div
                  ref={loadMoreRef}
                  className="mt-6 h-12 w-full"
                  aria-hidden="true"
                >
                  <div className="mx-auto h-1.5 w-24 rounded-full bg-[rgba(255,255,255,0.06)]" />
                </div>
              ) : null}
            </motion.section>
          ) : null}
        </div>
      )}
    </div>
  )
}

function WalletStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Coins
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="min-w-[124px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,28,0.82)] px-4 py-3">
      <div
        className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone}`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  )
}

const AvatarStoreCard = memo(function AvatarStoreCard({
  item,
  isOwned,
  isEquipped,
  isLevelLocked,
  hasFunds,
  isBusy,
  onAction,
}: {
  item: AvatarStoreItem
  isOwned: boolean
  isEquipped: boolean
  isLevelLocked: boolean
  hasFunds: boolean
  isBusy: boolean
  onAction: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const actionLabel = isEquipped
    ? 'Selecionado'
    : isOwned
      ? 'Usar avatar'
      : 'Comprar'
  const CurrencyIcon = item.currency === 'diamonds' ? Gem : Coins

  return (
    <div
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-[1.7rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(165deg,rgba(20,27,38,0.94),rgba(11,16,24,0.96))] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-[border-color,background-color] duration-200 hover:border-[rgba(30,215,96,0.22)]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 340px', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,215,96,0.12),transparent_48%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {item.collection}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{item.name}</h3>
        </div>

        {isEquipped ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(30,215,96,0.18)] bg-[rgba(11,29,19,0.74)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-hover)]">
            <Check className="h-3.5 w-3.5" />
            Equipado
          </span>
        ) : isOwned ? (
          <span className="inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Adquirido
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex min-h-[176px] items-center justify-center overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.12),rgba(14,20,30,0.18)_36%,transparent_72%)] px-2 py-2" style={{ transform: 'translateZ(0)' }}>
        <SpriteAvatar
          src={item.url}
          alt={item.name}
          size={132}
          animate={isHovered}
          lazy
          className="shadow-[0_16px_20px_rgba(0,0,0,0.44)] rounded-lg"
        />

        {isLevelLocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[1.45rem] bg-[rgba(6,10,15,0.82)]">
            <Lock className="h-5 w-5 text-white" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              Nivel {item.unlockLevel}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3">
        <div>
          {item.currency === 'free' ? (
            <p className="text-[12px] font-medium text-white">Liberado</p>
          ) : (
            <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
              <CurrencyIcon
                className={`h-4 w-4 ${item.currency === 'diamonds'
                  ? 'text-[#7de0ff]'
                  : 'text-[#ffd166]'
                  }`}
              />
              <span>{item.price}</span>
            </div>
          )}
          {isLevelLocked ? (
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Nivel {item.unlockLevel}
            </p>
          ) : !isOwned && !hasFunds ? (
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Saldo insuficiente
            </p>
          ) : null}
        </div>

        <Button
          size="sm"
          onClick={onAction}
          isLoading={isBusy}
          disabled={
            isBusy || isEquipped || isLevelLocked || (!isOwned && !hasFunds)
          }
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  )
})

const InventoryCard = memo(function InventoryCard({
  item,
  isEquipped,
  isBusy,
  onEquip,
}: {
  item: AvatarStoreItem
  isEquipped: boolean
  isBusy: boolean
  onEquip: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={[
        'group relative overflow-hidden rounded-[1.7rem] border p-4 transition-[border-color,background-color] duration-200',
        isEquipped
          ? 'border-[rgba(30,215,96,0.22)] bg-[linear-gradient(165deg,rgba(14,24,18,0.94),rgba(11,16,24,0.96))] shadow-[0_12px_28px_rgba(0,0,0,0.18)]'
          : 'border-[rgba(255,255,255,0.08)] bg-[linear-gradient(165deg,rgba(20,27,38,0.94),rgba(11,16,24,0.96))] shadow-[0_12px_28px_rgba(0,0,0,0.18)] hover:border-[rgba(30,215,96,0.22)]',
      ].join(' ')}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 280px', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,215,96,0.12),transparent_48%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {item.collection}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{item.name}</h3>
        </div>

        {isEquipped ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(30,215,96,0.18)] bg-[rgba(11,29,19,0.74)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-hover)]">
            <Check className="h-3.5 w-3.5" />
            Equipado
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex min-h-[140px] items-center justify-center overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.12),rgba(14,20,30,0.18)_36%,transparent_72%)] px-2 py-2" style={{ transform: 'translateZ(0)' }}>
        <SpriteAvatar
          src={item.url}
          alt={item.name}
          size={112}
          animate={isHovered}
          lazy
          className="shadow-[0_16px_20px_rgba(0,0,0,0.44)] rounded-lg"
        />
      </div>

      <div className="relative mt-3 flex items-center justify-end">
        <Button
          size="sm"
          variant={isEquipped ? 'secondary' : 'primary'}
          onClick={onEquip}
          isLoading={isBusy}
          disabled={isBusy || isEquipped}
        >
          {isEquipped ? 'Selecionado' : 'Usar avatar'}
        </Button>
      </div>
    </div>
  )
})
