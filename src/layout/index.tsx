// layout/index.tsx
import { useState } from "react"
import { createPortal } from "react-dom"
import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/layout/header"
import { Sidebar } from "@/layout/sidebar"
import { Footer } from "@/layout/footer"
import { useMediaQuery } from "@/hooks/use-media-query"

export function Layout() {
    const location = useLocation()
    const isMobile = useMediaQuery("(max-width: 768px)")
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const sidebarWidth = sidebarCollapsed ? "4rem" : "16rem"

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
                backgroundColor: "var(--color-bg, #0F1117)",
                color: "var(--color-text, #E8EDF5)",
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
            }}
        >
            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
                {!isMobile && (
                    <motion.aside
                        animate={{ width: sidebarWidth }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            borderRight: "1px solid var(--color-border, #2A2D3E)",
                            backgroundColor: "var(--color-surface, #1A1D27)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            flexShrink: 0,
                        }}
                    >
                        <Sidebar
                            collapsed={sidebarCollapsed}
                            onCollapsedChange={setSidebarCollapsed}
                            isMobile={false}
                        />
                    </motion.aside>
                )}

                <main
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Header onMenuClick={() => setMobileSidebarOpen(true)} />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{ flex: 1, display: "flex", flexDirection: "column" }}
                        >
                            <Outlet />
                            <Footer />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {isMobile && mobileSidebarOpen &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileSidebarOpen(false)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(0,0,0,0.55)",
                                backdropFilter: "blur(4px)",
                                zIndex: 60,
                            }}
                        />
                        <motion.div
                            key="drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: "16rem",
                                background: "var(--color-surface, #1A1D27)",
                                borderRight: "1px solid var(--color-border, #2A2D3E)",
                                zIndex: 61,
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: "8px 0 32px rgba(0,0,0,0.4)",
                            }}
                        >
                            <div style={{
                                padding: "0.75rem 0.75rem 0",
                                display: "flex",
                                justifyContent: "flex-end",
                            }}>
                                <button
                                    onClick={() => setMobileSidebarOpen(false)}
                                    aria-label="Close sidebar"
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
                                        fontSize: "1rem",
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
                                    ✕
                                </button>
                            </div>
                            <Sidebar
                                collapsed={false}
                                onCollapsedChange={() => { }}
                                isMobile={true}
                            />
                        </motion.div>
                    </AnimatePresence>,
                    document.body
                )
            }
        </div>
    )
}