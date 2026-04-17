import * as React from "react"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-accent, #4F6EF7)",
    color: "#fff",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--color-surface-2, #202432)",
    color: "var(--color-text-muted, #8892A4)",
    border: "1px solid var(--color-border, #2A2D3E)",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text, #E8EDF5)",
    border: "1px solid var(--color-border, #2A2D3E)",
  },
  destructive: {
    background: "rgba(239,68,68,0.12)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.25)",
  },
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", style, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
        fontSize: "0.7rem",
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.03em",
        padding: "0.25rem 0.55rem",
        borderRadius: "9999px",
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
)
Badge.displayName = "Badge"

export { Badge }
export type { BadgeProps, BadgeVariant }