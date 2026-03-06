import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "woot" | "meh" | "grab";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#04110a] border border-[rgba(208,255,223,0.35)] shadow-[0_10px_30px_var(--accent-glow)]",
  secondary:
    "bg-[rgba(30,39,55,0.75)] hover:bg-[rgba(45,56,76,0.9)] text-[var(--text-primary)] border border-[var(--border-light)]",
  ghost:
    "bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent",
  danger:
    "bg-[var(--danger)] hover:brightness-95 text-white border border-[rgba(255,210,208,0.28)] shadow-[0_8px_22px_var(--danger-glow)]",
  woot:
    "bg-[rgba(55,210,124,0.14)] hover:bg-[rgba(55,210,124,0.25)] text-[var(--success)] border border-[rgba(55,210,124,0.32)]",
  meh:
    "bg-[rgba(255,97,88,0.12)] hover:bg-[rgba(255,97,88,0.2)] text-[var(--danger)] border border-[rgba(255,97,88,0.28)]",
  grab:
    "bg-[rgba(255,181,71,0.13)] hover:bg-[rgba(255,181,71,0.24)] text-[var(--warning)] border border-[rgba(255,181,71,0.3)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "font-semibold tracking-[0.01em] transition-all duration-200",
        "disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
