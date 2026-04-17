import * as React from "react"

// ─── Table ───────────────────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ style, children, ...props }, ref) => (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table
        ref={ref}
        data-slot="table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
          fontSize: "0.875rem",
          color: "var(--color-text, #E8EDF5)",
          ...style,
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ style, children, ...props }, ref) => (
    <thead
      ref={ref}
      data-slot="table-header"
      style={{
        background: "var(--color-surface-2, #202432)",
        borderBottom: "1px solid var(--color-border, #2A2D3E)",
        ...style,
      }}
      {...props}
    >
      {children}
    </thead>
  )
)
TableHeader.displayName = "TableHeader"

// ─── TableBody ───────────────────────────────────────────────────────────────

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ style, children, ...props }, ref) => (
    <tbody ref={ref} data-slot="table-body" style={style} {...props}>
      {children}
    </tbody>
  )
)
TableBody.displayName = "TableBody"

// ─── TableRow ────────────────────────────────────────────────────────────────

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ style, children, ...props }, ref) => {
    const [hov, setHov] = React.useState(false)

    return (
      <tr
        ref={ref}
        data-slot="table-row"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderBottom: "1px solid var(--color-border, #2A2D3E)",
          background: hov ? "var(--color-surface-2, #202432)" : "transparent",
          transition: "background 0.12s",
          ...style,
        }}
        {...props}
      >
        {children}
      </tr>
    )
  }
)
TableRow.displayName = "TableRow"

// ─── TableHead ───────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ style, children, ...props }, ref) => (
    <th
      ref={ref}
      data-slot="table-head"
      style={{
        padding: "0.75rem 1rem",
        textAlign: "left",
        fontWeight: 600,
        fontSize: "0.75rem",
        color: "var(--color-text-muted, #8892A4)",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {children}
    </th>
  )
)
TableHead.displayName = "TableHead"

// ─── TableCell ───────────────────────────────────────────────────────────────

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ style, children, ...props }, ref) => (
    <td
      ref={ref}
      data-slot="table-cell"
      style={{
        padding: "0.75rem 1rem",
        color: "var(--color-text, #E8EDF5)",
        verticalAlign: "middle",
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  )
)
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }