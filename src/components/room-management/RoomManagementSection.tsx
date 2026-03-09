import type { ReactNode } from 'react'

export function RoomManagementSection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(9,13,20,0.82)] shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-3 md:px-5">
        <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-white">
          {title}
        </h2>
        {action}
      </div>

      <div className="px-4 py-4 md:px-5">{children}</div>
    </section>
  )
}
