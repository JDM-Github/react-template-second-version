import * as React from "react"
import { createPortal } from "react-dom"

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface DialogContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Dialog (root)
// ─────────────────────────────────────────────────────────────────────────────

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Dialog({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: DialogProps) {
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

  const contextValue: DialogContextValue = { open, setOpen }

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DialogTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogTrigger must be used within Dialog")
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
// DialogClose
// ─────────────────────────────────────────────────────────────────────────────

interface DialogCloseProps {
  asChild?: boolean
  children?: React.ReactNode
}

function DialogClose({ asChild, children }: DialogCloseProps) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogClose must be used within Dialog")
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
// DialogPortal
// ─────────────────────────────────────────────────────────────────────────────

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

// ─────────────────────────────────────────────────────────────────────────────
// DialogOverlay (fade animation)
// ─────────────────────────────────────────────────────────────────────────────

interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
}

function DialogOverlay({ onClick, style, ...props }: DialogOverlayProps) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogOverlay must be used within Dialog")
  const { open, setOpen } = context

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <div
      data-slot="dialog-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        animation: open ? "dialog-overlay-fade-in 0.15s ease-out" : undefined,
        ...style,
      }}
      onClick={handleClick}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DialogContent (centered, with scale+fade animation)
// ─────────────────────────────────────────────────────────────────────────────

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
}

function DialogContent({ style, children, showCloseButton = true, ...props }: DialogContentProps) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within Dialog")
  const { open, setOpen } = context

  // Inject keyframes once
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#dialog-animations")) {
      const styleEl = document.createElement("style")
      styleEl.id = "dialog-animations"
      styleEl.textContent = `
        @keyframes dialog-overlay-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dialog-content-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `
      document.head.appendChild(styleEl)
    }
  }, [])

  if (!open) return null

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        data-slot="dialog-content"
        role="dialog"
        aria-modal
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 51,
          width: "90%",
          maxWidth: "32rem",
          background: "var(--color-surface, #1A1D27)",
          border: "1px solid var(--color-border, #2A2D3E)",
          borderRadius: "1rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          padding: "1.5rem",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          color: "var(--color-text, #E8EDF5)",
          animation: "dialog-content-in 0.2s ease-out",
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
    </DialogPortal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DialogHeader, DialogFooter, DialogTitle, DialogDescription
// ─────────────────────────────────────────────────────────────────────────────

function DialogHeader({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
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

function DialogFooter({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "0.5rem",
        marginTop: "1.5rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--color-border, #2A2D3E)",
        ...style,
      }}
      {...props}
    />
  )
}

function DialogTitle({ style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="dialog-title"
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

function DialogDescription({ style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
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

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}