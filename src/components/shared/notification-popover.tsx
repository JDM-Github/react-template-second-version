// components/ui/notification-popover.tsx
import { useState } from "react"
import { Bell, Check, Trash2, Circle, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export type NotificationType = "info" | "success" | "warning" | "error"

export interface Notification {
    id: string
    title: string
    description?: string
    timestamp: Date
    read: boolean
    type: NotificationType
    link?: string
}

interface NotificationPopoverProps {
    notifications: Notification[]
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
    onClearAll?: () => void
    onNotificationClick?: (notification: Notification) => void
    maxHeight?: string
}

const iconMap: Record<NotificationType, React.ReactNode> = {
    info: <Info size={14} />,
    success: <CheckCircle size={14} />,
    warning: <AlertTriangle size={14} />,
    error: <AlertTriangle size={14} />,
}

const colorMap: Record<NotificationType, string> = {
    info: "var(--color-info, #4F6EF7)",
    success: "var(--color-success, #22c55e)",
    warning: "var(--color-warning, #f97316)",
    error: "var(--color-error, #ef4444)",
}

export function NotificationPopover({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    onNotificationClick,
    maxHeight = "24rem",
}: NotificationPopoverProps) {
    const [open, setOpen] = useState(false)
    const unreadCount = notifications.filter(n => !n.read).length

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id)
        }
        onNotificationClick?.(notification)
        setOpen(false)
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    aria-label="Notifications"
                    style={{
                        position: "relative",
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
                    <Bell size={17} />
                    {unreadCount > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: "0.125rem",
                                right: "0.125rem",
                                width: "0.75rem",
                                height: "0.75rem",
                                borderRadius: "9999px",
                                background: "var(--color-error, #ef4444)",
                                border: "2px solid var(--color-surface, #1A1D27)",
                            }}
                        />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" sideOffset={8} style={{ width: "22rem", padding: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid var(--color-border, #2A2D3E)",
                    }}
                >
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text, #E8EDF5)" }}>
                        Notifications
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                                <Check size={14} />
                                <span style={{ marginLeft: "0.25rem" }}>Mark all read</span>
                            </Button>
                        )}
                        {onClearAll && notifications.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={onClearAll}>
                                <Trash2 size={14} />
                                <span style={{ marginLeft: "0.25rem" }}>Clear all</span>
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea style={{ maxHeight, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                        <div
                            style={{
                                padding: "2rem 1rem",
                                textAlign: "center",
                                color: "var(--color-text-muted, #8892A4)",
                                fontSize: "0.875rem",
                            }}
                        >
                            No notifications
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {notifications.map((notification, idx) => (
                                <div key={notification.id}>
                                    <button
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            display: "flex",
                                            gap: "0.75rem",
                                            padding: "0.75rem 1rem",
                                            width: "100%",
                                            textAlign: "left",
                                            background: notification.read ? "transparent" : "rgba(79,110,247,0.05)",
                                            border: "none",
                                            cursor: "pointer",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "var(--color-surface-2, #202432)"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = notification.read ? "transparent" : "rgba(79,110,247,0.05)"
                                        }}
                                    >
                                        <div style={{ flexShrink: 0, marginTop: "0.125rem" }}>
                                            {!notification.read && (
                                                <Circle size={8} fill={colorMap[notification.type]} style={{ color: colorMap[notification.type] }} />
                                            )}
                                            {notification.read && (
                                                <div style={{ width: 8, height: 8 }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                                <span style={{ color: colorMap[notification.type] }}>
                                                    {iconMap[notification.type]}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: notification.read ? 400 : 500,
                                                        color: "var(--color-text, #E8EDF5)",
                                                    }}
                                                >
                                                    {notification.title}
                                                </span>
                                            </div>
                                            {notification.description && (
                                                <p
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--color-text-muted, #8892A4)",
                                                        marginTop: "0.25rem",
                                                        lineHeight: 1.4,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {notification.description}
                                                </p>
                                            )}
                                            <p
                                                style={{
                                                    fontSize: "0.7rem",
                                                    color: "var(--color-text-faint, #4A5168)",
                                                    marginTop: "0.25rem",
                                                }}
                                            >
                                                {formatTime(notification.timestamp)}
                                            </p>
                                        </div>
                                    </button>
                                    {idx < notifications.length - 1 && <Separator style={{ margin: 0 }} />}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}