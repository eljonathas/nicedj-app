import { motion } from 'framer-motion'
import { Code2, Radio, Shield, Sparkles, Store, Users2 } from 'lucide-react'
import { SectionHeading } from './Shared'

const platformDetails = [
  {
    title: 'Ouça junto, sem desencontro',
    description:
      'O player, a fila e os votos acompanham o mesmo momento da música para todo mundo na sala.',
    icon: Radio,
  },
  {
    title: 'Conversa que combina com a música',
    description:
      'Chat, presença e reações ajudam a criar clima sem tirar o foco do que está tocando.',
    icon: Users2,
  },
  {
    title: 'Cuidado com a comunidade',
    description:
      'Cargos, moderação e histórico de ações deixam a sala acolhedora e bem organizada.',
    icon: Shield,
  },
  {
    title: 'Pronta para crescer com você',
    description:
      'A plataforma abre espaço para integrações, overlays e novas ideias sem perder consistência.',
    icon: Code2,
  },
  {
    title: 'Perfis com personalidade',
    description:
      'Avatares, itens visuais e evolução dão identidade para quem participa todos os dias.',
    icon: Store,
  },
  {
    title: 'Feita para evoluir',
    description:
      'Conteúdo, sinais de uso e melhorias contínuas ajudam a plataforma a acompanhar a comunidade.',
    icon: Sparkles,
  },
]

export function PlatformDetails() {
  return (
    <section
      id="platform"
      className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 lg:px-10"
    >
      <SectionHeading
        eyebrow="Detalhes da plataforma"
        title="O que faz o NiceDJ funcionar tão bem no dia a dia"
        subtitle="Um conjunto de recursos pensado para fazer a sala parecer viva, organizada e fácil de usar do começo ao fim."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {platformDetails.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group rounded-[1.4rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[0.85rem] border border-[rgba(24,226,153,0.15)] bg-[rgba(24,226,153,0.06)] text-[var(--accent-hover)] transition-colors group-hover:bg-[rgba(24,226,153,0.1)]">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-[17px] font-bold leading-snug text-white">
              {item.title}
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {item.description}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
