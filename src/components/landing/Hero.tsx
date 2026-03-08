import { useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { SignalConstellationSvg } from './Graphics'


export function Hero({
  onPrimary,
  onSecondary,
}: {
  onPrimary: () => void
  onSecondary: () => void
}) {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const heroProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.32,
  })
  const copyY = useTransform(heroProgress, [0, 1], [0, 72])
  const copyOpacity = useTransform(heroProgress, [0, 0.56, 1], [1, 0.94, 0.3])
  const imageY = useTransform(heroProgress, [0, 1], [0, 88])
  const imageScale = useTransform(heroProgress, [0, 1], [1, 1.05])
  const orbitRotate = useTransform(heroProgress, [0, 1], [0, 124])
  const orbitRotateReverse = useTransform(heroProgress, [0, 1], [0, -86])

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#05080d]"
    >
      <motion.div
        style={{
          y: imageY,
          scale: imageScale,
          WebkitMaskImage:
            'linear-gradient(to bottom, black 50%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/hero-banner.png"
          alt="Plateia em um show com lasers verdes e azuis"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40 mix-blend-lighten"
        />
      </motion.div>

      {/* Fixed gradients over the moving image to hide sharp sliding edges */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_bottom,#05080d_0%,transparent_15%,transparent_85%,#05080d_100%)]" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#05080d_0%,transparent_10%,transparent_90%,#05080d_100%)]" />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 12%, rgba(124,184,255,0.08), transparent 28%), radial-gradient(circle at 82% 16%, rgba(24,226,153,0.1), transparent 30%), radial-gradient(circle at 18% 18%, rgba(255,255,255,0.03), transparent 25%)',
        }}
      />
      <motion.div
        style={{ rotate: orbitRotate }}
        className="absolute right-[7%] top-[12%] hidden h-56 w-56 rounded-full border border-[rgba(124,184,255,0.1)] xl:block pointer-events-none"
      />
      <motion.div
        style={{ rotate: orbitRotateReverse }}
        className="absolute right-[10%] top-[15%] hidden h-40 w-40 rounded-full border border-[rgba(24,226,153,0.08)] xl:block pointer-events-none"
      />
      <SignalConstellationSvg className="absolute inset-x-0 top-20 h-[20rem] w-full opacity-30 pointer-events-none" />

      {/* Mintlify bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-[#05080d] to-transparent pointer-events-none z-10" />

      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-between gap-12 px-5 pb-16 pt-32 md:px-8 md:pt-36 lg:gap-16 lg:px-10 lg:pt-40">
        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          className="max-w-3xl shrink-0 z-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-1 mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[var(--accent-hover)] animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
              Salas para ouvir junto e entrar no clima
            </p>
          </div>

          <h1 className="mt-2 max-w-4xl text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-white md:text-[4rem] lg:text-[4.75rem]">
            A música fica melhor quando a sala inteira entra no clima
            <span className="bg-gradient-to-r from-[#8fffb8] to-[#1ef1a5] bg-clip-text text-transparent">
              {' '}
              junto com você.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--text-secondary)]">
            NiceDJ junta palco, chat, fila e avatares em uma experiência só.
            Quem entra entende rápido o que está tocando, quem está ali e como
            participar sem quebrar o momento.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Button
              type="button"
              size="lg"
              onClick={onPrimary}
              className="rounded-full px-8 h-12 text-[15px] shadow-[0_0_20px_rgba(30,241,165,0.2)]"
            >
              Começar grátis
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onSecondary}
              className="rounded-full px-8 h-12 text-[15px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all text-[var(--text-secondary)]"
            >
              Explorar salas
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ProofChip text="Clima de festival" />
            <ProofChip text="Entrada simples e bonita" />
            <ProofChip text="Personagens ganhando vida" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ProofChip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white">
      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
      {text}
    </span>
  )
}

