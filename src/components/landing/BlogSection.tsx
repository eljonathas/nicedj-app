import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, CalendarDays } from 'lucide-react'
import { SectionHeading } from './Shared'

const blogPosts = [
  {
    title: 'Como manter a sala fluindo para todo mundo',
    category: 'Bastidores',
    date: 'Mar 2026',
    excerpt:
      'Um olhar sobre as escolhas que deixam a experiência estável, leve e agradável mesmo com muita gente reunida.',
  },
  {
    title: 'O que faz uma boa conversa em torno da música',
    category: 'Produto',
    date: 'Fev 2026',
    excerpt:
      'Ideias para incentivar participação, cuidado e espontaneidade sem transformar a sala em ruído.',
  },
  {
    title: 'Como deixar avatares, conquistas e identidade mais naturais',
    category: 'Design',
    date: 'Jan 2026',
    excerpt:
      'Formas de fazer avatares, badges e recompensas parecerem parte da experiência, e não só mais uma camada visual.',
  },
]

export function BlogSection() {
  return (
    <section
      id="blog"
      className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 lg:px-10"
    >
      <SectionHeading
        eyebrow="Blog"
        title="Histórias, ideias e bastidores do NiceDJ"
        subtitle="Textos sobre o que estamos aprendendo ao construir uma experiência musical mais social, clara e gostosa de usar."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <motion.article
            key={post.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.26, delay: index * 0.05 }}
            className="group flex flex-col justify-between rounded-[1.4rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {post.date}
                </span>
              </div>

              <h3 className="mt-5 text-[17px] font-bold leading-snug text-white group-hover:text-[var(--accent-hover)] transition-colors">
                {post.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                {post.excerpt}
              </p>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent-hover)] transition-colors hover:text-[#93ffc0]"
            >
              Ler conteúdo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
