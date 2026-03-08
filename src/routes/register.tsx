import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Disc3 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { register, isLoading, error, setError } = useAuthStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    await register(username, email, password)
    const token = useAuthStore.getState().token
    if (token) navigate({ to: '/rooms' })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg-primary)] px-4 py-8 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(24,226,153,0.06), transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            className="group mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(230,255,239,0.82)] bg-[#f1fff5] text-[#082014] shadow-[0_12px_28px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.92)] transition-transform hover:scale-105"
          >
            <Disc3 className="h-6 w-6 transition-transform group-hover:rotate-12" />
          </Link>

          <h1 className="font-display text-[26px] font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
            Start your journey with NiceDJ
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-[var(--border-light)] bg-[rgba(16,21,29,0.5)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Your DJ name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-[0.8rem] border border-[rgba(255,107,99,0.26)] bg-[rgba(79,23,26,0.3)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--danger)]"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Sign up
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 border-t border-[var(--border-light)] pt-6">
            <p className="text-[14px] text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-white transition-colors hover:text-[var(--accent-hover)]"
              >
                Log in
              </Link>
            </p>

            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
