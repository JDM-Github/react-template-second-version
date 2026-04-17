import * as React from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ style, children, ...props }, ref) => (
    <label
      ref={ref}
      data-slot="label"
      style={{
        display: "inline-block",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--color-text, #E8EDF5)",
        lineHeight: 1.4,
        userSelect: "none",
        cursor: "default",
        ...style,
      }}
      {...props}
    >
      {children}
    </label>
  )
)
Label.displayName = "Label"

export { Label }
export type { LabelProps }