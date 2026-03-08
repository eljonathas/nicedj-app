import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  CheckCircle2,
  Disc3,
  Heart,
  ListMusic,
  Radio,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from 'lucide-react'
import { OpsWaveSvg, SignalConstellationSvg } from './Graphics'

export function FeatureShowcase() {
  return (
    <>
      <ScrollShowcaseSection
        id="experience"
        eyebrow="Como a sala se apresenta"
        title="Tudo o que acontece aparece no lugar certo"
        description="Quem entra entende rápido o que está rolando: quem está tocando, o que vem depois, o que o chat está comentando e como participar sem se perder."
        points={[
          'Palco e player na mesma leitura',
          'Chat e fila sempre à mão',
          'Visual fiel ao que a sala entrega de verdade',
        ]}
      >
        <div className="rounded-[2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,14,20,0.5)] p-2 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <RoomPreview />
        </div>
      </ScrollShowcaseSection>

      <ScrollShowcaseSection
        eyebrow="Identidade em cena"
        title="Os personagens ajudam a contar a história da sala"
        description="Avatares, badges e níveis deixam cada presença mais memorável. Em vez de parecer enfeite, a identidade visual reforça quem está ali e o papel de cada pessoa."
        points={[
          'Personagens visíveis desde o primeiro olhar',
          'Papéis e destaque com leitura simples',
          'Presença visual que acompanha o clima da música',
        ]}
      >
        <CharacterShowcaseCard />
      </ScrollShowcaseSection>

      <ScrollShowcaseSection
        eyebrow="Sinais da comunidade"
        title="A energia da sala aparece sem poluir a experiência"
        description="Votos, menções e ferramentas de cuidado convivem com naturalidade. Você entende o momento da sala sem disputar atenção com a interface."
        points={[
          'Reações com contexto',
          'Menções fáceis de acompanhar',
          'Ferramentas de cuidado no mesmo fluxo',
        ]}
      >
        <SignalOpsCard />
      </ScrollShowcaseSection>
    </>
  )
}

