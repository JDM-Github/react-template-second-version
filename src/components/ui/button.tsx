import * as React from "react"

// ─── types ───────────────────────────────────────────────────────────────────

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

// ─── base styles (shared) ────────────────────────────────────────────────────

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: "nowrap",
  border: "1px solid transparent",
  borderRadius: "0.5rem",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s, opacity 0.15s",
  outline: "none",
  textDecoration: "none",
}

// ─── variant map ─────────────────────────────────────────────────────────────

const variants: Record<ButtonVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-accent, #4F6EF7)",
    color: "#fff",
    borderColor: "transparent",
    boxShadow: "0 1px 6px rgba(79,110,247,0.35)",
  },
  secondary: {
    background: "var(--color-surface-2, #202432)",
    color: "var(--color-text, #E8EDF5)",
    borderColor: "var(--color-border, #2A2D3E)",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text, #E8EDF5)",
    borderColor: "var(--color-border, #2A2D3E)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text, #E8EDF5)",
    borderColor: "transparent",
  },
  destructive: {
    background: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    borderColor: "rgba(239,68,68,0.3)",
  },
  link: {
    background: "transparent",
    color: "var(--color-accent, #4F6EF7)",
    borderColor: "transparent",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
}

const sizes: Record<ButtonSize, React.CSSProperties> = {
  default: { height: "2.25rem", padding: "0 0.875rem", fontSize: "0.875rem" },
  sm: { height: "1.875rem", padding: "0 0.625rem", fontSize: "0.8rem", borderRadius: "0.375rem" },
  lg: { height: "2.625rem", padding: "0 1.25rem", fontSize: "1rem" },
  icon: { height: "2.25rem", width: "2.25rem", padding: 0 },
}

// ─── Component ───────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", style, children, disabled, className, ...props }, ref) => {
    const [hovered, setHovered] = React.useState(false)

    const hoverOverlay: React.CSSProperties = hovered && !disabled
      ? { filter: "brightness(1.12)", boxShadow: variant === "default" ? "0 2px 10px rgba(79,110,247,0.45)" : undefined }
      : {}

    return (
      <button
        ref={ref}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...base,
          ...variants[variant],
          ...sizes[size],
          ...(disabled ? { opacity: 0.45, cursor: "not-allowed", pointerEvents: "none" } : {}),
          ...hoverOverlay,
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }