import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Code2,
  Disc3,
  MessageSquareText,
  Radio,
  Shield,
  Sparkles,
  Store,
  Users2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const platformDetails: Array<{
  title: string;
  description: string;
  icon: typeof Disc3;
}> = [
  {
    title: "Booth sincronizado em tempo real",
    description:
      "Player, fila de DJs e votos com estado autoritativo do servidor para reduzir drift e inconsistência entre clientes.",
    icon: Radio,
  },
  {
    title: "Camada social orientada a comunidade",
    description:
      "Chat, presença, reputação, badges e relacionamento entre membros para fortalecer cultura dentro das salas.",
    icon: Users2,
  },
  {
    title: "Governança e segurança",
    description:
      "Permissões por cargo, ações de moderação e trilha de auditoria para ambientes com tráfego intenso.",
    icon: Shield,
  },
  {
    title: "Extensível por SDK oficial",
    description:
      "Contratos versionados e eventos estáveis para plugins, overlays e automações de comunidade.",
    icon: Code2,
  },
  {
    title: "Economia de perfis e cosméticos",
    description:
      "Inventário e loja com itens visuais para incentivar identidade e recorrência no uso da plataforma.",
    icon: Store,
  },
  {
    title: "Operação orientada a produto",
    description:
      "Métricas, conteúdo e roadmap conectados para evoluir UX e estabilidade de forma contínua.",
    icon: Sparkles,
  },
];

const blogPosts = [
  {
    title: "Arquitetura de sincronização para salas com grande volume",
    category: "Engenharia",
    date: "Mar 2026",
    excerpt: "Como estruturamos snapshots, heartbeat e correção de tempo para manter a experiência uniforme.",
  },
  {
    title: "Princípios para UX social em plataformas de música",
    category: "Produto",
    date: "Fev 2026",
    excerpt: "Boas práticas para combinar interação espontânea com moderação eficiente e navegação limpa.",
  },
  {
    title: "Progressão, badges e economia sem ruído visual",
    category: "Design",
    date: "Jan 2026",
    excerpt: "Estratégias para tornar recompensa e identidade parte natural da experiência de sala.",
  },
];

