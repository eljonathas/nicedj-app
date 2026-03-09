import type { LucideIcon } from 'lucide-react'

export type RoomManagementTabId = 'users' | 'settings' | 'emojis' | 'audit'

export interface RoomManagementTabItem {
  id: RoomManagementTabId
  label: string
  icon: LucideIcon
}

export function RoomManagementTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: RoomManagementTabItem[]
  activeTab: RoomManagementTabId
  onChange: (tabId: RoomManagementTabId) => void
}) {
  return (
    <div className="overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div
        role="tablist"
        aria-label="Gestao da sala"
        className="inline-flex min-w-full items-center gap-1 rounded-[1.45rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(9,13,20,0.86)] p-1.5 backdrop-blur-xl"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex min-w-max flex-1 items-center justify-center gap-2 rounded-[1.1rem] px-3 py-2 text-[12px] font-medium transition-all ${
                isActive
                  ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
