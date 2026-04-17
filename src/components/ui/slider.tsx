import * as React from "react"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "value"> {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue = [0],
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      onValueChange,
      style,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = React.useState(defaultValue)
    const controlled = value !== undefined
    const current = controlled ? value : internal

    const pct = ((current[0] - min) / (max - min)) * 100

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = [Number(e.target.value)]
      if (!controlled) setInternal(next)
      onValueChange?.(next)
    }

    return (
      <div
        ref={ref}
        data-slot="slider"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "20px",
          ...style,
        }}
        {...props}
      >
        {/* track background */}
        <div style={{
          position: "absolute",
          width: "100%",
          height: "4px",
          background: "var(--color-surface-2, #202432)",
          borderRadius: "9999px",
          overflow: "hidden",
        }}>
          {/* filled portion */}
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: disabled ? "var(--color-border, #2A2D3E)" : "var(--color-accent, #4F6EF7)",
            borderRadius: "9999px",
            transition: "width 0.1s",
          }} />
        </div>

        {/* native range — invisible but handles all a11y + interaction */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current[0]}
          disabled={disabled}
          onChange={handleChange}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            margin: 0,
            padding: 0,
          }}
        />

        {/* thumb */}
        <div style={{
          position: "absolute",
          left: `calc(${pct}% - 9px)`,
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "var(--color-accent, #4F6EF7)",
          border: "2px solid var(--color-bg, #0F1117)",
          boxShadow: "0 0 0 2px var(--color-accent, #4F6EF7)",
          pointerEvents: "none",
          transition: "left 0.1s",
          opacity: disabled ? 0.4 : 1,
        }} />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
export type { SliderProps }