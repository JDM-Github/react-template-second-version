import * as React from "react"

// ─── Context ─────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string
  onValueChange: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({ value: "", onValueChange: () => { } })

// ─── Tabs (root) ─────────────────────────────────────────────────────────────

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue = "", onValueChange, style, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue)
    const controlled = value !== undefined
    const current = controlled ? value : internal

    const handleChange = (v: string) => {
      if (!controlled) setInternal(v)
      onValueChange?.(v)
    }

    return (
      <TabsContext.Provider value={{ value: current, onValueChange: handleChange }}>
        <div
          ref={ref}
          data-slot="tabs"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem", ...style }}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

// ─── TabsList ────────────────────────────────────────────────────────────────

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      data-slot="tabs-list"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--color-surface, #1A1D27)",
        border: "1px solid var(--color-border, #2A2D3E)",
        borderRadius: "0.625rem",
        padding: "0.25rem",
        gap: "0.125rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = "TabsList"

// ─── TabsTrigger ─────────────────────────────────────────────────────────────

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, style, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    const active = ctx.value === value
    const [hov, setHov] = React.useState(false)

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        onClick={() => ctx.onValueChange(value)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        data-slot="tabs-trigger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.35rem 0.875rem",
          borderRadius: "0.375rem",
          border: "none",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          fontSize: "0.8rem",
          fontWeight: active ? 700 : 500,
          color: active ? "var(--color-text, #E8EDF5)" : "var(--color-text-muted, #8892A4)",
          background: active ? "var(--color-surface-2, #202432)" : hov ? "rgba(255,255,255,0.03)" : "transparent",
          boxShadow: active ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
          cursor: "pointer",
          outline: "none",
          transition: "background 0.15s, color 0.15s",
          whiteSpace: "nowrap",
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

// ─── TabsContent ─────────────────────────────────────────────────────────────

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, style, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    if (ctx.value !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-slot="tabs-content"
        style={{ outline: "none", ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }