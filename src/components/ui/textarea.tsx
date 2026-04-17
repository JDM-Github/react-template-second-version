import * as React from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, disabled, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-slot="textarea"
        style={{
          display: "flex",
          width: "100%",
          minHeight: "5rem",
          padding: "0.625rem 0.75rem",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          fontSize: "0.875rem",
          color: "var(--color-text, #E8EDF5)",
          background: "var(--color-surface, #1A1D27)",
          border: `1px solid ${focused ? "var(--color-accent, #4F6EF7)" : "var(--color-border, #2A2D3E)"}`,
          borderRadius: "0.5rem",
          outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(79,110,247,0.18)" : "none",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.45 : 1,
          resize: "vertical",
          lineHeight: 1.6,
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
export type { TextareaProps }