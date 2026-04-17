import * as React from "react"

// ─── Context ─────────────────────────────────────────────────────────────────

interface CollapsibleContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  disabled: boolean
}

const CollapsibleContext = React.createContext<CollapsibleContextValue>({
  open: false,
  setOpen: () => { },
  disabled: false,
})

// ─── Collapsible (root) ───────────────────────────────────────────────────────

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, defaultOpen = false, onOpenChange, disabled = false, style, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultOpen)
    const controlled = open !== undefined
    const isOpen = controlled ? open : internal

    const setOpen = (v: boolean) => {
      if (disabled) return
      if (!controlled) setInternal(v)
      onOpenChange?.(v)
    }

    return (
      <CollapsibleContext.Provider value={{ open: isOpen, setOpen, disabled }}>
        <div
          ref={ref}
          data-slot="collapsible"
          data-state={isOpen ? "open" : "closed"}
          style={style}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = "Collapsible"

// ─── CollapsibleTrigger ───────────────────────────────────────────────────────

interface CollapsibleTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

function CollapsibleTrigger({ asChild, children }: CollapsibleTriggerProps) {
  const { open, setOpen, disabled } = React.useContext(CollapsibleContext)

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const existingOnClick = child.props.onClick
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        existingOnClick?.(e)
        setOpen(!open)
      },
      "aria-expanded": open,
      disabled: disabled || undefined,
    })
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        font: "inherit",
        color: "inherit",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </button>
  )
}

// ─── CollapsibleContent (with smooth height animation) ───────────────────────

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Duration of the expand/collapse animation in ms */
  animationDuration?: number
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ animationDuration = 200, style, children, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext)
    const [height, setHeight] = React.useState<number | "auto">(open ? "auto" : 0)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const isFirstRender = React.useRef(true)

    // Measure the content height when open state changes
    React.useLayoutEffect(() => {
      if (!contentRef.current) return

      const resizeObserver = new ResizeObserver(() => {
        if (open && contentRef.current) {
          // When open, we need to get the scrollHeight for animation
          const targetHeight = contentRef.current.scrollHeight
          if (height !== targetHeight) setHeight(targetHeight)
        }
      })

      if (open) {
        // Set height to measured scrollHeight to animate from 0
        const targetHeight = contentRef.current.scrollHeight
        if (height !== targetHeight) setHeight(targetHeight)
        resizeObserver.observe(contentRef.current)
      } else {
        setHeight(0)
      }

      return () => resizeObserver.disconnect()
    }, [open, height])

    // After animation completes, set height to "auto" so content can grow naturally
    React.useEffect(() => {
      if (!contentRef.current) return
      if (open) {
        const handleTransitionEnd = () => {
          if (open && contentRef.current) {
            setHeight("auto")
          }
        }
        const element = contentRef.current
        element.addEventListener("transitionend", handleTransitionEnd, { once: true })
        return () => element.removeEventListener("transitionend", handleTransitionEnd)
      }
    }, [open])

    // For initial render, if defaultOpen is true, we want height = auto immediately
    React.useLayoutEffect(() => {
      if (isFirstRender.current && open && contentRef.current) {
        setHeight(contentRef.current.scrollHeight)
        isFirstRender.current = false
      }
    }, [open])

    return (
      <div
        ref={ref}
        data-slot="collapsible-content"
        data-state={open ? "open" : "closed"}
        style={{
          overflow: "hidden",
          height: height === "auto" ? "auto" : height,
          transition: `height ${animationDuration}ms ease-out`,
          ...style,
        }}
        {...props}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    )
  }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
export type { CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps }