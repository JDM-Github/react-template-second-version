import * as React from "react"
import { createPortal } from "react-dom"

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface SheetContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  side: "right" | "left" | "top" | "bottom"
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Sheet (root)
// ─────────────────────────────────────────────────────────────────────────────

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: "right" | "left" | "top" | "bottom"
}

function Sheet({ children, open: controlledOpen, defaultOpen = false, onOpenChange, side = "right" }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback((v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v)
    onOpenChange?.(v)
  }, [isControlled, onOpenChange])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, setOpen])

  const contextValue: SheetContextValue = { open, setOpen, side }

  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface SheetTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

function SheetTrigger({ asChild, children }: SheetTriggerProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetTrigger must be used within Sheet")
  const { setOpen } = context

  const handleClick = () => setOpen(true)
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnClick = child.props?.onClick
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        existingOnClick?.(e)
        handleClick()
      },
    })
  }

  return (
    <span onClick={handleClick} style={{ display: "inline-flex", cursor: "pointer" }}>
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetClose
// ─────────────────────────────────────────────────────────────────────────────

interface SheetCloseProps {
  asChild?: boolean
  children?: React.ReactNode
}

function SheetClose({ asChild, children }: SheetCloseProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetClose must be used within Sheet")
  const { setOpen } = context

  const handleClick = () => setOpen(false)

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnClick = child.props?.onClick
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        existingOnClick?.(e)
        handleClick()
      },
    })
  }

  return (
    <button onClick={handleClick} style={{ background: "none", border: "none", cursor: "pointer" }}>
      {children || "Close"}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetPortal
// ─────────────────────────────────────────────────────────────────────────────

function SheetPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetOverlay (with fade in/out animations)
// ─────────────────────────────────────────────────────────────────────────────

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isExiting?: boolean
  onClick?: () => void
}

function SheetOverlay({ isExiting = false, onClick, style, ...props }: SheetOverlayProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetOverlay must be used within Sheet")
  const { setOpen } = context

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  const animation = isExiting
    ? "sheet-overlay-fade-out 0.2s ease-out forwards"
    : "sheet-overlay-fade-in 0.2s ease-out forwards"

  return (
    <div
      data-slot="sheet-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        animation,
        ...style,
      }}
      onClick={handleClick}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetContent (with slide in/out animations)
// ─────────────────────────────────────────────────────────────────────────────

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
}

function SheetContent({ style, children, showCloseButton = true, ...props }: SheetContentProps) {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error("SheetContent must be used within Sheet")
  const { open, setOpen, side } = context

  // Local render & exit state
  const [shouldRender, setShouldRender] = React.useState(open)
  const [isExiting, setIsExiting] = React.useState(false)
  const exitTimerRef = React.useRef<number | null>(null)

  const sideStyles: Record<string, React.CSSProperties> = {
    right: { right: 0, top: 0, bottom: 0, width: "min(24rem, 90vw)" },
    left: { left: 0, top: 0, bottom: 0, width: "min(24rem, 90vw)" },
    top: { top: 0, left: 0, right: 0, height: "min(20rem, 60vh)" },
    bottom: { bottom: 0, left: 0, right: 0, height: "min(20rem, 60vh)" },
  }

  const slideInName = {
    right: "sheet-slide-in-right",
    left: "sheet-slide-in-left",
    top: "sheet-slide-in-top",
    bottom: "sheet-slide-in-bottom",
  }[side]

  const slideOutName = {
    right: "sheet-slide-out-right",
    left: "sheet-slide-out-left",
    top: "sheet-slide-out-top",
    bottom: "sheet-slide-out-bottom",
  }[side]

  // Inject keyframes (including exit animations)
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#sheet-animations")) {
      const styleEl = document.createElement("style")
      styleEl.id = "sheet-animations"
      styleEl.textContent = `
        @keyframes sheet-overlay-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sheet-overlay-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes sheet-slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes sheet-slide-out-right {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes sheet-slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes sheet-slide-out-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes sheet-slide-in-top {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes sheet-slide-out-top {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
        @keyframes sheet-slide-in-bottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes sheet-slide-out-bottom {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
      `
      document.head.appendChild(styleEl)
    }
  }, [])

  // Handle open state changes with exit animation
  React.useEffect(() => {
    if (open) {
      // Cancel any pending exit
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }
      setIsExiting(false)
      setShouldRender(true)
    } else if (shouldRender) {
      // Start exit animation
      setIsExiting(true)
      exitTimerRef.current = window.setTimeout(() => {
        setShouldRender(false)
        setIsExiting(false)
        exitTimerRef.current = null
      }, 200) // matches animation duration
    }

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }
    }
  }, [open, shouldRender])

  if (!shouldRender) return null

  const contentAnimation = isExiting
    ? `${slideOutName} 0.2s ease-out forwards`
    : `${slideInName} 0.2s ease-out forwards`

  return (
    <SheetPortal>
      <SheetOverlay isExiting={isExiting} />
      <div
        data-slot="sheet-content"
        style={{
          position: "fixed",
          zIndex: 51,
          background: "var(--color-surface, #1A1D27)",
          borderLeft: side === "right" ? "1px solid var(--color-border, #2A2D3E)" : "none",
          borderRight: side === "left" ? "1px solid var(--color-border, #2A2D3E)" : "none",
          borderBottom: side === "top" ? "1px solid var(--color-border, #2A2D3E)" : "none",
          borderTop: side === "bottom" ? "1px solid var(--color-border, #2A2D3E)" : "none",
          boxShadow: "0 0 60px rgba(0,0,0,0.4)",
          padding: "1.5rem",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          color: "var(--color-text, #E8EDF5)",
          overflowY: "auto",
          animation: contentAnimation,
          ...sideStyles[side],
          ...style,
        }}
        {...props}
      >
        {showCloseButton && (
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "0.875rem",
              right: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted, #8892A4)",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--color-surface-2, #202432)"
              e.currentTarget.style.color = "var(--color-text, #E8EDF5)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--color-text-muted, #8892A4)"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </SheetPortal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SheetHeader, SheetTitle, SheetDescription, SheetFooter
// ─────────────────────────────────────────────────────────────────────────────

function SheetHeader({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-header"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        marginBottom: "1.25rem",
        paddingRight: "2rem",
        ...style,
      }}
      {...props}
    />
  )
}

function SheetTitle({ className, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="sheet-title"
      style={{
        fontSize: "1.125rem",
        fontWeight: 700,
        lineHeight: 1.3,
        color: "var(--color-text, #E8EDF5)",
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
}

function SheetDescription({ className, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="sheet-description"
      style={{
        fontSize: "0.875rem",
        color: "var(--color-text-muted, #8892A4)",
        lineHeight: 1.6,
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
}

function SheetFooter({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-footer"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.5rem",
        marginTop: "auto",
        paddingTop: "1rem",
        ...style,
      }}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
}