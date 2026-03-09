type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
  ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onCheckedChange(!checked)
        }
      }}
      className={[
        'inline-flex h-8 w-14 shrink-0 items-center rounded-full border px-1 transition-colors',
        checked
          ? 'border-[rgba(55,210,124,0.26)] bg-[rgba(11,29,19,0.82)]'
          : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]',
        disabled ? 'cursor-not-allowed opacity-50' : '',
        className,
      ].join(' ')}
    >
      <span
        className={`h-6 w-6 rounded-full bg-white shadow-[0_10px_20px_rgba(0,0,0,0.22)] transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
