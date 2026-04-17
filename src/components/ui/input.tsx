import * as React from "react"

// ─── shared token ────────────────────────────────────────────────────────────

const fieldBase: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
  fontSize: "0.875rem",
  color: "var(--color-text, #E8EDF5)",
  background: "var(--color-surface, #1A1D27)",
  border: "1px solid var(--color-border, #2A2D3E)",
  borderRadius: "0.5rem",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    return (
      <input
        ref={ref}
        data-slot="input"
        onFocus={e => { setFocused(true); onFocus?.(e) }}
        onBlur={e => { setFocused(false); onBlur?.(e) }}
        style={{
          ...fieldBase,
          height: "2.25rem",
          padding: "0 0.75rem",
          ...(focused ? {
            borderColor: "var(--color-accent, #4F6EF7)",
            boxShadow: "0 0 0 3px rgba(79,110,247,0.18)",
          } : {}),
          ...(props.disabled ? {
            opacity: 0.45,
            cursor: "not-allowed",
          } : {}),
          ...style,
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        onFocus={e => { setFocused(true); onFocus?.(e) }}
        onBlur={e => { setFocused(false); onBlur?.(e) }}
        style={{
          ...fieldBase,
          padding: "0.625rem 0.75rem",
          lineHeight: 1.6,
          resize: "vertical",
          minHeight: "5rem",
          ...(focused ? {
            borderColor: "var(--color-accent, #4F6EF7)",
            boxShadow: "0 0 0 3px rgba(79,110,247,0.18)",
          } : {}),
          ...(props.disabled ? { opacity: 0.45, cursor: "not-allowed" } : {}),
          ...style,
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// ─── Label ───────────────────────────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ style, children, ...props }, ref) => (
    <label
      ref={ref}
      data-slot="label"
      style={{
        display: "block",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "var(--color-text, #E8EDF5)",
        lineHeight: 1.4,
        ...style,
      }}
      {...props}
    >
      {children}
    </label>
  )
)
Label.displayName = "Label"

export { Input, Textarea, Label }
export type { InputProps, TextareaProps, LabelProps }