import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'woot'
  | 'meh'
  | 'grab'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-[rgba(230,255,239,0.82)] bg-[#f1fff5] text-[#082014] shadow-[0_12px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-[rgba(237,255,244,0.95)] hover:bg-[#e6fff0]',
  secondary:
    'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.09)]',
  ghost:
    'border-transparent bg-transparent text-[var(--text-secondary)] shadow-none hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]',
  danger:
    'border-[rgba(255,107,99,0.22)] bg-[rgba(255,107,99,0.12)] text-[#ffd6d3] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-[rgba(255,107,99,0.18)]',
  woot: 'border-[rgba(70,218,141,0.22)] bg-[rgba(70,218,141,0.12)] text-[#aff4cb] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-[rgba(70,218,141,0.18)]',
  meh: 'border-[rgba(255,107,99,0.2)] bg-[rgba(255,107,99,0.08)] text-[#ffb9b4] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-[rgba(255,107,99,0.14)]',
  grab: 'border-[rgba(255,191,105,0.2)] bg-[rgba(255,191,105,0.12)] text-[#ffdba5] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-[rgba(255,191,105,0.18)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-10 px-[18px] text-sm',
  lg: 'h-12 px-[22px] text-[15px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      className={[
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border',
        'font-medium tracking-[-0.01em] backdrop-blur-xl transition-[transform,background-color,border-color,color,box-shadow,filter] duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--field-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
