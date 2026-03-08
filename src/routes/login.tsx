import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Disc3, Music2, Radio, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, isLoading, error, setError } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    await login(email, password)
    const token = useAuthStore.getState().token
    if (token) navigate({ to: '/rooms' })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="landing-grid" />
      <div className="landing-aurora" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 md:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden lg:block"
          >
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(230,255,239,0.82)] bg-[#f1fff5] text-[#082014] shadow-[0_12px_28px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <Disc3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-bold tracking-tight">
                  NiceDJ
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Produto social para musica ao vivo
                </p>
              </div>
            </Link>

            <div className="surface-card mt-6 rounded-[2rem] p-8">
              <span className="pill inline-flex items-center gap-2 border-[rgba(24,226,153,0.22)] bg-[rgba(24,226,153,0.08)] text-[var(--text-primary)]">
                <Radio className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
                Login com linguagem mais clara
              </span>

              <h1 className="section-title mt-6 text-4xl font-extrabold leading-tight">
                Volte para a cabine com a mesma
                <span className="text-gradient">
                  {' '}
                  clareza de uma ferramenta de produto
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
                NiceDJ reune salas, fila de DJs, chat e governanca em uma
                interface mais limpa, com contraste alto, superficies suaves e
                fluxos diretos para entrar e continuar a sessao.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <FeatureCard
                  icon={Music2}
                  title="Playback sem drift"
                  text="Estado autoritativo e feedback realtime para cada sala."
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Moderacao nativa"
                  text="Cargos, permissoes e sinais operacionais em um unico lugar."
                />
              </div>

              <div className="mt-8 rounded-[1.6rem] border border-[var(--border-light)] bg-[rgba(255,255,255,0.04)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-[0.04em] text-[var(--text-muted)]">
                      Sessao ativa
                    </p>
                    <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                      House Nation / Peak Session
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(24,226,153,0.2)] bg-[rgba(24,226,153,0.1)] px-3 py-1 text-xs font-medium text-[var(--text-primary)]">
                    32 ms
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Fila" value="16 DJs" />
                  <MetricCard label="Mensagens" value="+128" />
                  <MetricCard label="Votos" value="428" />
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="auth-panel rounded-[2rem] p-6 md:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Inicio
              </Link>
              <span className="pill border-[rgba(24,226,153,0.22)] bg-[rgba(24,226,153,0.08)] text-[var(--text-primary)]">
                Acesso
              </span>
            </div>

            <div className="mb-8 mt-8 text-center lg:text-left">
              <p className="text-xs font-medium tracking-[0.04em] text-[var(--text-muted)]">
                Entrar
              </p>
              <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight">
                Entrar no NiceDJ
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Use sua conta para participar das salas, retomar playlists e
                continuar votando nas tracks.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              {error && (
                <p className="rounded-[1rem] border border-[rgba(255,107,99,0.26)] bg-[rgba(79,23,26,0.48)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Fazer login
              </Button>
            </form>

            <div className="mt-6 rounded-[1.25rem] border border-[var(--border-light)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Autenticacao desenhada para reduzir atrito sem perder clareza
              visual entre estado, foco e erro.
            </div>

            <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
              Não tem conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-[var(--accent-hover)] hover:text-white transition-colors"
              >
                Criar agora
              </Link>
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Music2
  title: string
  text: string
}) {
  return (
    <div className="rounded-[1.3rem] border border-[var(--border-light)] bg-[rgba(255,255,255,0.04)] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(24,226,153,0.12)] text-[var(--accent-hover)]">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
        {text}
      </p>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-[var(--border-light)] bg-[rgba(255,255,255,0.04)] px-3 py-3">
      <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  )
}