const teamMembers = [
  {
    name: "Aline Moura",
    role: "Product Lead",
    summary: "Define visão de comunidade, retenção e evolução da plataforma junto aos criadores.",
  },
  {
    name: "Rafael Costa",
    role: "Realtime Engineer",
    summary: "Trabalha na camada de eventos, resiliência WS e consistência de playback no front e back.",
  },
  {
    name: "Bianca Freitas",
    role: "Design Systems",
    summary: "Estrutura a linguagem visual e garante coesão entre interface, interação e marca.",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="landing-aurora" />
      <div className="landing-stars" />

      <header className="sticky top-0 z-40 border-b border-[var(--border-light)] bg-[rgba(6,10,16,0.66)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(145deg,var(--accent),var(--accent-hover))] text-[#04110a] shadow-[0_12px_30px_var(--accent-glow)]">
              <Disc3 className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">NiceDJ</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[var(--text-secondary)]">
            <a href="#platform" className="hover:text-[var(--text-primary)] transition-colors">
              Plataforma
            </a>
            <a href="#blog" className="hover:text-[var(--text-primary)] transition-colors">
              Blog
            </a>
            <a href="#team" className="hover:text-[var(--text-primary)] transition-colors">
              Time
            </a>
            <Link to="/rooms" className="hover:text-[var(--text-primary)] transition-colors">
              Salas
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate({ to: "/login" })} className="pill-button pill-button--ghost hidden sm:inline-flex px-4">
              Contact sales
            </button>
            <button type="button" onClick={() => navigate({ to: "/register" })} className="pill-button inline-flex px-4">
              Start for free
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-7xl px-5 pb-10 pt-14 md:px-8 md:pt-20 lg:px-10 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center"
          >
            <span className="pill inline-flex items-center gap-2 border-[rgba(30,215,96,0.35)] bg-[rgba(11,28,21,0.78)] text-[var(--accent-hover)]">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma social para música ao vivo
            </span>

            <h1 className="section-title mx-auto mt-6 max-w-5xl text-4xl font-extrabold leading-[1.03] tracking-tight md:text-6xl lg:text-7xl">
              O cockpit profissional para
              <span className="text-gradient"> comunidades que ouvem juntas</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              NiceDJ combina experiência de sala ao vivo, governança e extensibilidade para criar um produto robusto
              para creators, times e comunidades musicais.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-xl items-center rounded-full border border-[var(--border-light)] bg-[rgba(15,22,32,0.82)] p-1.5">
              <input
                type="email"
                placeholder="Digite seu e-mail para acesso antecipado"
                className="h-10 flex-1 bg-transparent px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
              <button type="button" onClick={() => navigate({ to: "/register" })} className="pill-button px-5">
                Começar
              </button>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.11em] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
                Realtime-ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
                SDK oficial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
                Moderação avançada
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="landing-panel landing-float mx-auto mt-12 max-w-6xl overflow-hidden rounded-[2rem] p-4"
          >
            <div className="grid overflow-hidden rounded-[1.4rem] border border-[var(--border-light)] bg-[rgba(6,10,16,0.94)] lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-[var(--border-light)] px-4 py-4 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Salas</p>
                <div className="mt-3 space-y-2">
                  <MiniRow name="House Nation" active />
                  <MiniRow name="Lo-Fi Sessions" />
                  <MiniRow name="Funk Brasil" />
                  <MiniRow name="Future Beats" />
                </div>
              </aside>

              <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-light)] pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Live room</p>
                    <h3 className="section-title mt-1 text-xl font-bold">House Nation / Peak Session</h3>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(30,215,96,0.35)] bg-[rgba(30,215,96,0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--accent-hover)]">
                    <Radio className="h-3.5 w-3.5" />
                    Ao vivo
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-[var(--border-light)] bg-[rgba(12,18,28,0.84)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Player</p>
                    <div className="mt-2 h-36 rounded-xl border border-[var(--border-light)] bg-[radial-gradient(circle_at_26%_14%,rgba(30,215,96,0.24),transparent_58%),radial-gradient(circle_at_80%_0%,rgba(10,132,255,0.2),transparent_42%),linear-gradient(160deg,rgba(7,10,15,1),rgba(4,7,12,1))]" />
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>DJ: Sora Waves</span>
                      <span>Woot: 428</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-light)] bg-[rgba(12,18,28,0.84)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Chat Highlights</p>
                    <div className="mt-2 space-y-2">
                      <ChatLine text="Drop insano" />
                      <ChatLine text="Fila aberta?" />
                      <ChatLine text="Track da vez salva" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="platform" className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Detalhes da plataforma"
            title="Base de produto para operar salas, comunidade e conteúdo"
            subtitle="Stack focado em clareza de experiência e evolução sustentável de funcionalidades."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platformDetails.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.24, delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className="landing-panel rounded-3xl p-5"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(30,215,96,0.14)] text-[var(--accent-hover)]">
                  <item.icon className="h-4 w-4" />
                </div>
                <h3 className="section-title mt-4 text-lg font-bold leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="blog" className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Blog"
            title="Atualizações de engenharia, produto e comunidade"
            subtitle="Conteúdo editorial da evolução do NiceDJ, decisões técnicas e aprendizados do roadmap."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.22, delay: index * 0.05 }}
                className="landing-panel rounded-3xl p-5"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[var(--accent-alt)]" />
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                </div>

                <h3 className="section-title mt-4 text-lg font-bold leading-snug">{post.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>

                <button type="button" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-hover)] hover:text-white transition-colors">
                  Ler conteúdo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="team" className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Time"
            title="Equipe dedicada a produto musical em tempo real"
            subtitle="Estratégia, experiência e engenharia atuando em conjunto para manter qualidade de ponta a ponta."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.23, delay: index * 0.05 }}
                className="landing-panel rounded-3xl p-5"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[rgba(12,18,28,0.9)] text-[var(--accent-hover)]">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <h3 className="section-title text-lg font-bold">{member.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{member.summary}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 md:px-8 lg:px-10">
          <div className="landing-panel overflow-hidden rounded-[2rem] p-7 md:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)]">Próximo passo</p>
                <h2 className="section-title mt-3 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
                  Leve sua comunidade musical para um patamar profissional
                </h2>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-[var(--text-secondary)]">
                  Inicie com salas públicas, evolua com governança e entregue uma experiência original para seus membros.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button type="button" onClick={() => navigate({ to: "/rooms" })} className="pill-button px-5">
                  Ver salas
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
                <button type="button" onClick={() => navigate({ to: "/register" })} className="pill-button pill-button--ghost px-5">
                  Criar conta
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-light)] bg-[rgba(6,10,16,0.76)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
          <p>© 2026 NiceDJ. Social music platform.</p>
          <div className="flex items-center gap-4">
            <a href="#blog" className="hover:text-[var(--text-primary)] transition-colors">
              Blog
            </a>
            <a href="#team" className="hover:text-[var(--text-primary)] transition-colors">
              Time
            </a>
            <Link to="/rooms" className="hover:text-[var(--text-primary)] transition-colors">
              Salas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)]">{eyebrow}</p>
      <h2 className="section-title mt-2 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm md:text-base text-[var(--text-secondary)]">{subtitle}</p>
    </div>
  );
}

function MiniRow({
  name,
  active = false,
}: {
  name: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm font-medium ${
        active
          ? "border-[rgba(30,215,96,0.35)] bg-[rgba(30,215,96,0.12)] text-[var(--accent-hover)]"
          : "border-[var(--border-light)] bg-[rgba(13,19,28,0.84)] text-[var(--text-secondary)]"
      }`}
    >
      {name}
    </div>
  );
}

function ChatLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-[rgba(10,15,23,0.9)] px-3 py-2 text-xs text-[var(--text-secondary)]">
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-hover)]" />
      <span>{text}</span>
    </div>
  );
}
