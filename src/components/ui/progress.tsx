import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, style, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        data-slot="progress"
        style={{
          position: "relative",
          width: "100%",
          height: "6px",
          background: "var(--color-surface-2, #202432)",
          borderRadius: "9999px",
          overflow: "hidden",
          ...style,
        }}
        {...props}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--color-accent, #4F6EF7)",
            borderRadius: "9999px",
            transition: "width 0.35s ease",
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
export type { ProgressProps }