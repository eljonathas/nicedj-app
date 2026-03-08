import { Link, useNavigate } from '@tanstack/react-router'
import { Disc3 } from 'lucide-react'
import { useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { Button } from '../ui/Button'

export function Header() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const [hasScrolled, setHasScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setHasScrolled(latest > 24)
  })

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        hasScrolled
          ? 'border-b border-[rgba(255,255,255,0.08)] bg-[rgba(5,8,13,0.7)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-5 md:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1ef1a5] to-[#0c9d67] text-black shadow-[0_0_15px_rgba(30,241,165,0.4)] transition-transform group-hover:scale-105">
            <Disc3 className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-[17px] font-bold tracking-tight text-white">
            NiceDJ
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-[var(--text-secondary)] lg:flex">
          <a href="#experience" className="transition-colors hover:text-white">
            Experiência
          </a>
          <a href="#platform" className="transition-colors hover:text-white">
            Plataforma
          </a>
          <a href="#blog" className="transition-colors hover:text-white">
            Blog
          </a>
          <Link to="/rooms" className="transition-colors hover:text-white">
            Salas
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="hidden sm:inline-flex text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-white"
          >
            Entrar
          </button>
          <Button
            type="button"
            size="sm"
            onClick={() => navigate({ to: '/register' })}
            className="h-8 rounded-full px-4 text-[13px] font-semibold"
          >
            Criar conta
          </Button>
        </div>
      </div>
    </header>
  )
}
