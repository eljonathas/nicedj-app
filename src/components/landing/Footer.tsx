export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#05080d]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-[13px] font-medium text-[var(--text-muted)] md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
        <p>© 2026 NiceDJ. Plataforma social para ouvir música junto.</p>
        <div className="flex items-center gap-6">
          <a href="#experience" className="transition-colors hover:text-white">
            Experiência
          </a>
          <a href="#platform" className="transition-colors hover:text-white">
            Plataforma
          </a>
          <a href="#blog" className="transition-colors hover:text-white">
            Blog
          </a>
        </div>
      </div>
    </footer>
  )
}
