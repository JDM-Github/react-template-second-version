// components/layout/sidebar.tsx
import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
    LayoutDashboard,
    Settings,
    Users,
    BarChart,
    ChevronLeft,
    ChevronRight,
    AppWindow,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/users", label: "Users", icon: Users },
    { to: "/analytics", label: "Analytics", icon: BarChart },
    { to: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
    className?: string
    collapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
    isMobile?: boolean
    appName?: string
    appIcon?: React.ReactNode
}

export function Sidebar({
    className,
    collapsed: controlledCollapsed,
    onCollapsedChange,
    isMobile = false,
    appName = "My App",
    appIcon = <AppWindow size={20} />,
}: SidebarProps) {
    const [internalCollapsed, setInternalCollapsed] = useState(false)
    const collapsed = isMobile ? false : (controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed)

    const toggleCollapsed = () => {
        if (isMobile) return
        const newState = !collapsed
        if (controlledCollapsed === undefined) setInternalCollapsed(newState)
        onCollapsedChange?.(newState)
    }

    const sidebarWidth = collapsed ? "4rem" : "16rem"

    return (
        <div
            className={cn(className)}
            style={{
                width: isMobile ? "16rem" : sidebarWidth,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "var(--color-surface, #1A1D27)",
                borderRight: "1px solid var(--color-border, #2A2D3E)",
                transition: isMobile ? "none" : "width 0.2s ease-out",
                fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
                overflow: "hidden",
            }}
        >
            {/* Top section: logo + collapse button (only when not mobile) */}
            {!isMobile && (
                <div
                    style={{
                        padding: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "space-between",
                        gap: "0.5rem",
                        borderBottom: collapsed ? "none" : "1px solid var(--color-border, #2A2D3E)",
                        marginBottom: "0.5rem",
                    }}
                >
                    {/* Logo area – only visible when expanded */}
                    {!collapsed && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ color: "var(--color-accent, #4F6EF7)" }}>{appIcon}</div>
                            <span
                                style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "var(--color-text, #E8EDF5)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {appName}
                            </span>
                        </div>
                    )}

                    {/* Collapse button */}
                    <button
                        onClick={toggleCollapsed}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            background: "transparent",
                            color: "var(--color-text-muted, #8892A4)",
                            cursor: "pointer",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2, #202432)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            )}

            {/* Navigation items */}
            <div
                style={{
                    flex: 1,
                    padding: "0.5rem 0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                }}
            >
                {navItems.map((item) => {
                    const linkContent = (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                                gap: "0.75rem",
                                padding: (collapsed && !isMobile) ? "0.5rem" : "0.5rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                transition: "background 0.15s, color 0.15s",
                                textDecoration: "none",
                                background: isActive ? "var(--color-surface-2, #202432)" : "transparent",
                                color: isActive
                                    ? "var(--color-accent, #4F6EF7)"
                                    : "var(--color-text-muted, #8892A4)",
                                fontWeight: isActive ? 500 : 400,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            })}
                        >
                            <item.icon style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
                            {(!collapsed || isMobile) && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                        </NavLink>
                    )

                    if (collapsed && !isMobile) {
                        return (
                            <Tooltip key={item.to}>
                                <TooltipTrigger asChild>
                                    <div style={{ display: "flex" }}>{linkContent}</div>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={8}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        )
                    }

                    return linkContent
                })}
            </div>
        </div>
    )
}