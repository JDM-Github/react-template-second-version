import * as React from "react"

type AlertVariant = "default" | "destructive"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const variantStyles: Record<AlertVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-surface, #1A1D27)",
    border: "1px solid var(--color-border, #2A2D3E)",
    color: "var(--color-text, #E8EDF5)",
  },
  destructive: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444",
  },
}

// ── Alert ────────────────────────────────────────────────────────────────────

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "default", style, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      data-slot="alert"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "0 0.75rem",
        alignItems: "start",
        padding: "0.875rem 1rem",
        borderRadius: "0.75rem",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
        fontSize: "0.875rem",
        lineHeight: 1.5,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
Alert.displayName = "Alert"

// ── AlertTitle ───────────────────────────────────────────────────────────────

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ style, children, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="alert-title"
      style={{
        fontWeight: 700,
        fontSize: "0.875rem",
        margin: "0 0 0.2rem",
        lineHeight: 1.3,
        gridColumn: "2",
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  )
)
AlertTitle.displayName = "AlertTitle"

// ── AlertDescription ─────────────────────────────────────────────────────────

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ style, children, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="alert-description"
      style={{
        fontSize: "0.8rem",
        opacity: 0.8,
        margin: 0,
        lineHeight: 1.6,
        gridColumn: "2",
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  )
)
AlertDescription.displayName = "AlertDescription"

// ── Icon slot (auto-positions into col 1, rows 1-2) ──────────────────────────

// The icon passed as a child of Alert is expected to be the first child.
// We wrap it in a small div that spans both rows so title + description sit beside it.
// Usage: <Alert><IconComponent /><AlertTitle>…</AlertTitle><AlertDescription>…</AlertDescription></Alert>
// The icon component itself should be ~16px (h-4 w-4).

export { Alert, AlertTitle, AlertDescription }
export type { AlertProps, AlertVariant }