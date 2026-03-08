import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-2.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-[0.01em] text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-2xl border px-4 py-2 text-sm font-medium',
            'bg-[var(--field-bg)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm',
            'placeholder:text-[var(--text-muted)]',
            'border-[var(--field-border)]',
            'transition-all duration-200',
            'hover:border-[rgba(255,255,255,0.16)] hover:bg-[var(--field-hover)]',
            'focus:border-[var(--field-border-focus)] focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-4 focus:ring-[var(--field-ring)]',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[rgba(255,107,99,0.14)]'
              : '',
            className,
          ].join(' ')}
          {...props}
        />

        {error && (
          <p className="text-xs font-medium text-[var(--danger)]">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
