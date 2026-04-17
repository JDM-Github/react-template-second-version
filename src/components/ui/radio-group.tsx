import * as React from "react"

// ─── Context ─────────────────────────────────────────────────────────────────

interface RadioGroupContextValue {
  value: string
  onValueChange: (v: string) => void
  disabled?: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: "",
  onValueChange: () => { },
})

// ─── RadioGroup ──────────────────────────────────────────────────────────────

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, defaultValue = "", onValueChange, disabled, style, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue)
    const controlled = value !== undefined
    const current = controlled ? value : internal

    const handleChange = (v: string) => {
      if (!controlled) setInternal(v)
      onValueChange?.(v)
    }

    return (
      <RadioGroupContext.Provider value={{ value: current, onValueChange: handleChange, disabled }}>
        <div
          ref={ref}
          role="radiogroup"
          data-slot="radio-group"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem", ...style }}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

// ─── RadioGroupItem ──────────────────────────────────────────────────────────

interface RadioGroupItemProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "value"> {
  value: string
  id?: string
  disabled?: boolean
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, id, disabled, style, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext)
    const checked = ctx.value === value
    const isDisabled = disabled || ctx.disabled

    return (
      <button
        ref={ref}
        id={id}
        role="radio"
        aria-checked={checked}
        disabled={isDisabled}
        onClick={() => !isDisabled && ctx.onValueChange(value)}
        data-slot="radio-group-item"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1rem",
          height: "1rem",
          borderRadius: "50%",
          border: `1.5px solid ${checked ? "var(--color-accent, #4F6EF7)" : "var(--color-border, #2A2D3E)"}`,
          background: "transparent",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.45 : 1,
          flexShrink: 0,
          outline: "none",
          padding: 0,
          transition: "border-color 0.15s",
          ...style,
        }}
        {...props}
      >
        {checked && (
          <span style={{
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "50%",
            background: "var(--color-accent, #4F6EF7)",
          }} />
        )}
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
export type { RadioGroupProps, RadioGroupItemProps }