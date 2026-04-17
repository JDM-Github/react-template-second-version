// layout/header.tsx
import { useState } from "react"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useMediaQuery } from "@/hooks/use-media-query"
import { NotificationPopover, type Notification } from "@/components/shared/notification-popover"
import { toast } from "@/components/ui/sonner"

interface HeaderProps {
    onMenuClick?: () => void
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        title: "New message from John",
        description: "Hey, can you review the PR?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        type: "info",
    },
    {
        id: "2",
        title: "Deployment successful",
        description: "Version 2.1.0 is now live",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
        type: "success",
    },
    {
        id: "3",
        title: "Server error",
        description: "CPU usage exceeded threshold",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        type: "error",
    },
]

export function Header({ onMenuClick }: HeaderProps) {
    const isMobile = useMediaQuery("(max-width: 768px)")
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        )
    }

    const handleClearAll = () => {
        setNotifications([])
    }

    const handleNotificationClick = (notification: Notification) => {
        console.log("Notification clicked:", notification)
        toast.info(`"Notification clicked!`)
        if (notification.link) {
            // navigate(notification.link)
        }
    }

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                width: "100%",
                borderBottom: "1px solid var(--color-border, #2A2D3E)",
                background: "var(--color-surface, #1A1D27)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "3.5rem",
                    padding: "0 1.5rem",
                }}
            >
                {/* Left side */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {isMobile && (
                        <IconButton onClick={onMenuClick} aria-label="Open sidebar">
                            <Menu size={18} />
                        </IconButton>
                    )}
                    <a
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.9375rem",
                            color: "var(--color-text, #E8EDF5)",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        <span
                            style={{
                                width: "1.5rem",
                                height: "1.5rem",
                                borderRadius: "0.375rem",
                                background: "var(--color-accent, #4F6EF7)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.625rem",
                                fontWeight: 800,
                                color: "#fff",
                                letterSpacing: "0",
                                flexShrink: 0,
                            }}
                        >
                            M
                        </span>
                        My App
                    </a>
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <NotificationPopover
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onClearAll={handleClearAll}
                        onNotificationClick={handleNotificationClick}
                    />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}

// Shared icon button
function IconButton({
    children,
    onClick,
    "aria-label": ariaLabel,
}: {
    children: React.ReactNode
    onClick?: () => void
    "aria-label"?: string
}) {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "transparent",
                color: "var(--color-text-muted, #8892A4)",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-2, #202432)"
                e.currentTarget.style.color = "var(--color-text, #E8EDF5)"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "var(--color-text-muted, #8892A4)"
            }}
        >
            {children}
        </button>
    )
}