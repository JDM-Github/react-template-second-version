/**
 * src/components/ui/card.tsx
 *
 * Theme integration
 * ─────────────────
 * All colours are driven by CSS custom properties so the card automatically
 * respects dark / light mode when ThemeProvider adds `.dark` or `.light` to
 * <html>.  Add the block below to your global CSS (e.g. index.css):
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  :root, .dark {                                     │
 * │    --color-text:         #E8EDF5;                   │
 * │    --color-text-muted:   #8892A4;                   │
 * │    --color-text-faint:   #4A5168;                   │
 * │    --color-bg:           #0F1117;                   │
 * │    --color-surface:      #1A1D27;                   │
 * │    --color-surface-2:    #202432;                   │
 * │    --color-border:       #2A2D3E;                   │
 * │    --color-accent:       #4F6EF7;                   │
 * │  }                                                  │
 * │                                                     │
 * │  .light {                                           │
 * │    --color-text:         #0F1117;                   │
 * │    --color-text-muted:   #4A5168;                   │
 * │    --color-text-faint:   #8892A4;                   │
 * │    --color-bg:           #F4F6FB;                   │
 * │    --color-surface:      #FFFFFF;                   │
 * │    --color-surface-2:    #F0F2F8;                   │
 * │    --color-border:       #DDE1EE;                   │
 * │    --color-accent:       #4F6EF7;                   │
 * │  }                                                  │
 * └─────────────────────────────────────────────────────┘
 *
 * The `elevated` variant adjusts its shadow automatically:
 *   dark  → deep black shadow
 *   light → soft blue-grey shadow
 * via the --card-shadow variable set per theme in the CSS block above.
 */

import * as React from "react"

// ─── types ──────────────────────────────────────────────────────────────────

type CardVariant = "default" | "ghost" | "outlined" | "elevated"
type CardSize = "sm" | "md" | "lg"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  /** Adds a subtle accent glow on the left border */
  accent?: string
  /** Disables all padding (useful when you control inner layout fully) */
  noPadding?: boolean
  asChild?: boolean
}

// ─── style helpers ───────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-surface, #1A1D27)",
    border: "1px solid var(--color-border, #2A2D3E)",
  },
  ghost: {
    background: "transparent",
    border: "1px solid transparent",
  },
  outlined: {
    background: "transparent",
    border: "1px solid var(--color-border, #2A2D3E)",
  },
  elevated: {
    background: "var(--color-surface, #1A1D27)",
    border: "1px solid var(--color-border, #2A2D3E)",
    // Shadow adapts per theme via --card-elevated-shadow (set in global CSS)
    boxShadow: "var(--card-elevated-shadow, 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2))",
  },
}

const sizeStyles: Record<CardSize, React.CSSProperties> = {
  sm: { padding: "0.875rem", borderRadius: "0.625rem" },
  md: { padding: "1.25rem", borderRadius: "0.875rem" },
  lg: { padding: "1.75rem", borderRadius: "1.125rem" },
}

// ─── Card ────────────────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      size = "md",
      accent,
      noPadding = false,
      style,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { padding, borderRadius } = sizeStyles[size]

    const accentStyle: React.CSSProperties = accent
      ? {
        borderLeft: `2px solid ${accent}`,
        boxShadow: `inset 3px 0 24px ${accent}12`,
      }
      : {}

    return (
      <div
        ref={ref}
        data-slot="card"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          color: "var(--color-text, #E8EDF5)",
          transition: "border-color 0.2s, box-shadow 0.2s",
          overflow: "hidden",
          ...variantStyles[variant],
          ...accentStyle,
          borderRadius,
          padding: noPadding ? 0 : padding,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

// ─── CardHeader ──────────────────────────────────────────────────────────────

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stacks title + description vertically; default is row with space-between */
  stacked?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ stacked = false, style, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: "0.5rem",
        marginBottom: "0.875rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
CardHeader.displayName = "CardHeader"

// ─── CardTitle ───────────────────────────────────────────────────────────────

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = "h3", style, children, ...props }, ref) => (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      data-slot="card-title"
      style={{
        fontSize: "1rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        color: "var(--color-text, #E8EDF5)",
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  )
)
CardTitle.displayName = "CardTitle"

// ─── CardDescription ─────────────────────────────────────────────────────────

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ style, children, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    style={{
      fontSize: "0.8rem",
      lineHeight: 1.6,
      color: "var(--color-text-muted, #8892A4)",
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = "CardDescription"

// ─── CardAction ──────────────────────────────────────────────────────────────
// Intentionally flex-shrink: 0 so it never wraps in the header row

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
      flexShrink: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
))
CardAction.displayName = "CardAction"

// ─── CardContent ─────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    style={{
      flex: 1,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
))
CardContent.displayName = "CardContent"

// ─── CardFooter ──────────────────────────────────────────────────────────────

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds a top divider line */
  divided?: boolean
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ divided = false, style, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "0.5rem",
        marginTop: "1rem",
        paddingTop: divided ? "0.875rem" : 0,
        borderTop: divided
          ? "1px solid var(--color-border, #2A2D3E)"
          : "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
CardFooter.displayName = "CardFooter"

// ─── exports ─────────────────────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

export type { CardProps, CardVariant, CardSize, CardHeaderProps, CardFooterProps }