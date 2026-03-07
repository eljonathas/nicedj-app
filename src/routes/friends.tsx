import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { MessageSquareHeart, Users } from 'lucide-react'

export const Route = createFileRoute('/friends')({
  component: FriendsPage,
})

export function FriendsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 items-center px-6 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-[1.8rem] border border-[var(--border-light)] bg-[linear-gradient(165deg,rgba(18,25,36,0.95),rgba(11,15,23,0.97))] p-8 text-center shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--accent-hover)]">
          <Users className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-white">Social</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          A lista de amigos vai viver aqui, sem tirar voce da sala.
        </p>
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(13,18,27,0.78)] px-3 py-2 text-[12px] font-medium text-[var(--text-muted)]">
          <MessageSquareHeart className="h-4 w-4" />
          Em breve: convites, follows e status online
        </div>
      </motion.div>
    </div>
  )
}
