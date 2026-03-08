import { ArrowRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/Button'

export function CallToAction() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-12 md:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,14,20,0.4)] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md">
        <div
          className="absolute inset-x-0 bottom-0 h-full w-full pointer-events-none opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at bottom, rgba(24,226,153,0.3) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-hover)]">
              Próximo passo
            </p>
            <h2 className="mt-4 text-[2rem] font-bold tracking-tight text-white md:text-[2.75rem] leading-[1.1]">
              Dê um espaço novo para a sua comunidade ouvir junto
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-[var(--text-secondary)] md:text-[17px]">
              Abra uma sala, convide as pessoas certas e deixe a música fazer o
              resto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:shrink-0 mt-4 md:mt-0">
            <Button
              type="button"
              size="lg"
              onClick={() => navigate({ to: '/rooms' })}
              className="rounded-full px-8 h-12 text-[15px] shadow-[0_0_20px_rgba(30,241,165,0.2)]"
            >
              Ver salas
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate({ to: '/register' })}
              className="rounded-full px-8 h-12 text-[15px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all text-[var(--text-secondary)]"
            >
              Criar conta
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
