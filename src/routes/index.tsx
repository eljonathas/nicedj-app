import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BackgroundEffects } from '../components/landing/BackgroundEffects'
import { Header } from '../components/landing/Header'
import { Hero } from '../components/landing/Hero'
import { FeatureShowcase } from '../components/landing/FeatureShowcase'
import { PlatformDetails } from '../components/landing/PlatformDetails'
import { BlogSection } from '../components/landing/BlogSection'
import { CallToAction } from '../components/landing/CallToAction'
import { Footer } from '../components/landing/Footer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-[#05080d] text-white selection:bg-[rgba(24,226,153,0.3)] selection:text-white overflow-x-hidden font-sans">
      <BackgroundEffects />
      <Header />

      <main className="relative z-10 flex flex-col gap-0 md:gap-8">
        <Hero
          onPrimary={() => navigate({ to: '/register' })}
          onSecondary={() => navigate({ to: '/rooms' })}
        />
        <FeatureShowcase />
        <PlatformDetails />
        <BlogSection />
        <CallToAction />
      </main>

      <Footer />
    </div>
  )
}
