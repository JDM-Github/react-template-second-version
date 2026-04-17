import * as React from "react"
import { createPortal } from "react-dom"

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface PopoverContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  anchorRef: React.RefObject<HTMLElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Popover (root)
// ─────────────────────────────────────────────────────────────────────────────

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Popover({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const triggerRef = React.useRef<HTMLElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const anchorRef = React.useRef<HTMLElement>(null)

  const setOpen = React.useCallback((v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v)
    onOpenChange?.(v)
  }, [isControlled, onOpenChange])

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const trigger = triggerRef.current
      const content = contentRef.current
      const anchor = anchorRef.current
      if (
        (trigger && trigger.contains(target)) ||
        (content && content.contains(target)) ||
        (anchor && anchor.contains(target))
      ) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, setOpen])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, setOpen])

  const contextValue: PopoverContextValue = {
    open,
    setOpen,
    triggerRef,
    contentRef,
    anchorRef,
  }

  return (
    <PopoverContext.Provider value={contextValue}>
      <div style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PopoverAnchor (optional, for custom positioning)
// ─────────────────────────────────────────────────────────────────────────────

interface PopoverAnchorProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  children?: React.ReactNode
}

function PopoverAnchor({ asChild, children, ...props }: PopoverAnchorProps) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverAnchor must be used within Popover")
  const { anchorRef } = context

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      ref: (node: HTMLElement | null) => {
        anchorRef.current = node
        const originalRef = (children as any).ref
        if (typeof originalRef === 'function') originalRef(node)
        else if (originalRef) originalRef.current = node
      },
      ...props,
    })
  }

  return <span ref={anchorRef} {...props}>{children}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// PopoverTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface PopoverTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  children: React.ReactNode
}

function PopoverTrigger({ asChild, children, ...props }: PopoverTriggerProps) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverTrigger must be used within Popover")
  const { open, setOpen, triggerRef } = context

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnClick = child.props.onClick
    return React.cloneElement(child, {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node
        const originalRef = (child as any).ref
        if (typeof originalRef === 'function') originalRef(node)
        else if (originalRef) originalRef.current = node
      },
      onClick: (e: React.MouseEvent) => {
        existingOnClick?.(e)
        handleClick(e)
      },
      ...props,
    })
  }

  return (
    <span
      ref={triggerRef as React.Ref<HTMLSpanElement>}
      onClick={handleClick}
      style={{ display: "inline-flex", cursor: "pointer" }}
      {...props}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PopoverContent (with portal and no flicker)
// ─────────────────────────────────────────────────────────────────────────────

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  avoidCollisions?: boolean
}

function PopoverContent({
  align = "center",
  side = "bottom",
  sideOffset = 8,
  avoidCollisions = true,
  style,
  children,
  ...props
}: PopoverContentProps) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverContent must be used within Popover")
  const { open, triggerRef, anchorRef, contentRef } = context
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({})

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current
    const anchor = anchorRef.current
    const contentEl = contentRef.current
    if (!contentEl) return

    const reference = anchor || trigger
    if (!reference) return

    const refRect = reference.getBoundingClientRect()
    const contentRect = contentEl.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0
    let chosenSide = side

    const flipIfNeeded = (desiredSide: typeof side) => {
      if (!avoidCollisions) return desiredSide
      const space = {
        top: refRect.top,
        bottom: viewportHeight - refRect.bottom,
        left: refRect.left,
        right: viewportWidth - refRect.right,
      }
      if (desiredSide === "top" && contentRect.height > space.top) return "bottom"
      if (desiredSide === "bottom" && contentRect.height > space.bottom) return "top"
      if (desiredSide === "left" && contentRect.width > space.left) return "right"
      if (desiredSide === "right" && contentRect.width > space.right) return "left"
      return desiredSide
    }

    chosenSide = flipIfNeeded(side)

    const getAlignOffset = () => {
      if (align === "start") return 0
      if (align === "end") return refRect.width - contentRect.width
      return (refRect.width - contentRect.width) / 2
    }

    switch (chosenSide) {
      case "top":
        top = refRect.top - contentRect.height - sideOffset
        left = refRect.left + getAlignOffset()
        break
      case "bottom":
        top = refRect.bottom + sideOffset
        left = refRect.left + getAlignOffset()
        break
      case "left":
        top = refRect.top + (refRect.height - contentRect.height) / 2
        left = refRect.left - contentRect.width - sideOffset
        break
      case "right":
        top = refRect.top + (refRect.height - contentRect.height) / 2
        left = refRect.right + sideOffset
        break
    }

    if (left < 0) left = 8
    if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width - 8
    if (top < 0) top = 8
    if (top + contentRect.height > viewportHeight) top = viewportHeight - contentRect.height - 8

    setPositionStyle({
      position: "fixed",
      top,
      left,
      zIndex: 1000,
    })
  }, [side, align, sideOffset, avoidCollisions, triggerRef, anchorRef, contentRef])

  React.useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const observer = new ResizeObserver(() => updatePosition())
    if (triggerRef.current) observer.observe(triggerRef.current)
    if (anchorRef.current) observer.observe(anchorRef.current)
    if (contentRef.current) observer.observe(contentRef.current)
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition, triggerRef, anchorRef, contentRef])

  // Inject fadeUp keyframe if not present (same as Dropdown)
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#popover-fadeup-styles")) {
      const styleEl = document.createElement("style")
      styleEl.id = "popover-fadeup-styles"
      styleEl.textContent = `
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(0.5rem) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `
      document.head.appendChild(styleEl)
    }
  }, [])

  if (!open) return null

  return createPortal(
    <div
      ref={contentRef}
      data-slot="popover-content"
      style={{
        ...positionStyle,
        animation: "fadeUp 0.15s ease-out",
        minWidth: "12rem",
        background: "var(--color-surface, #1A1D27)",
        border: "1px solid var(--color-border, #2A2D3E)",
        borderRadius: "0.625rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        padding: "0.75rem",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
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
// PopoverHeader, PopoverTitle, PopoverDescription (convenience components)
// ─────────────────────────────────────────────────────────────────────────────

function PopoverHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="popover-header"
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="popover-title"
      className={className}
      style={{
        margin: 0,
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--color-text, #E8EDF5)",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
      }}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="popover-description"
      className={className}
      style={{
        margin: 0,
        fontSize: "0.8125rem",
        color: "var(--color-text-muted, #8892A4)",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
        lineHeight: 1.4,
      }}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
}
export type {
  PopoverProps,
  PopoverAnchorProps,
  PopoverTriggerProps,
  PopoverContentProps,
}