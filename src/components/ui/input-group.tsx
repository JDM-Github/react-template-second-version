// components/ui/input-group.tsx
import * as React from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────

interface InputGroupContextValue {
  disabled?: boolean
  hasError?: boolean
  focused: boolean
  setFocused: (v: boolean) => void
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(null)

// Theme tokens (mirror your CSS variables)
const BORDER = "var(--color-border, #2A2D3E)"
const BORDER_ERROR = "#ef4444"
const SURFACE_2 = "var(--color-surface-2, #202432)"
const TEXT = "var(--color-text, #E8EDF5)"
const TEXT_MUTED = "var(--color-text-muted, #8892A4)"
const FONT = "var(--font-sans, 'DM Sans', system-ui, sans-serif)"

// ─────────────────────────────────────────────────────────────────────────────
// InputGroup (root container)
// ─────────────────────────────────────────────────────────────────────────────

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  error?: boolean
  size?: "sm" | "default" | "lg"
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ disabled = false, error = false, size = "default", style, children, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)

    const height = size === "sm" ? "2rem" : size === "lg" ? "2.75rem" : "2.375rem"
    const fontSize = size === "sm" ? "0.8125rem" : "0.875rem"

    const borderColor = error ? BORDER_ERROR : focused ? "var(--color-accent, #4F6EF7)" : BORDER
    const ringColor = error ? "rgba(239,68,68,0.3)" : "rgba(79,110,247,0.25)"

    const contextValue: InputGroupContextValue = {
      disabled,
      hasError: error,
      focused,
      setFocused,
    }

    return (
      <InputGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-slot="input-group"
          data-disabled={disabled}
          data-error={error}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            minWidth: 0,
            height,
            borderRadius: "0.5rem",
            border: `1px solid ${borderColor}`,
            background: disabled ? SURFACE_2 : "transparent",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: focused ? `0 0 0 3px ${ringColor}` : "none",
            fontFamily: FONT,
            fontSize,
            color: TEXT,
            ...style,
          }}
          {...props}
        >
          {children}
        </div>
      </InputGroupContext.Provider>
    )
  }
)
InputGroup.displayName = "InputGroup"

// ─────────────────────────────────────────────────────────────────────────────
// InputGroupAddon (prefix/suffix)
// ─────────────────────────────────────────────────────────────────────────────

interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = "start", style, children, ...props }, ref) => {
    const context = React.useContext(InputGroupContext)
    const isDisabled = context?.disabled

    const handleClick = (e: React.MouseEvent) => {
      // If the click is on a button inside the addon, don't steal focus
      if ((e.target as HTMLElement).closest("button")) return
      // Focus the input inside the same InputGroup
      const input = (e.currentTarget as HTMLElement).closest("[data-slot='input-group']")?.querySelector("input, textarea")
      if (input && input instanceof HTMLElement) input.focus()
    }

    return (
      <div
        ref={ref}
        data-slot="input-group-addon"
        data-align={align}
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.375rem",
          padding: "0 0.5rem",
          color: isDisabled ? TEXT_MUTED : TEXT,
          cursor: "pointer",
          userSelect: "none",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InputGroupAddon.displayName = "InputGroupAddon"

// ─────────────────────────────────────────────────────────────────────────────
// InputGroupInput
// ─────────────────────────────────────────────────────────────────────────────

interface InputGroupInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ style, onFocus, onBlur, disabled: inputDisabled, ...props }, ref) => {
    const context = React.useContext(InputGroupContext)
    const isDisabled = context?.disabled || inputDisabled
    const { setFocused } = context || {}

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused?.(true)
      onFocus?.(e)
    }
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused?.(false)
      onBlur?.(e)
    }

    return (
      <input
        ref={ref}
        data-slot="input-group-control"
        disabled={isDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "0 0.5rem",
          fontSize: "inherit",
          fontFamily: "inherit",
          color: "inherit",
          ...style,
        }}
        {...props}
      />
    )
  }
)
InputGroupInput.displayName = "InputGroupInput"

// ─────────────────────────────────────────────────────────────────────────────
// InputGroupTextarea
// ─────────────────────────────────────────────────────────────────────────────

interface InputGroupTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, InputGroupTextareaProps>(
  ({ style, onFocus, onBlur, disabled: textareaDisabled, ...props }, ref) => {
    const context = React.useContext(InputGroupContext)
    const isDisabled = context?.disabled || textareaDisabled
    const { setFocused } = context || {}

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused?.(true)
      onFocus?.(e)
    }
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused?.(false)
      onBlur?.(e)
    }

    return (
      <textarea
        ref={ref}
        data-slot="input-group-control"
        disabled={isDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "0.5rem",
          fontSize: "inherit",
          fontFamily: "inherit",
          color: "inherit",
          resize: "vertical",
          ...style,
        }}
        {...props}
      />
    )
  }
)
InputGroupTextarea.displayName = "InputGroupTextarea"

// ─────────────────────────────────────────────────────────────────────────────
// InputGroupButton (convenience wrapper around your Button)
// ─────────────────────────────────────────────────────────────────────────────

// Note: This assumes you have a Button component. If not, replace with a simple <button>.
import { Button } from "@/components/ui/button"

interface InputGroupButtonProps extends Omit<React.ComponentProps<typeof Button>, 'size'> {
  size?: "xs" | "sm" | "default"
}

const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ size = "xs", variant = "ghost", style, children, ...props }, ref) => {
    const sizeMap = {
      xs: { height: "1.75rem", padding: "0 0.5rem", fontSize: "0.75rem" },
      sm: { height: "2rem", padding: "0 0.625rem", fontSize: "0.8125rem" },
      default: { height: "2.25rem", padding: "0 0.75rem", fontSize: "0.875rem" },
    }
    return (
      <Button
        ref={ref}
        variant={variant}
        style={{
          ...sizeMap[size],
          borderRadius: "0.375rem",
          ...style,
        }}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
InputGroupButton.displayName = "InputGroupButton"

// ─────────────────────────────────────────────────────────────────────────────
// InputGroupText (simple text addon)
// ─────────────────────────────────────────────────────────────────────────────

const InputGroupText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ style, children, ...props }, ref) => (
    <span
      ref={ref}
      style={{
        fontSize: "0.75rem",
        color: TEXT_MUTED,
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
)
InputGroupText.displayName = "InputGroupText"

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupButton,
  InputGroupText,
}