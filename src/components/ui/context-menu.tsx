import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────

type ContextMenuVariant = "default" | "destructive"

interface ContextMenuContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  position: { x: number; y: number }
  setPosition: (pos: { x: number; y: number }) => void
  triggerRef: React.RefObject<HTMLElement | null>
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

// Theme tokens
const SURFACE = "var(--color-surface, #1A1D27)"
const SURFACE_2 = "var(--color-surface-2, #202432)"
const BORDER = "var(--color-border, #2A2D3E)"
const TEXT = "var(--color-text, #E8EDF5)"
const MUTED = "var(--color-text-muted, #8892A4)"
const FAINT = "var(--color-text-faint, #4A5168)"
const DESTRUCTIVE = "#ef4444"
const SHADOW = "0 8px 24px rgba(0,0,0,0.3)"
const FONT = "var(--font-sans, 'DM Sans', system-ui, sans-serif)"

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenu (root)
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

function ContextMenu({ children, onOpenChange }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLElement>(null)

  const handleOpenChange = React.useCallback((v: boolean) => {
    setOpen(v)
    onOpenChange?.(v)
  }, [onOpenChange])

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      handleOpenChange(false)
    }
    document.addEventListener("click", handleClickOutside)
    document.addEventListener("contextmenu", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("contextmenu", handleClickOutside)
    }
  }, [open, handleOpenChange])

  const value: ContextMenuContextValue = {
    open,
    setOpen: handleOpenChange,
    position,
    setPosition,
    triggerRef,
  }

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
    </ContextMenuContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenuTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuTriggerProps {
  children: React.ReactNode
  disabled?: boolean
  asChild?: boolean
}

function ContextMenuTrigger({ children, disabled = false, asChild }: ContextMenuTriggerProps) {
  const context = React.useContext(ContextMenuContext)
  if (!context) throw new Error("ContextMenuTrigger must be used inside ContextMenu")
  const { setOpen, setPosition, triggerRef } = context

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnContextMenu = child.props.onContextMenu
    return React.cloneElement(child, {
      ref: (node: HTMLElement) => {
        triggerRef.current = node
        const originalRef = (child as any).ref
        if (typeof originalRef === "function") originalRef(node)
        else if (originalRef) originalRef.current = node
      },
      onContextMenu: (e: React.MouseEvent) => {
        existingOnContextMenu?.(e)
        handleContextMenu(e)
      },
    })
  }

  return (
    <div
      ref={triggerRef as React.Ref<HTMLDivElement>}
      onContextMenu={handleContextMenu}
      style={{ display: "inline-block" }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenuContent
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  avoidCollisions?: boolean
}

function ContextMenuContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  avoidCollisions = true,
  style,
  ...props
}: ContextMenuContentProps) {
  const context = React.useContext(ContextMenuContext)
  if (!context) throw new Error("ContextMenuContent must be used inside ContextMenu")
  const { open, setOpen, position } = context
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({ visibility: "hidden" })

  const updatePosition = React.useCallback(() => {
    const contentEl = contentRef.current
    if (!contentEl) return

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const rect = contentEl.getBoundingClientRect()
    let x = position.x
    let y = position.y

    if (side === "top") y -= rect.height + sideOffset
    else if (side === "bottom") y += sideOffset
    else if (side === "left") x -= rect.width + sideOffset
    else if (side === "right") x += sideOffset

    if (align === "center") {
      if (side === "top" || side === "bottom") x -= rect.width / 2
      else y -= rect.height / 2
    } else if (align === "end") {
      if (side === "top" || side === "bottom") x -= rect.width
      else y -= rect.height
    }

    if (avoidCollisions) {
      if (x + rect.width > viewportWidth) x = viewportWidth - rect.width - 8
      if (x < 0) x = 8
      if (y + rect.height > viewportHeight) y = viewportHeight - rect.height - 8
      if (y < 0) y = 8
    }

    setPositionStyle({
      position: "fixed",
      top: y,
      left: x,
      zIndex: 1000,
      visibility: "visible",
    })
  }, [position, side, align, sideOffset, avoidCollisions])

  React.useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const observer = new ResizeObserver(() => updatePosition())
    if (contentRef.current) observer.observe(contentRef.current)
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition])

  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#context-menu-styles")) {
      const styleEl = document.createElement("style")
      styleEl.id = "context-menu-styles"
      styleEl.textContent = `
        @keyframes context-menu-fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `
      document.head.appendChild(styleEl)
    }
  }, [])

  if (!open) return null

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      data-slot="context-menu-content"
      style={{
        minWidth: "11rem",
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.625rem",
        boxShadow: SHADOW,
        padding: "0.25rem",
        fontFamily: FONT,
        color: TEXT,
        animation: "context-menu-fade-in 0.12s ease-out",
        ...positionStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenuItem
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  inset?: boolean
  variant?: ContextMenuVariant
  onSelect?: () => void
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ disabled, inset, variant = "default", onSelect, style, children, onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext)
    const [hovered, setHovered] = React.useState(false)

    const handleClick = (e: any) => {
      if (disabled) return
      onClick?.(e)
      onSelect?.()
      context?.setOpen(false)
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        onClick={handleClick}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: `0.45rem ${inset ? "2.25rem" : "0.75rem"}`,
          paddingLeft: inset ? "2.25rem" : "0.75rem",
          fontSize: "0.875rem",
          color: variant === "destructive" ? DESTRUCTIVE : TEXT,
          background: hovered && !disabled ? SURFACE_2 : "transparent",
          borderRadius: "0.375rem",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          transition: "background 0.1s",
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ContextMenuItem.displayName = "ContextMenuItem"

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenuSub
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuSubContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
  // Shared timeout so both trigger and content can cancel each other's close
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
}

const ContextMenuSubContext = React.createContext<ContextMenuSubContextValue | null>(null)

interface ContextMenuSubProps {
  children: React.ReactNode
}

function ContextMenuSub({ children }: ContextMenuSubProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<any>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (!open) return
    const handleClose = () => setOpen(false)
    document.addEventListener("click", handleClose)
    return () => document.removeEventListener("click", handleClose)
  }, [open])

  return (
    <ContextMenuSubContext.Provider value={{ open, setOpen, triggerRef, timeoutRef }}>
      {children}
    </ContextMenuSubContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenuSubTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  inset?: boolean
}