function ScrollShowcaseSection({
  id,
  eyebrow,
  title,
  description,
  points,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  description: string
  points: string[]
  children: ReactNode
}) {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.34,
  })
  const copyY = useTransform(progress, [0, 0.5, 1], [64, 0, -30])
  const copyOpacity = useTransform(
    progress,
    [0, 0.18, 0.82, 1],
    [0.18, 1, 1, 0.24],
  )
  const frameY = useTransform(progress, [0, 0.5, 1], [120, 0, -70])
  const frameScale = useTransform(progress, [0, 0.5, 1], [0.94, 1, 0.98])
  const frameOpacity = useTransform(
    progress,
    [0, 0.18, 0.82, 1],
    [0.12, 1, 1, 0.22],
  )

  return (
    <section id={id} ref={ref} className="relative min-h-[145vh]">
      <div className="sticky top-24">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 lg:px-10">
          <motion.div
            style={{ y: copyY, opacity: copyOpacity }}
            className="max-w-3xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-hover)]">
              {eyebrow}
            </p>
            <h2 className="mt-4 max-w-4xl text-[2rem] font-bold leading-[1.15] tracking-tight text-white md:text-[3rem]">
              {title}
            </h2>
            <p className="mt-5 max-w-3xl text-[16px] leading-[1.6] text-[var(--text-secondary)] md:text-[18px]">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {points.map((point) => (
                <StoryPoint key={point} text={point} />
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: frameY, scale: frameScale, opacity: frameOpacity }}
            className="mt-12"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CharacterShowcaseCard() {
  return (
    <div className="rounded-[2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,14,20,0.5)] p-2 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div
        className="relative overflow-hidden rounded-[1.6rem] px-6 pb-8 pt-8 md:px-10 md:pb-12 md:pt-10"
        style={{
          background:
            'radial-gradient(circle at 50% 18%, rgba(24,226,153,0.08), transparent 28%), radial-gradient(circle at 18% 18%, rgba(124,184,255,0.08), transparent 25%), linear-gradient(180deg, #090d14 0%, #06090e 100%)',
        }}
      >
        <SignalConstellationSvg className="absolute inset-x-0 top-4 h-[14rem] w-full opacity-30" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
              Personagens
            </span>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-[1.75rem]">
              Identidade visual que faz a sala parecer habitada
            </h3>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Os sprites entram em cena com função clara. Eles mostram
              personalidade, reforçam cargos e ajudam a comunidade a reconhecer
              quem está vivendo aquele momento junto.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[400px]">
            <IdentityStat label="Visuais" value="59+" />
            <IdentityStat label="Papéis" value="Destaque claro" />
            <IdentityStat label="Evolução" value="Níveis e conquistas" />
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-12 max-w-5xl">
          <div
            className="absolute inset-x-[10%] bottom-8 h-24 rounded-[100%] blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(24,226,153,0.15) 0%, rgba(124,184,255,0.1) 36%, transparent 76%)',
            }}
          />

          <div className="relative h-[20rem] md:h-[23rem]">
            {[
              {
                name: 'Mika',
                role: 'Host',
                sheetUrl:
                  '/sprites/subscription_44/subscription_required/dragon-e03b.png',
                frameWidth: 220,
                frameHeight: 220,
                sheetFrameCount: 48,
                scale: 1.16,
                left: '12%',
                bottom: '0.4rem',
                delay: 0.04,
              },
              {
                name: 'Ayla',
                role: 'VIP',
                sheetUrl: '/sprites/free_15/free/base12b.png',
                frameWidth: 220,
                frameHeight: 217,
                sheetFrameCount: 24,
                scale: 0.74,
                left: '30%',
                bottom: '0.8rem',
                delay: 0.12,
              },
              {
                name: 'Nova',
                role: 'Resident DJ',
                sheetUrl:
                  '/sprites/subscription_44/subscription_required/dragon-e01b.png',
                frameWidth: 220,
                frameHeight: 220,
                sheetFrameCount: 48,
                scale: 1.34,
                left: '50%',
                bottom: '2.8rem',
                delay: 0.2,
              },
              {
                name: 'Rui',
                role: 'Manager',
                sheetUrl: '/sprites/free_15/free/base10b.png',
                frameWidth: 220,
                frameHeight: 217,
                sheetFrameCount: 24,
                scale: 0.74,
                left: '71%',
                bottom: '1rem',
                delay: 0.28,
              },
              {
                name: 'Zed',
                role: 'Crew',
                sheetUrl: '/sprites/free_15/free/base05b.png',
                frameWidth: 220,
                frameHeight: 217,
                sheetFrameCount: 24,
                scale: 0.74,
                left: '88%',
                bottom: '0.2rem',
                delay: 0.34,
              },
            ].map((character) => (
              <SpriteFigureDummy
                key={character.name}
                name={character.name}
                role={character.role}
                sheetUrl={character.sheetUrl}
                frameWidth={character.frameWidth}
                frameHeight={character.frameHeight}
                sheetFrameCount={character.sheetFrameCount}
                scale={character.scale}
                left={character.left}
                bottom={character.bottom}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpriteFigureDummy({
  name,
  role,
  sheetUrl,
  frameWidth,
  frameHeight,
  sheetFrameCount = 1,
  startFrame = 0,
  endFrame,
  animationSteps,
  scale = 1,
  left,
  bottom,
}: any) {
  const actualEndFrame = endFrame ?? sheetFrameCount
  const actualSteps = animationSteps ?? actualEndFrame - startFrame

  const startOffset = -startFrame * frameWidth
  const endOffset = -actualEndFrame * frameWidth

  // A simplified un-animated version for the cards to save performance
  const spriteStyle = {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url(${sheetUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${frameWidth * sheetFrameCount}px ${frameHeight}px`,
    backgroundPosition: `${startOffset}px center`,
    imageRendering: 'pixelated' as const,
    transform: `scale(${scale})`,
    transformOrigin: '50% 100%',
    ['--stage-start-offset' as const]: `${startOffset}px`,
    ['--stage-end-offset' as const]: `${endOffset}px`,
  }

  return (
    <div className="absolute -translate-x-1/2" style={{ left, bottom }}>
      <div className="relative">
        <div
          className="stage-scene-sprite relative overflow-hidden"
          style={{
            ...spriteStyle,
            animation: `stage-scene-strip 2000ms steps(${actualSteps}) infinite`,
          }}
        />
        <div className="mt-2 text-center pointer-events-none">
          <p className="text-[11px] font-semibold text-white">{name}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            {role}
          </p>
        </div>
      </div>
    </div>
  )
}

function SignalOpsCard() {
  return (
    <div className="rounded-[2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,14,20,0.5)] p-2 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div
        className="relative overflow-hidden rounded-[1.6rem] px-6 pb-6 pt-6 md:px-8 md:pb-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,12,18,0.98) 0%, rgba(6,9,14,1) 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 18% 20%, rgba(124,184,255,0.08), transparent 30%), radial-gradient(circle at 76% 8%, rgba(24,226,153,0.08), transparent 30%)',
          }}
        />

        <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Reações da sala
                </p>
                <h3 className="mt-2 text-[17px] font-bold text-white">
                  O clima da pista aparece em tempo real
                </h3>
              </div>
              <span className="rounded-full border border-[rgba(24,226,153,0.2)] bg-[rgba(24,226,153,0.06)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-hover)]">
                Ao vivo
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(5,8,13,0.88)] p-4 shadow-inner">
              <OpsWaveSvg />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <VoteSignalCard
                icon={ThumbsUp}
                label="Woot"
                value="428"
                tone="rgba(55,210,124,0.12)"
                textColor="#93ffc0"
              />
              <VoteSignalCard
                icon={Heart}
                label="Grab"
                value="96"
                tone="rgba(255,181,71,0.12)"
                textColor="#ffd488"
              />
              <VoteSignalCard
                icon={ThumbsDown}
                label="Meh"
                value="14"
                tone="rgba(255,97,88,0.12)"
                textColor="#ffb0aa"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Menções
              </p>
              <div className="mt-4 rounded-[1rem] border border-[rgba(255,176,82,0.1)] bg-[rgba(255,176,82,0.04)] px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[var(--text-secondary)]">
                    LU
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white">Lua</p>
                    <p className="text-[10px] font-medium text-[var(--text-muted)]">
                      21:14
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                  Segura esse drop{' '}
                  <span className="inline-flex rounded-full bg-[rgba(255,176,82,0.15)] px-1.5 py-[1px] font-semibold text-[#ffd289]">
                    @Sora
                  </span>{' '}
                  a sala virou de vez.
                </p>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Cuidado com a sala
              </p>
              <div className="mt-4 space-y-2.5">
                <ModerationRow
                  label="Quem cuida da sala"
                  value="Host, manager e moderação sempre por perto"
                />
                <ModerationRow
                  label="Ações rápidas"
                  value="Silenciar, organizar a fila e agir quando preciso"
                />
                <ModerationRow
                  label="Contexto"
                  value="Alertas e decisões aparecem no mesmo fluxo da sala"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoomPreview() {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.06)] bg-[#080c13] shadow-inner">
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#0b1018] px-5 py-3.5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold tracking-tight text-white">
              House Nation
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[var(--text-muted)]">
              <span className="truncate">Host Sora Waves</span>
              <span className="text-[rgba(255,255,255,0.2)]">•</span>
              <span>428 ao vivo</span>
              <span className="rounded-full border border-[rgba(24,226,153,0.15)] bg-[rgba(24,226,153,0.06)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-hover)]">
                Sala sincronizada
              </span>
            </div>
          </div>

          <div className="grid w-full gap-2 xl:max-w-[28rem]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)]">
                <Disc3 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  Midnight Current
                </p>
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">
                  Sora Waves
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[var(--text-secondary)]">
                02:18 / 04:45
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-1 flex-1 rounded-full bg-[rgba(255,255,255,0.08)]">
                <div className="h-full w-[48%] rounded-full bg-[linear-gradient(90deg,var(--accent),#8fffb8)] shadow-[0_0_8px_rgba(30,241,165,0.4)]" />
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
                <Volume2 className="h-3.5 w-3.5" />
                74
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[34rem] xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="relative min-h-[25rem] overflow-hidden border-b border-[rgba(255,255,255,0.06)] xl:border-b-0 xl:border-r">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat opacity-80"
            style={{
              backgroundImage: 'url(/stages/default.b9f5c461.jpg)',
              backgroundPosition: 'center bottom',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.7) 0%,rgba(8,12,18,0.5) 35%,rgba(8,11,17,0.85) 100%)]" />
          <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-100px_120px_rgba(0,0,0,0.8)]" />

          <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center px-4">
            <div className="pointer-events-auto w-full max-w-[32rem] rounded-[1.1rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(165deg,rgba(16,22,31,0.8),rgba(8,12,19,0.85))] backdrop-blur-md p-3 shadow-[0_22px_48px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    Ao vivo
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    Peak Session
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(24,226,153,0.15)] bg-[rgba(24,226,153,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent-hover)]">
                  <Radio className="h-3 w-3" />
                  Sincronizado
                </span>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-[7.75rem] z-20 flex justify-center px-8">
            <div className="h-[5.5rem] w-[10.5rem] rounded-[2rem_2rem_1rem_1rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(18,24,36,0.95),rgba(8,12,18,0.98))] shadow-[0_22px_44px_rgba(0,0,0,0.5)]" />
          </div>

          <div className="absolute inset-x-0 bottom-[11.5rem] z-30 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-12 rounded-t-[1.5rem] rounded-b-[0.85rem] bg-[linear-gradient(180deg,rgba(245,248,255,0.92),rgba(164,176,199,0.9))] shadow-[0_10px_24px_rgba(0,0,0,0.4)]" />
              <span className="mt-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(7,11,17,0.85)] backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-[var(--text-secondary)] shadow-[0_10px_18px_rgba(0,0,0,0.5)]">
                Sora Waves
              </span>
            </div>
          </div>

          {[
            { name: 'Nina', left: '15%', bottom: '18%', active: false },
            { name: 'Kai', left: '27%', bottom: '13%', active: true },
            { name: 'Maya', left: '40%', bottom: '19%', active: false },
            { name: 'Jo', left: '57%', bottom: '14%', active: false },
            { name: 'Leo', left: '72%', bottom: '18%', active: false },
            { name: 'Bia', left: '84%', bottom: '12%', active: false },
          ].map((person) => (
            <PreviewAudiencePill
              key={person.name}
              name={person.name}
              left={person.left}
              bottom={person.bottom}
              active={person.active}
            />
          ))}

          <div className="pointer-events-none absolute bottom-5 left-5 z-40">
            <div className="pointer-events-auto flex min-w-[176px] items-center justify-between gap-3 rounded-[1.2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,13,19,0.6)] px-3.5 py-3 shadow-[0_18px_34px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]">
                  <ListMusic className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    Sua vez
                  </span>
                  <span className="block text-[13px] font-semibold text-white">
                    Entrar na fila
                  </span>
                </div>
              </div>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                Fila 16
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-5 right-5 z-40">
            <div className="pointer-events-auto flex items-stretch gap-1.5 rounded-[1.2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,13,19,0.6)] p-1.5 shadow-[0_18px_34px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <PreviewVoteChip
                icon={ThumbsUp}
                label="Woot"
                value="428"
                accentClassName="bg-[rgba(55,210,124,0.12)] text-[#93ffc0]"
              />
              <PreviewVoteChip
                icon={Heart}
                label="Grab"
                value="96"
                accentClassName="bg-[rgba(255,181,71,0.12)] text-[#ffd488]"
              />
              <PreviewVoteChip
                icon={ThumbsDown}
                label="Meh"
                value="14"
                accentClassName="bg-[rgba(255,97,88,0.12)] text-[#ffb0aa]"
              />
            </div>
          </div>
        </section>

        <aside className="flex min-h-[20rem] flex-col bg-[#06090e]">
          <div className="shrink-0 border-b border-[rgba(255,255,255,0.06)] bg-[#090d14] p-2.5">
            <div className="grid grid-cols-3 gap-1 rounded-[0.85rem] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-1">
              <PreviewSidebarTab label="Chat" active />
              <PreviewSidebarTab label="Pessoas" />
              <PreviewSidebarTab label="Fila" />
            </div>
          </div>

          <div className="flex-1 space-y-3 px-3 py-4">
            <PreviewMessageGroup
              username="Lua"
              timestamp="21:14"
              highlight
              messages={[
                ['Segura esse drop ', '@Sora'],
                ['A sala acordou toda.'],
              ]}
            />
            <PreviewMessageGroup
              username="Nox"
              timestamp="21:15"
              messages={[
                ['Fila aberta?'],
                ['Vou subir com um remix daqui a pouco.'],
              ]}
            />
            <PreviewMessageGroup
              username="Bia"
              timestamp="21:16"
              messages={[['Track salva no grab.']]}
            />
          </div>

          <div className="shrink-0 border-t border-[rgba(255,255,255,0.06)] bg-[#090d14] px-4 py-3.5">
            <div className="rounded-[1rem] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Perfil ativo
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Sora Waves
                  </p>
                  <p className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Nível 18 · Host
                  </p>
                </div>
                <span className="rounded-full border border-[rgba(24,226,153,0.15)] bg-[rgba(24,226,153,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent-hover)]">
                  online
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.06)] bg-[#080c13] px-5 py-3.5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3 rounded-[1.1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] text-[var(--text-muted)]">
              <ListMusic className="h-4 w-4" />
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Playlist ativa
              </p>
              <p className="truncate text-[13px] font-semibold text-white">
                Peak Session Curated
              </p>
            </div>
          </div>

          <div className="min-w-0 bg-[rgba(255,255,255,0.02)] p-2 px-3 rounded-[1.1rem] border border-[rgba(255,255,255,0.06)]">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Próxima faixa
                </p>
                <p className="truncate text-[13px] font-semibold text-white">
                  Afterlight
                </p>
              </div>
              <div className="border-l border-[rgba(255,255,255,0.1)] pl-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Dock Info
                </p>
                <p className="truncate text-[11px] font-medium text-[var(--text-secondary)]">
                  Dock persistente no rodapé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StoryPoint({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(24,226,153,0.3)] hover:text-white">
      <CheckCircle2 className="h-4 w-4 text-[var(--accent-hover)]" />
      {text}
    </span>
  )
}

function IdentityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-[14px] font-semibold text-white">{value}</p>
    </div>
  )
}

function VoteSignalCard({
  icon: Icon,
  label,
  value,
  tone,
  textColor,
}: {
  icon: typeof ThumbsUp
  label: string
  value: string
  tone: string
  textColor: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3.5">
      <div
        className="inline-flex h-8 w-8 items-center justify-center rounded-[0.8rem]"
        style={{ backgroundColor: tone, color: textColor }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[17px] font-bold text-white">{value}</p>
    </div>
  )
}

function ModerationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[var(--text-secondary)]">
        {value}
      </p>
    </div>
  )
}

function PreviewAudiencePill({
  name,
  left,
  bottom,
  active = false,
}: {
  name: string
  left: string
  bottom: string
  active?: boolean
}) {
  return (
    <div className="absolute z-20 -translate-x-1/2" style={{ left, bottom }}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-[0_10px_18px_rgba(0,0,0,0.4)] backdrop-blur-sm ${
          active
            ? 'border-[rgba(24,226,153,0.15)] bg-[rgba(24,226,153,0.08)] text-[var(--text-primary)]'
            : 'border-[rgba(255,255,255,0.08)] bg-[rgba(7,11,17,0.7)] text-[var(--text-secondary)]'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? 'bg-[var(--accent-hover)] shadow-[0_0_6px_rgba(24,226,153,0.8)]'
              : 'bg-[rgba(255,255,255,0.3)]'
          }`}
        />
        {name}
      </span>
    </div>
  )
}

function PreviewVoteChip({
  icon: Icon,
  label,
  value,
  accentClassName,
}: {
  icon: typeof ThumbsUp
  label: string
  value: string
  accentClassName: string
}) {
  return (
    <div className="min-w-[72px] rounded-[1rem] bg-[rgba(255,255,255,0.03)] px-3 py-2">
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-[0.8rem] ${accentClassName}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-bold text-white">{value}</p>
    </div>
  )
}

function PreviewSidebarTab({
  label,
  active = false,
}: {
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`flex h-7 items-center justify-center rounded-[0.6rem] text-[11px] font-semibold transition-colors ${
        active
          ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-sm'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
      }`}
    >
      {label}
    </div>
  )
}

function PreviewMessageGroup({
  username,
  timestamp,
  messages,
  highlight = false,
}: {
  username: string
  timestamp: string
  messages: string[][]
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-[1.1rem] px-2.5 py-2.5 ${
        highlight
          ? 'border border-[rgba(255,176,82,0.1)] bg-[rgba(255,176,82,0.04)] shadow-[0_10px_20px_rgba(255,176,82,0.02)]'
          : 'border border-transparent'
      }`}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[10px] font-semibold text-[var(--text-secondary)]">
        {username.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-white">
            {username}
          </span>
          <span className="text-[10px] font-medium text-[var(--text-muted)]">
            {timestamp}
          </span>
        </div>

        <div className="mt-1.5 space-y-1">
          {messages.map((parts, index) => (
            <p
              key={`${username}-${timestamp}-${index}`}
              className="text-[12px] leading-[1.6] text-[var(--text-secondary)]"
            >
              {parts.map((part, partIndex) =>
                part.startsWith('@') ? (
                  <span
                    key={`${username}-${timestamp}-${index}-${partIndex}`}
                    className="mx-[1px] inline-flex items-center rounded-full border border-[rgba(255,176,82,0.15)] bg-[rgba(255,176,82,0.1)] px-1.5 py-[1px] font-semibold text-[#ffd289]"
                  >
                    {part}
                  </span>
                ) : (
                  <span key={`${username}-${timestamp}-${index}-${partIndex}`}>
                    {part}
                  </span>
                ),
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
