export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-hover)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-4xl text-[2rem] font-bold tracking-tight text-white md:text-[2.75rem]">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-[16px] leading-[1.6] text-[var(--text-secondary)] md:text-[18px]">
        {subtitle}
      </p>
    </div>
  )
}
