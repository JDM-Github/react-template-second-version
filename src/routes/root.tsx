// routes/root.tsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Blocks } from "lucide-react"
import { Dashboard } from "@/pages/root/dashboard"
import { ComponentShowcase } from "@/pages/root/component"

// ── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "components", label: "Components", icon: Blocks },
] as const

type TabId = (typeof TABS)[number]["id"]

// ── Root page ────────────────────────────────────────────────────────────────
export default function Root() {
    const [activeTab, setActiveTab] = useState<TabId>("dashboard")

    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
            }}
        >
            {/* ── Tab bar ───────────────────────────────────────────────── */}
            <div
                style={{
                    borderBottom: "1px solid var(--color-border, #2A2D3E)",
                    background: "var(--color-surface, #1A1D27)",
                    padding: "0 1.5rem",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "0.25rem",
                    flexShrink: 0,
                    position: "sticky",
                    top: "3.5rem", // sits just below the Header
                    zIndex: 40,
                }}
            >
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 500 : 400,
                                color: isActive
                                    ? "var(--color-text, #E8EDF5)"
                                    : "var(--color-text-muted, #8892A4)",
                                transition: "color 0.15s",
                                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = "var(--color-text, #E8EDF5)"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = "var(--color-text-muted, #8892A4)"
                                }
                            }}
                        >
                            <Icon
                                style={{
                                    width: "1rem",
                                    height: "1rem",
                                    color: isActive
                                        ? "var(--color-accent, #4F6EF7)"
                                        : "currentColor",
                                    transition: "color 0.15s",
                                }}
                            />
                            {tab.label}

                            {/* Active indicator line */}
                            {isActive && (
                                <motion.span
                                    layoutId="tab-indicator"
                                    style={{
                                        position: "absolute",
                                        bottom: -1,
                                        left: 0,
                                        right: 0,
                                        height: 2,
                                        borderRadius: "1px 1px 0 0",
                                        background: "var(--color-accent, #4F6EF7)",
                                    }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Tab content ───────────────────────────────────────────── */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            overflowY: "auto",
                        }}
                    >
                        {activeTab === "dashboard" && <Dashboard />}
                        {activeTab === "components" && <ComponentShowcase />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}