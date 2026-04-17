import * as React from "react"

// ─── Context ─────────────────────────────────────────────────────────────────

interface DropdownContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue>({
  open: false,
  setOpen: () => { },
})

// ─── DropdownMenu (root) ──────────────────────────────────────────────────────

interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const [internal, setInternal] = React.useState(false)
  const controlled = open !== undefined
  const isOpen = controlled ? open : internal
  const wrapRef = React.useRef<HTMLDivElement>(null)

  const setOpen = (v: boolean) => {
    if (!controlled) setInternal(v)
    onOpenChange?.(v)
  }

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  React.useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen])

  return (
    <DropdownContext.Provider value={{ open: isOpen, setOpen }}>
      <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

// ─── DropdownMenuTrigger ──────────────────────────────────────────────────────

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation()
        setOpen(!open)
      },
    })
  }

  return (
    <span onClick={() => setOpen(!open)} style={{ display: "inline-flex", cursor: "pointer" }}>
      {children}
    </span>
  )
}

// ─── DropdownMenuContent ──────────────────────────────────────────────────────

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = "start", sideOffset = 4, style, children, ...props }, ref) => {
    const { open } = React.useContext(DropdownContext)
    if (!open) return null

    const alignStyle: React.CSSProperties =
      align === "start" ? { left: 0 } : align === "end" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }

    return (
      <div
        ref={ref}
        role="menu"
        data-slot="dropdown-menu-content"
        style={{
          position: "absolute",
          top: `calc(100% + ${sideOffset}px)`,
          ...alignStyle,
          zIndex: 50,
          minWidth: "11rem",
          background: "var(--color-surface, #1A1D27)",
          border: "1px solid var(--color-border, #2A2D3E)",
          borderRadius: "0.625rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          padding: "0.25rem",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          animation: "fadeUp 0.15s ease-out",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

// ─── DropdownMenuItem ─────────────────────────────────────────────────────────

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ disabled, inset, style, children, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownContext)
    const [hov, setHov] = React.useState(false)

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        data-slot="dropdown-menu-item"
        onClick={disabled ? undefined : (e) => {
          onClick?.(e)
          setOpen(false)
        }}
        onMouseEnter={() => !disabled && setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: `0.45rem ${inset ? "2.25rem" : "0.75rem"}`,
          paddingLeft: inset ? "2.25rem" : "0.75rem",
          fontSize: "0.875rem",
          color: disabled ? "var(--color-text-faint, #4A5168)" : "var(--color-text, #E8EDF5)",
          background: hov && !disabled ? "var(--color-surface-2, #202432)" : "transparent",
          borderRadius: "0.375rem",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          transition: "background 0.1s",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

// ─── DropdownMenuLabel ────────────────────────────────────────────────────────

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ inset, style, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dropdown-menu-label"
      style={{
        padding: `0.35rem ${inset ? "2.25rem" : "0.75rem"}`,
        paddingLeft: inset ? "2.25rem" : "0.75rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--color-text-muted, #8892A4)",
        letterSpacing: "0.04em",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

// ─── DropdownMenuSeparator ────────────────────────────────────────────────────

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      data-slot="dropdown-menu-separator"
      style={{
        height: "1px",
        background: "var(--color-border, #2A2D3E)",
        margin: "0.25rem 0",
        ...style,
      }}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

// ─── DropdownMenuShortcut ─────────────────────────────────────────────────────

const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ style, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="dropdown-menu-shortcut"
      style={{
        marginLeft: "auto",
        fontSize: "0.7rem",
        color: "var(--color-text-faint, #4A5168)",
        letterSpacing: "0.05em",
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
}