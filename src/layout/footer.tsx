// layout/footer.tsx
export function Footer() {
    return (
        <footer
            style={{
                borderTop: "1px solid var(--color-border, #2A2D3E)",
                padding: "0.875rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
                flexShrink: 0,
            }}
        >
            <p
                style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-muted, #8892A4)",
                    margin: 0,
                }}
            >
                © {new Date().getFullYear()} My App. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
                {["Privacy", "Terms", "Support"].map((link) => (
                    <a
                        key={link}
                        href="#"
                        style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-muted, #8892A4)",
                            textDecoration: "none",
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--color-text, #E8EDF5)"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--color-text-muted, #8892A4)"
                        }}
                    >
                        {link}
                    </a>
                ))}
            </div>
        </footer>
    )
}