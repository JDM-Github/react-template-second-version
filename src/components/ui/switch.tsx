import * as React from "react"

interface SwitchProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  id?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked = false, disabled = false, onCheckedChange, style, id, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultChecked)
    const controlled = checked !== undefined
    const on = controlled ? checked : internal

    const toggle = () => {
      if (disabled) return
      const next = !on
      if (!controlled) setInternal(next)
      onCheckedChange?.(next)
    }

    return (
      <button
        ref={ref}
        id={id}
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        data-slot="switch"
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          width: "2.5rem",
          height: "1.375rem",
          borderRadius: "9999px",
          border: "none",
          background: on ? "var(--color-accent, #4F6EF7)" : "var(--color-surface-2, #202432)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          transition: "background 0.2s",
          outline: "none",
          flexShrink: 0,
          padding: 0,
          ...style,
        }}
        {...props}
      >
        <span style={{
          position: "absolute",
          left: on ? "calc(100% - 1.1rem)" : "0.15rem",
          width: "1rem",
          height: "1rem",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          transition: "left 0.2s",
        }} />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
export type { SwitchProps }