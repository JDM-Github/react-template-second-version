// components/ui/menubar.tsx
import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens
// ─────────────────────────────────────────────────────────────────────────────

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
// Contexts
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarContextValue {
  activeMenu: string | null
  setActiveMenu: (id: string | null) => void
  closeDelay: number
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null)

interface MenubarMenuContextValue {
  id: string
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLDivElement>
}

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Menubar (root)
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  closeDelay?: number
}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ children, closeDelay = 100, style, ...props }, ref) => {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null)

    const contextValue: MenubarContextValue = { activeMenu, setActiveMenu, closeDelay }

    return (
      <MenubarContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="menubar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.25rem",
            borderRadius: "0.5rem",
            border: `1px solid ${BORDER}`,
            background: SURFACE,
            fontFamily: FONT,
            ...style,
          }}
          {...props}
        >
          {children}
        </div>
      </MenubarContext.Provider>
    )
  }
)
Menubar.displayName = "Menubar"

// ─────────────────────────────────────────────────────────────────────────────
// MenubarMenu
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarMenuProps {
  children: React.ReactNode
}

function MenubarMenu({ children }: MenubarMenuProps) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<any>(null)
  const contentRef = React.useRef<any>(null)
  const menubarContext = React.useContext(MenubarContext)

  React.useEffect(() => {
    if (menubarContext && menubarContext.activeMenu !== id && open) {
      setOpen(false)
    }
  }, [menubarContext?.activeMenu, id, open])

  const contextValue: MenubarMenuContextValue = { id, open, setOpen, triggerRef, contentRef }

  return (
    <MenubarMenuContext.Provider value={contextValue}>
      {children}
    </MenubarMenuContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MenubarTrigger
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

function MenubarTrigger({ asChild, children, ...props }: MenubarTriggerProps) {
  const menuContext = React.useContext(MenubarMenuContext)
  const menubarContext = React.useContext(MenubarContext)
  if (!menuContext || !menubarContext) throw new Error("MenubarTrigger must be used inside MenubarMenu & Menubar")
  const { id, open, setOpen, triggerRef } = menuContext
  const { activeMenu, setActiveMenu, closeDelay } = menubarContext

  let timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (activeMenu !== null && activeMenu !== id) {
      setActiveMenu(id)
      setOpen(true)
    } else if (activeMenu === null) {
      setActiveMenu(id)
      setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (!menuContext.open) setActiveMenu(null)
    }, closeDelay)
  }

  const handleClick = () => {
    setOpen(!open)
    setActiveMenu(open ? null : id)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnClick = child.props.onClick
    const existingOnMouseEnter = child.props.onMouseEnter
    const existingOnMouseLeave = child.props.onMouseLeave
    return React.cloneElement(child, {
      ref: (node: HTMLElement) => {
        triggerRef.current = node
        const originalRef = (child as any).ref
        if (typeof originalRef === "function") originalRef(node)
        else if (originalRef) originalRef.current = node
      },
      onClick: (e: React.MouseEvent) => {
        existingOnClick?.(e)
        handleClick()
      },
      onMouseEnter: (e: React.MouseEvent) => {
        existingOnMouseEnter?.(e)
        handleMouseEnter()
      },
      onMouseLeave: (e: React.MouseEvent) => {
        existingOnMouseLeave?.(e)
        handleMouseLeave()
      },
    })
  }

  return (
    <button
      ref={triggerRef as React.Ref<HTMLButtonElement>}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.25rem 0.625rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        background: open ? SURFACE_2 : "transparent",
        color: TEXT,
        borderRadius: "0.375rem",
        border: "none",
        cursor: "pointer",
        transition: "background 0.1s",
        fontFamily: "inherit",
      }}
      {...props}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MenubarPortal & MenubarContent
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  avoidCollisions?: boolean
}

function MenubarContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  avoidCollisions = true,
  style,
  ...props
}: MenubarContentProps) {
  const menuContext = React.useContext(MenubarMenuContext)
  const menubarContext = React.useContext(MenubarContext)
  if (!menuContext || !menubarContext) throw new Error("MenubarContent must be used inside MenubarMenu")
  const { open, setOpen, triggerRef, contentRef, id } = menuContext
  const { activeMenu, setActiveMenu, closeDelay } = menubarContext
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({ visibility: "hidden" })
  let closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)

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

    const getAlignOffset = () => {
      if (align === "start") return 0
      if (align === "end") return triggerRect.width - contentRect.width
      return (triggerRect.width - contentRect.width) / 2
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

    if (left < 0) left = 8
    if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width - 8
    if (top < 0) top = 8
    if (top + contentRect.height > viewportHeight) top = viewportHeight - contentRect.height - 8

    setPositionStyle({ position: "fixed", top, left, zIndex: 1000, visibility: "visible" })
  }, [side, align, sideOffset, avoidCollisions, triggerRef])

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

  // Handle hover to keep open when moving between trigger and content
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
  }
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
      setActiveMenu(null)
    }, closeDelay)
  }

  // Global click outside to close
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (contentRef.current?.contains(target)) return
      setOpen(false)
      setActiveMenu(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, setOpen, setActiveMenu, triggerRef])

  // Keyboard navigation (arrow keys, escape)
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setActiveMenu(null)
        triggerRef.current?.focus()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        const firstItem = contentRef.current?.querySelector<HTMLElement>("[role='menuitem']")
        firstItem?.focus()
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        const items = contentRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']")
        const lastItem = items?.[items.length - 1]
        lastItem?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen, setActiveMenu, triggerRef, contentRef])

  // Animation styles
  React.useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector("#menubar-styles")) {
      const styleEl = document.createElement("style")
      styleEl.id = "menubar-styles"
      styleEl.textContent = `
        @keyframes menubar-fade-in {
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
        animation: "menubar-fade-in 0.12s ease-out",
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
// MenubarItem
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  inset?: boolean
  variant?: "default" | "destructive"
  onSelect?: () => void
}

const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ disabled, inset, variant = "default", onSelect, children, onClick, ...props }, ref) => {
    const menuContext = React.useContext(MenubarMenuContext)
    const [hovered, setHovered] = React.useState(false)

    const handleClick = (e: any) => {
      if (disabled) return
      onClick?.(e)
      onSelect?.()
      menuContext?.setOpen(false)
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
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
          outline: "none",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick(e as any)
          }
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MenubarItem.displayName = "MenubarItem"

// ─────────────────────────────────────────────────────────────────────────────
// MenubarCheckboxItem
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarCheckboxItemProps extends Omit<MenubarItemProps, "onSelect"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function MenubarCheckboxItem({ checked, onCheckedChange, children, ...props }: MenubarCheckboxItemProps) {
  return (
    <MenubarItem {...props} onSelect={() => onCheckedChange?.(!checked)}>
      <span style={{ width: "1rem", display: "inline-flex", justifyContent: "center" }}>
        {checked && <CheckIcon style={{ width: "0.875rem", height: "0.875rem" }} />}
      </span>
      {children}
    </MenubarItem>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MenubarRadioItem
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarRadioItemProps extends Omit<MenubarItemProps, "onSelect"> {
  value?: string
  groupValue?: string
  onGroupChange?: (value: string) => void
}

function MenubarRadioItem({ value, groupValue, onGroupChange, children, ...props }: MenubarRadioItemProps) {
  const checked = value === groupValue
  return (
    <MenubarItem {...props} onSelect={() => onGroupChange?.(value!)}>
      <span style={{ width: "1rem", display: "inline-flex", justifyContent: "center" }}>
        {checked && <CheckIcon style={{ width: "0.875rem", height: "0.875rem" }} />}
      </span>
      {children}
    </MenubarItem>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MenubarLabel
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

function MenubarLabel({ children, inset, style, ...props }: MenubarLabelProps) {
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

// ─────────────────────────────────────────────────────────────────────────────
// MenubarSeparator
// ─────────────────────────────────────────────────────────────────────────────

function MenubarSeparator({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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

// ─────────────────────────────────────────────────────────────────────────────
// MenubarShortcut
// ─────────────────────────────────────────────────────────────────────────────

function MenubarShortcut({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
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
// MenubarGroup (simple container)
// ─────────────────────────────────────────────────────────────────────────────

function MenubarGroup({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ ...style }} {...props}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MenubarSub (submenu)
// ─────────────────────────────────────────────────────────────────────────────

interface MenubarSubContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLDivElement>
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
}

const MenubarSubContext = React.createContext<MenubarSubContextValue | null>(null)

function MenubarSub({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<any>(null)
  const contentRef = React.useRef<any>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  return (
    <MenubarSubContext.Provider value={{ open, setOpen, triggerRef, contentRef, timeoutRef }}>
      {children}
    </MenubarSubContext.Provider>
  )
}

interface MenubarSubTriggerProps extends MenubarItemProps {
  inset?: boolean
}

function MenubarSubTrigger({ children, inset, ...props }: MenubarSubTriggerProps) {
  const subContext = React.useContext(MenubarSubContext)
  if (!subContext) throw new Error("MenubarSubTrigger must be used inside MenubarSub")
  const { open, setOpen, triggerRef, timeoutRef } = subContext
  const [hovered, setHovered] = React.useState(false)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(true), 150)
    setHovered(true)
  }
  const handleMouseLeave = () => {
    setHovered(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), 100)
  }

  return (
    <div
      ref={triggerRef as React.Ref<HTMLDivElement>}
      role="menuitem"
      aria-haspopup="menu"
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
        background: hovered || open ? SURFACE_2 : "transparent",
        borderRadius: "0.375rem",
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.1s",
      }}
      {...props}
    >
      {children}
      <ChevronRightIcon style={{ width: "1rem", height: "1rem", marginLeft: "auto" }} />
    </div>
  )
}

interface MenubarSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}

function MenubarSubContent({ children, sideOffset = 8, style, ...props }: MenubarSubContentProps) {
  const subContext = React.useContext(MenubarSubContext)
  if (!subContext) throw new Error("MenubarSubContent must be used inside MenubarSub")
  const { open, setOpen, triggerRef, contentRef, timeoutRef } = subContext
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
  }, [open, updatePosition, contentRef])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), 100)
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
        animation: "menubar-fade-in 0.12s ease-out",
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

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}