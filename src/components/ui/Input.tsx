import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = "", id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2.5">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        className={[
          "w-full rounded-xl border px-4 py-3 text-sm font-medium",
          "bg-[rgba(23,30,42,0.8)] text-[var(--text-primary)]",
          "placeholder:text-[var(--text-muted)]",
          "border-[var(--border)]",
          "transition-all duration-200",
          "focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(30,215,96,0.25)]",
          error ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[rgba(255,97,88,0.25)]" : "",
          className,
        ].join(" ")}
        {...props}
      />

      {error && <p className="text-xs font-medium text-[var(--danger)]">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
