import * as React from "react"

// ─── Context ─────────────────────────────────────────────────────────────────

interface SelectContextValue {
  value: string
  open: boolean
  disabled: boolean
  onSelect: (v: string, label: string) => void
  setOpen: (v: boolean) => void
  selectedLabel: string
  placeholder: string
}

const SelectContext = React.createContext<SelectContextValue>({
  value: "", open: false, disabled: false,
  onSelect: () => { }, setOpen: () => { },
  selectedLabel: "", placeholder: "",
})

// ─── Select (root) ───────────────────────────────────────────────────────────

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

function Select({ value, defaultValue = "", onValueChange, disabled = false, children }: SelectProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("Select…")

  const controlled = value !== undefined
  const current = controlled ? value : internal

  const onSelect = (v: string, label: string) => {
    if (!controlled) setInternal(v)
    setSelectedLabel(label)
    onValueChange?.(v)
    setOpen(false)
  }

  // close on outside click
  const wrapRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <SelectContext.Provider value={{ value: current, open, disabled, onSelect, setOpen, selectedLabel, placeholder }}>
      <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// ─── SelectTrigger ───────────────────────────────────────────────────────────

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ style, children, ...props }, ref) => {
    const { open, setOpen, disabled } = React.useContext(SelectContext)
    const [focused, setFocused] = React.useState(false)

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-slot="select-trigger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          minWidth: "10rem",
          height: "2.25rem",
          padding: "0 0.75rem",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          fontSize: "0.875rem",
          color: "var(--color-text, #E8EDF5)",
          background: "var(--color-surface, #1A1D27)",
          border: `1px solid ${focused ? "var(--color-accent, #4F6EF7)" : "var(--color-border, #2A2D3E)"}`,
          borderRadius: "0.5rem",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(79,110,247,0.18)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          whiteSpace: "nowrap",
          ...style,
        }}
        {...props}
      >
        {children}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

// ─── SelectValue ─────────────────────────────────────────────────────────────

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder = "Select…" }: SelectValueProps) {
  const { selectedLabel } = React.useContext(SelectContext)
  return (
    <span style={{ color: selectedLabel ? "var(--color-text, #E8EDF5)" : "var(--color-text-faint, #4A5168)" }}>
      {selectedLabel || placeholder}
    </span>
  )
}

// ─── SelectContent ───────────────────────────────────────────────────────────

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, children, ...props }, ref) => {
    const { open } = React.useContext(SelectContext)
    if (!open) return null

    return (
      <div
        ref={ref}
        data-slot="select-content"
        style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          minWidth: "100%",
          background: "var(--color-surface, #1A1D27)",
          border: "1px solid var(--color-border, #2A2D3E)",
          borderRadius: "0.625rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          zIndex: 50,
          overflow: "hidden",
          padding: "0.25rem",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

// ─── SelectItem ──────────────────────────────────────────────────────────────

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, style, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    const selected = ctx.value === value
    const [hovered, setHovered] = React.useState(false)

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        onClick={() => ctx.onSelect(value, String(children))}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-slot="select-item"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.45rem 0.75rem",
          fontSize: "0.875rem",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          color: selected ? "var(--color-accent, #4F6EF7)" : "var(--color-text, #E8EDF5)",
          background: hovered ? "var(--color-surface-2, #202432)" : "transparent",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontWeight: selected ? 600 : 400,
          transition: "background 0.1s",
          ...style,
        }}
        {...props}
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1 3.5L3.8 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {!selected && <span style={{ width: 10, flexShrink: 0 }} />}
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }