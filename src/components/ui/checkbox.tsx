import * as React from "react"

interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  id?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, defaultChecked = false, disabled = false, onCheckedChange, id, style, ...props }, ref) => {
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
        role="checkbox"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        data-slot="checkbox"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1rem",
          height: "1rem",
          borderRadius: "0.25rem",
          border: `1.5px solid ${on ? "var(--color-accent, #4F6EF7)" : "var(--color-border, #2A2D3E)"}`,
          background: on ? "var(--color-accent, #4F6EF7)" : "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          flexShrink: 0,
          outline: "none",
          padding: 0,
          transition: "background 0.15s, border-color 0.15s",
          ...style,
        }}
        {...props}
      >
        {on && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 3.5L3.8 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
export type { CheckboxProps }