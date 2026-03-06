import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Disc3, Music2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    await login(email, password);
    const token = useAuthStore.getState().token;
    if (token) navigate({ to: "/rooms" });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 md:px-8">
      <div className="grid w-full gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden lg:flex surface-card rounded-[2rem] p-10 flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 rounded-2xl bg-[var(--accent)] text-[#031208] flex items-center justify-center shadow-[0_15px_34px_var(--accent-glow)]">
              <Disc3 className="h-7 w-7" />
            </div>
            <h1 className="section-title mt-6 text-4xl font-extrabold leading-tight">
              Volte para a cabine e
              <span className="text-gradient"> mantenha a pista viva</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Salas, filas de DJ, chat em tempo real e progresso social em uma experiência moderna para comunidades musicais.
            </p>
          </div>

          <div className="space-y-3">
            <FeatureRow icon={Music2} text="Sincronização de playback em tempo real" />
            <FeatureRow icon={ShieldCheck} text="Ambiente moderado com cargos e permissões" />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.97, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel-heavy rounded-[2rem] p-6 md:p-8"
        >
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Acesso</p>
            <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight">Entrar no NiceDJ</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Use sua conta para participar das salas e votar nas tracks.</p>
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

            {error && <p className="rounded-xl border border-[rgba(255,97,88,0.34)] bg-[rgba(62,17,19,0.52)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Fazer login
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
            Não tem conta?{" "}
            <Link to="/register" className="font-semibold text-[var(--accent-hover)] hover:text-white transition-colors">
              Criar agora
            </Link>
          </p>
        </motion.section>
      </div>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  text,
}: {
  icon: typeof Music2;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-light)] bg-[rgba(15,21,31,0.8)] px-4 py-3">
      <div className="h-9 w-9 rounded-xl bg-[rgba(30,215,96,0.16)] flex items-center justify-center text-[var(--accent-hover)]">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}
