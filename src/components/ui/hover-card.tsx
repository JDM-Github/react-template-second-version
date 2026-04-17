// components/ui/hover-card.tsx
import * as React from "react"
import { createPortal } from "react-dom"

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface HoverCardContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  openDelay: number
  closeDelay: number
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null)

// Theme tokens (mirror your existing components)
const SURFACE = "var(--color-surface, #1A1D27)"
const BORDER = "var(--color-border, #2A2D3E)"
const TEXT = "var(--color-text, #E8EDF5)"
const SHADOW = "0 8px 24px rgba(0,0,0,0.3)"
const FONT = "var(--font-sans, 'DM Sans', system-ui, sans-serif)"

// ─────────────────────────────────────────────────────────────────────────────
// HoverCard (root)
// ─────────────────────────────────────────────────────────────────────────────

interface HoverCardProps {
  children: React.ReactNode
  openDelay?: number
  closeDelay?: number
  onOpenChange?: (open: boolean) => void
}

function HoverCard({
  children,
  openDelay = 300,
  closeDelay = 200,
  onOpenChange,
}: HoverCardProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  const handleOpenChange = React.useCallback(
    (v: boolean) => {
      if (v === open) return
      setOpen(v)
      onOpenChange?.(v)
    },
    [open, onOpenChange]
  )

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    openTimeoutRef.current = setTimeout(() => handleOpenChange(true), openDelay)
  }

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => handleOpenChange(false), closeDelay)
  }

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const contextValue: HoverCardContextValue = {
    open,
    setOpen: handleOpenChange,
    triggerRef,
    openDelay,
    closeDelay,
  }

  return (
    <HoverCardContext.Provider value={contextValue}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: "inline-block" }}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HoverCardTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface HoverCardTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

function HoverCardTrigger({ asChild, children }: HoverCardTriggerProps) {
  const context = React.useContext(HoverCardContext)
  if (!context) throw new Error("HoverCardTrigger must be used inside HoverCard")
  const { triggerRef } = context

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node
        const originalRef = (child as any).ref
        if (typeof originalRef === "function") originalRef(node)
        else if (originalRef) originalRef.current = node
      },
    })
  }

  return (
    <span ref={triggerRef as React.Ref<HTMLSpanElement>} style={{ display: "inline-block" }}>
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HoverCardContent
// ─────────────────────────────────────────────────────────────────────────────

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  avoidCollisions?: boolean
}

function HoverCardContent({
  children,
  align = "center",
  side = "bottom",
  sideOffset = 8,
  avoidCollisions = true,
  style,
  ...props
}: HoverCardContentProps) {
  const context = React.useContext(HoverCardContext)
  if (!context) throw new Error("HoverCardContent must be used inside HoverCard")
  const { open, triggerRef } = context
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({
    visibility: "hidden",
  })

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger || !content) return

    const triggerRect = trigger.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0
    let chosenSide = side

    // Collision detection (flip side if needed)
    if (avoidCollisions) {
      const space = {
        top: triggerRect.top,
        bottom: viewportHeight - triggerRect.bottom,
        left: triggerRect.left,
        right: viewportWidth - triggerRect.right,
      }
      if (side === "top" && contentRect.height > space.top) chosenSide = "bottom"
      else if (side === "bottom" && contentRect.height > space.bottom) chosenSide = "top"
      else if (side === "left" && contentRect.width > space.left) chosenSide = "right"
      else if (side === "right" && contentRect.width > space.right) chosenSide = "left"
    }

    // Calculate position based on chosenSide and align
    const getAlignOffset = () => {
      if (align === "start") return 0
      if (align === "end") return triggerRect.width - contentRect.width
      return (triggerRect.width - contentRect.width) / 2 // center
    }

    switch (chosenSide) {
      case "top":
        top = triggerRect.top - contentRect.height - sideOffset
        left = triggerRect.left + getAlignOffset()
        break
      case "bottom":
        top = triggerRect.bottom + sideOffset
        left = triggerRect.left + getAlignOffset()
        break
      case "left":
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        left = triggerRect.left - contentRect.width - sideOffset
        break
      case "right":
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        left = triggerRect.right + sideOffset
        break
    }

    // Keep inside viewport
    if (left < 0) left = 8
    if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width - 8
    if (top < 0) top = 8
    if (top + contentRect.height > viewportHeight) top = viewportHeight - contentRect.height - 8

    setPositionStyle({
      position: "fixed",
      top,
      left,
      zIndex: 1000,
      visibility: "visible",
    })
  }, [side, align, sideOffset, avoidCollisions, triggerRef])

  // Position on open and on window changes
  React.useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const observer = new ResizeObserver(() => updatePosition())
    if (triggerRef.current) observer.observe(triggerRef.current)
    if (contentRef.current) observer.observe(contentRef.current)
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition, triggerRef])

  // Inject animation keyframes once
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#hover-card-styles")) {
      const styleEl = document.createElement("style")
      styleEl.id = "hover-card-styles"
      styleEl.textContent = `
        @keyframes hover-card-fade-in {
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
      role="tooltip"
      data-slot="hover-card-content"
      style={{
        width: "16rem",
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.75rem",
        boxShadow: SHADOW,
        padding: "1rem",
        fontFamily: FONT,
        color: TEXT,
        fontSize: "0.875rem",
        animation: "hover-card-fade-in 0.12s ease-out",
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
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { HoverCard, HoverCardTrigger, HoverCardContent }
export type { HoverCardProps, HoverCardTriggerProps, HoverCardContentProps }