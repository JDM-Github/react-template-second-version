import * as React from "react"
import { createPortal } from "react-dom"

// ─────────────────────────────────────────────────────────────────────────────
// Contexts
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipProviderContextValue {
  delayDuration: number
  skipDelayDuration: number
  currentOpenId: symbol | null
  setCurrentOpenId: (id: symbol | null) => void
}

const TooltipProviderContext = React.createContext<TooltipProviderContextValue | null>(null)

interface TooltipInstanceContextValue {
  id: symbol
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const TooltipInstanceContext = React.createContext<TooltipInstanceContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// TooltipProvider (global config & coordination)
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number      // default 300ms
  skipDelayDuration?: number  // default 300ms (time before another tooltip can open)
}

function TooltipProvider({
  children,
  delayDuration = 300,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  const [currentOpenId, setCurrentOpenId] = React.useState<symbol | null>(null)

  const value: TooltipProviderContextValue = {
    delayDuration,
    skipDelayDuration,
    currentOpenId,
    setCurrentOpenId,
  }

  return (
    <TooltipProviderContext.Provider value={value}>
      {children}
    </TooltipProviderContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip (root)
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Tooltip({ children, defaultOpen = false, open: controlledOpen, onOpenChange }: TooltipProps) {
  const provider = React.useContext(TooltipProviderContext)
  if (!provider) {
    throw new Error("Tooltip must be used within a TooltipProvider")
  }

  const id = React.useMemo(() => Symbol("tooltip"), [])
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const triggerRef = React.useRef<HTMLElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(nextOpen)
      onOpenChange?.(nextOpen)

      // Coordinate with provider: only one open tooltip at a time
      if (nextOpen) {
        provider.setCurrentOpenId(id)
      } else if (provider.currentOpenId === id) {
        provider.setCurrentOpenId(null)
      }
    },
    [isControlled, onOpenChange, id, provider]
  )

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (provider.currentOpenId === id) {
        provider.setCurrentOpenId(null)
      }
    }
  }, [id, provider])

  const contextValue: TooltipInstanceContextValue = {
    id,
    open,
    setOpen,
    triggerRef,
    contentRef,
  }

  return (
    <TooltipInstanceContext.Provider value={contextValue}>
      <div style={{ position: "relative", display: "inline-flex" }}>
        {children}
      </div>
    </TooltipInstanceContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TooltipTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  children: React.ReactNode
}

function TooltipTrigger({ asChild, children, ...props }: TooltipTriggerProps) {
  const instance = React.useContext(TooltipInstanceContext)
  const provider = React.useContext(TooltipProviderContext)
  if (!instance || !provider) {
    throw new Error("TooltipTrigger must be used within a Tooltip")
  }

  const { setOpen, triggerRef } = instance
  const { delayDuration, skipDelayDuration, currentOpenId } = provider
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMouseInsideRef = React.useRef(false)

  const clearTimeouts = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
  }

  const handleOpen = React.useCallback(() => {
    clearTimeouts()
    if (currentOpenId && currentOpenId !== instance.id) {
      setOpen(true)
    } else {
      openTimeoutRef.current = setTimeout(() => setOpen(true), delayDuration)
    }
  }, [currentOpenId, instance.id, setOpen, delayDuration])

  const handleClose = React.useCallback(() => {
    clearTimeouts()
    closeTimeoutRef.current = setTimeout(() => {
      if (!isMouseInsideRef.current) setOpen(false)
    }, skipDelayDuration)
  }, [setOpen, skipDelayDuration])

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    isMouseInsideRef.current = true
    if (triggerRef.current !== e.currentTarget) {
      triggerRef.current = e.currentTarget
    }
    handleOpen()
  }

  const handleMouseLeave = () => {
    isMouseInsideRef.current = false
    handleClose()
  }

  React.useEffect(() => {
    return () => clearTimeouts()
  }, [])

  // asChild logic with proper TypeScript workarounds
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnMouseEnter = child.props.onMouseEnter
    const existingOnMouseLeave = child.props.onMouseLeave

    // Merge our ref with the child's original ref
    const mergedRef = (node: HTMLElement | null) => {
      triggerRef.current = node
      const originalRef = (child as any).ref
      if (typeof originalRef === 'function') {
        originalRef(node)
      } else if (originalRef && typeof originalRef === 'object') {
        originalRef.current = node
      }
    }

    return React.cloneElement(
      child,
      {
        ...props,
        ref: mergedRef,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          existingOnMouseEnter?.(e)
          handleMouseEnter(e)
        },
        onMouseLeave: () => {
          existingOnMouseLeave?.()
          handleMouseLeave()
        },
      } as any
    )
  }
  return (
    <span
      ref={triggerRef as React.Ref<HTMLSpanElement>}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-flex" }}
      {...props}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TooltipContent
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  avoidCollisions?: boolean // simple collision detection (flip to opposite side)
}

function TooltipContent({
  side = "top",
  sideOffset = 6,
  avoidCollisions = true,
  style,
  children,
  ...props
}: TooltipContentProps) {
  const instance = React.useContext(TooltipInstanceContext)
  if (!instance) {
    throw new Error("TooltipContent must be used within a Tooltip")
  }

  const { open, triggerRef, contentRef } = instance
  const [actualSide, setActualSide] = React.useState(side)
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({})

  // Function to compute position based on trigger and viewport
  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current
    const contentEl = contentRef.current
    if (!trigger || !contentEl) return

    const triggerRect = trigger.getBoundingClientRect()
    const contentRect = contentEl.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let chosenSide = side
    let offset = sideOffset

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

    setActualSide(chosenSide)

    let top = 0
    let left = 0
    switch (chosenSide) {
      case "top":
        top = triggerRect.top - contentRect.height - offset
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2
        break
      case "bottom":
        top = triggerRect.bottom + offset
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2
        break
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2
        left = triggerRect.left - contentRect.width - offset
        break
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2
        left = triggerRect.right + offset
        break
    }

    if (left < 0) left = 8
    if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width - 8
    if (top < 0) top = 8
    if (top + contentRect.height > viewportHeight) top = viewportHeight - contentRect.height - 8

    setPositionStyle({ position: "fixed", top, left, zIndex: 1000 })
  }, [side, sideOffset, avoidCollisions, triggerRef, contentRef])

  // ✅ Hook #1 (always called)
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
  }, [open, updatePosition, triggerRef, contentRef])

  // ✅ Hook #2 (always called)
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#tooltip-styles")) {
      const style = document.createElement("style")
      style.id = "tooltip-styles"
      style.textContent = `
        @keyframes tooltip-fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .tooltip-content {
          animation: tooltip-fade-in 0.15s ease-out;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  // ✅ Now it's safe to return early
  if (!open) return null

  return createPortal(
    <div
      ref={contentRef}
      role="tooltip"
      data-side={actualSide}
      className="tooltip-content"
      style={{
        ...positionStyle,
        padding: "0.35rem 0.625rem",
        fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "var(--color-text, #E8EDF5)",
        background: "var(--color-surface-2, #202432)",
        border: "1px solid var(--color-border, #2A2D3E)",
        borderRadius: "0.375rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
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

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
export type { TooltipProviderProps, TooltipProps, TooltipTriggerProps, TooltipContentProps }