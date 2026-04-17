import * as React from "react"

type ToggleVariant = "default" | "outline"

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ToggleVariant
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      variant = "default",
      disabled,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = React.useState(defaultPressed)
    const controlled = pressed !== undefined
    const on = controlled ? pressed : internal
    const [hov, setHov] = React.useState(false)

    const toggle = () => {
      if (disabled) return
      const next = !on
      if (!controlled) setInternal(next)
      onPressedChange?.(next)
    }

    return (
      <button
        ref={ref}
        aria-pressed={on}
        disabled={disabled}
        onClick={toggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        data-slot="toggle"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "0.5rem",
          border: variant === "outline"
            ? `1px solid ${on ? "var(--color-accent, #4F6EF7)" : "var(--color-border, #2A2D3E)"}`
            : "1px solid transparent",
          background: on
            ? "rgba(79,110,247,0.15)"
            : hov
              ? "var(--color-surface-2, #202432)"
              : "transparent",
          color: on
            ? "var(--color-accent, #4F6EF7)"
            : "var(--color-text-muted, #8892A4)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          outline: "none",
          padding: 0,
          transition: "background 0.15s, color 0.15s, border-color 0.15s",
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }
export type { ToggleProps, ToggleVariant }