function ContextMenuSubTrigger({ children, disabled, inset, style, ...props }: ContextMenuSubTriggerProps) {
  const subContext = React.useContext(ContextMenuSubContext)
  if (!subContext) throw new Error("ContextMenuSubTrigger must be inside ContextMenuSub")
  const { open, setOpen, triggerRef, timeoutRef } = subContext
  const [hovered, setHovered] = React.useState(false)

  const handleMouseEnter = () => {
    if (disabled) return
    setHovered(true)
    // Cancel any pending close, then open
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(true), 150)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    // Give the user time to reach the sub-content before closing
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div
      ref={triggerRef as React.Ref<HTMLDivElement>}
      role="menuitem"
      aria-expanded={open}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: `0.45rem ${inset ? "2.25rem" : "0.75rem"}`,
        paddingLeft: inset ? "2.25rem" : "0.75rem",
        fontSize: "0.875rem",
        color: TEXT,
        background: (hovered || open) && !disabled ? SURFACE_2 : "transparent",
        borderRadius: "0.375rem",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        transition: "background 0.1s",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
      <ChevronRightIcon style={{ width: "1rem", height: "1rem", marginLeft: "auto" }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextMenuSubContent
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}

function ContextMenuSubContent({ children, sideOffset = 8, style, ...props }: ContextMenuSubContentProps) {
  const subContext = React.useContext(ContextMenuSubContext)
  if (!subContext) throw new Error("ContextMenuSubContent must be inside ContextMenuSub")
  const { open, setOpen, triggerRef, timeoutRef } = subContext
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({ visibility: "hidden" })

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger || !content) return
    const triggerRect = trigger.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    let left = triggerRect.right + sideOffset
    let top = triggerRect.top
    if (left + contentRect.width > viewportWidth) {
      left = triggerRect.left - contentRect.width - sideOffset
    }
    if (top + contentRect.height > window.innerHeight) {
      top = window.innerHeight - contentRect.height - 8
    }
    if (top < 0) top = 8
    setPositionStyle({ position: "fixed", top, left, zIndex: 1001, visibility: "visible" })
  }, [sideOffset, triggerRef])

  React.useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const observer = new ResizeObserver(() => updatePosition())
    if (contentRef.current) observer.observe(contentRef.current)
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition])

  // Cancel the close timeout when the user enters the sub-content panel
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  // Start close timeout when the user leaves the sub-content panel entirely
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  if (!open) return null

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        minWidth: "11rem",
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.625rem",
        boxShadow: SHADOW,
        padding: "0.25rem",
        fontFamily: FONT,
        color: TEXT,
        animation: "context-menu-fade-in 0.12s ease-out",
        ...positionStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox & Radio Items
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuCheckboxItemProps extends Omit<ContextMenuItemProps, "onSelect"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function ContextMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuItem
      {...props}
      onSelect={() => onCheckedChange?.(!checked)}
    >
      <span style={{ width: "1rem", display: "inline-flex", justifyContent: "center" }}>
        {checked && <CheckIcon style={{ width: "0.875rem", height: "0.875rem" }} />}
      </span>
      {children}
    </ContextMenuItem>
  )
}

interface ContextMenuRadioItemProps extends Omit<ContextMenuItemProps, "onSelect"> {
  value?: string
  groupValue?: string
  onGroupChange?: (value: string) => void
}

function ContextMenuRadioItem({
  value,
  groupValue,
  onGroupChange,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  const checked = value === groupValue
  return (
    <ContextMenuItem
      {...props}
      onSelect={() => onGroupChange?.(value!)}
    >
      <span style={{ width: "1rem", display: "inline-flex", justifyContent: "center" }}>
        {checked && <CheckIcon style={{ width: "0.875rem", height: "0.875rem" }} />}
      </span>
      {children}
    </ContextMenuItem>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Label, Separator, Shortcut
// ─────────────────────────────────────────────────────────────────────────────

function ContextMenuLabel({ children, inset, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <div
      style={{
        padding: `0.35rem ${inset ? "2.25rem" : "0.75rem"}`,
        fontSize: "0.75rem",
        fontWeight: 600,
        color: MUTED,
        letterSpacing: "0.04em",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function ContextMenuSeparator({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      style={{
        height: "1px",
        background: BORDER,
        margin: "0.25rem 0",
        ...style,
      }}
      {...props}
    />
  )
}

function ContextMenuShortcut({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      style={{
        marginLeft: "auto",
        fontSize: "0.7rem",
        color: FAINT,
        letterSpacing: "0.05em",
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
}