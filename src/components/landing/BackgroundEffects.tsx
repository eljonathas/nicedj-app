export function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#05080d]" />

      {/* Mintlify-like Subtle grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          maskImage: 'linear-gradient(to bottom, white, transparent)',
        }}
      />

      {/* Top light beam */}
      <div
        className="fixed top-0 inset-x-0 h-[500px] z-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background:
            'radial-gradient(100% 100% at 50% 0%, rgba(24, 226, 153, 0.15) 0%, rgba(124, 184, 255, 0.05) 50%, transparent 100%)',
        }}
      />
      <div className="landing-grid" />
      <div className="landing-aurora" />
    </>
  )
}
