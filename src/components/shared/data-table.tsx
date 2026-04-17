import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Copy,
    FileDown,
    FileSpreadsheet,
    Printer,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal,
    X,
    Loader2,
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { toast } from '../ui/sonner';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    icon?: React.ReactNode;
    width?: string;
}

export interface AdditionalButton {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    bg?: string;
    hover?: string;
    text?: string;
    disabled?: boolean;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    expandable?: boolean;
    renderExpandedRow?: (row: any) => React.ReactNode;
    renderActions?: (row: any) => React.ReactNode;
    rowsPerPageOptions?: number[];
    title?: string;
    loading?: boolean;
    additionalButtons?: AdditionalButton[];
    selectable?: boolean;
    onSelectionChange?: (selectedRows: any[]) => void;
    /** Optional fixed height (e.g. "400px", "30rem") – makes the table body scrollable */
    height?: string | number;
}

// ----------------------------------------------------------------------
// Helper: export to CSV / Excel / Print
// ----------------------------------------------------------------------

function exportToCSV(columns: Column[], data: any[], filename: string) {
    const csvRows = [
        columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(','),
        ...data.map(row =>
            columns.map(col => {
                const value = row[col.key] ?? '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportToExcel(columns: Column[], data: any[], filename: string) {
    const html = `
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${filename}</title>
        </head>
        <body>
            <table border="1">
                <thead>
                    <tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>${columns.map(col => `<td>${row[col.key] ?? ''}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportToPDF(columns: Column[], data: any[], title: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const styles = `
        <style>
            body { font-family: 'DM Sans', system-ui, sans-serif; padding: 20px; }
            h2 { color: var(--color-text, #E8EDF5); }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid var(--color-border, #2A2D3E); padding: 8px; text-align: left; font-size: 12px; }
            th { background: var(--color-surface-2, #202432); font-weight: bold; }
        </style>
    `;
    printWindow.document.write(`
        <html>
            <head><title>${title}</title>${styles}</head>
            <body>
                <h2>${title}</h2>
                <table>
                    <thead><tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>${columns.map(col => `<td>${row[col.key] ?? ''}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ----------------------------------------------------------------------
// Main DataTable Component
// ----------------------------------------------------------------------

export default function DataTable({
    columns,
    data,
    expandable = false,
    renderExpandedRow,
    renderActions,
    rowsPerPageOptions = [5, 10, 25, 50, 100],
    title = 'Data Table',
    loading = false,
    additionalButtons = [],
    selectable = false,
    onSelectionChange,
    height, // new prop
}: DataTableProps) {
    // ----- State -----
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[1] || 10);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // ----- Derived data -----
    const filteredData = useMemo(() => {
        let filtered = data.filter(row => {
            const matchesGlobal = searchTerm === '' || Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesColumns = Object.entries(columnFilters).every(([key, filterValue]) =>
                filterValue === '' || String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
            );
            return matchesGlobal && matchesColumns;
        });

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [data, searchTerm, columnFilters, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // ----- Handlers -----
    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const toggleRowExpand = (index: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const toggleRowSelection = (globalIndex: number) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(globalIndex)) newSet.delete(globalIndex);
            else newSet.add(globalIndex);
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        const pageGlobalIndices = paginatedData.map(row =>
            filteredData.findIndex(r => r === row)
        );
        const allSelected = pageGlobalIndices.every(idx => selectedRows.has(idx));
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (allSelected) {
                pageGlobalIndices.forEach(idx => newSet.delete(idx));
            } else {
                pageGlobalIndices.forEach(idx => newSet.add(idx));
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (onSelectionChange) {
            const selectedData = filteredData.filter((_, idx) => selectedRows.has(idx));
            onSelectionChange(selectedData);
        }
    }, [selectedRows, filteredData, onSelectionChange]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, columnFilters, rowsPerPage]);

    const handleCopy = () => {
        const text = [
            columns.map(c => c.label).join('\t'),
            ...filteredData.map(row => columns.map(c => row[c.key]).join('\t'))
        ].join('\n');
        navigator.clipboard.writeText(text);
        toast.info('Copied to clipboard!');
    };

    const handleCSV = () => exportToCSV(columns, filteredData, title);
    const handleExcel = () => exportToExcel(columns, filteredData, title);
    const handlePrint = () => exportToPDF(columns, filteredData, title);

    // ----- Render helpers -----
    const renderSortIcon = (col: Column) => {
        if (col.sortable === false) return null;
        const isActive = sortConfig?.key === col.key;
        return (
            <span style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 4 }}>
                <ChevronUp
                    size={12}
                    style={{ color: isActive && sortConfig.direction === 'asc' ? 'var(--color-accent, #4F6EF7)' : 'var(--color-text-faint, #4A5168)' }}
                />
                <ChevronDown
                    size={12}
                    style={{ marginTop: -4, color: isActive && sortConfig.direction === 'desc' ? 'var(--color-accent, #4F6EF7)' : 'var(--color-text-faint, #4A5168)' }}
                />
            </span>
        );
    };

    // ------------------------------------------------------------------
    // JSX
    // ------------------------------------------------------------------
    return (
        <div style={{
            position: 'relative',
            borderRadius: '0.75rem',
            background: 'var(--color-surface, #1A1D27)',
            border: `1px solid var(--color-border, #2A2D3E)`,
            overflow: 'hidden',
        }}>
            {/* Loading overlay */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}>
                    <Loader2 size={32} style={{ color: 'var(--color-accent, #4F6EF7)', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'var(--color-text, #E8EDF5)', fontFamily: 'var(--font-sans)' }}>Loading data...</p>
                </div>
            )}

            {/* Toolbar */}
            <div style={{ padding: '1rem', borderBottom: `1px solid var(--color-border, #2A2D3E)`, background: 'var(--color-surface-3, #202432)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text, #E8EDF5)', margin: 0 }}>{title}</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {additionalButtons.map((btn, i) => (
                            <button
                                key={i}
                                onClick={btn.onClick}
                                disabled={btn.disabled || loading}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    background: btn.bg || 'var(--color-surface, #1A1D27)',
                                    color: btn.text || 'var(--color-text, #E8EDF5)',
                                    border: `1px solid var(--color-border, #2A2D3E)`,
                                    cursor: btn.disabled ? 'not-allowed' : 'pointer',
                                    opacity: btn.disabled ? 0.5 : 1,
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { if (!btn.disabled && btn.hover) e.currentTarget.style.background = btn.hover; }}
                                onMouseLeave={e => { if (!btn.disabled && btn.bg) e.currentTarget.style.background = btn.bg; else if (!btn.disabled) e.currentTarget.style.background = 'var(--color-surface, #1A1D27)'; }}
                            >
                                {btn.icon}
                                <span>{btn.label}</span>
                            </button>
                        ))}
                        <button onClick={handleCopy} disabled={loading} style={toolbarButtonStyle}> <Copy size={16} /> <span>Copy</span> </button>
                        <button onClick={handleCSV} disabled={loading} style={{ ...toolbarButtonStyle, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}> <FileDown size={16} /> <span>CSV</span> </button>
                        <button onClick={handleExcel} disabled={loading} style={{ ...toolbarButtonStyle, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}> <FileSpreadsheet size={16} /> <span>Excel</span> </button>
                        <button onClick={handlePrint} disabled={loading} style={{ ...toolbarButtonStyle, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}> <Printer size={16} /> <span>Print</span> </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #8892A4)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.5rem 0.5rem 2rem',
                                background: 'var(--color-surface, #1A1D27)',
                                border: `1px solid var(--color-border, #2A2D3E)`,
                                borderRadius: '0.375rem',
                                color: 'var(--color-text, #E8EDF5)',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        disabled={loading}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            background: showFilters ? 'var(--color-accent, #4F6EF7)' : 'var(--color-surface, #1A1D27)',
                            color: showFilters ? '#fff' : 'var(--color-text, #E8EDF5)',
                            border: `1px solid var(--color-border, #2A2D3E)`,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                </div>

                {showFilters && (
                    <div style={{
                        marginTop: '1rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        borderTop: `1px solid var(--color-border, #2A2D3E)`,
                        paddingTop: '0.75rem',
                    }}>
                        {columns.filter(c => c.filterable !== false).map(col => (
                            <div key={col.key}>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4, color: 'var(--color-text-muted, #8892A4)' }}>{col.label}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder={`Filter ${col.label}...`}
                                        value={columnFilters[col.key] || ''}
                                        onChange={e => setColumnFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '0.375rem 1.5rem 0.375rem 0.5rem',
                                            background: 'var(--color-surface, #1A1D27)',
                                            border: `1px solid var(--color-border, #2A2D3E)`,
                                            borderRadius: '0.375rem',
                                            color: 'var(--color-text, #E8EDF5)',
                                            fontSize: '0.8125rem',
                                        }}
                                    />
                                    {columnFilters[col.key] && (
                                        <button
                                            onClick={() => setColumnFilters(prev => ({ ...prev, [col.key]: '' }))}
                                            style={{
                                                position: 'absolute',
                                                right: 6,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-text-muted, #8892A4)',
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Table wrapper with optional fixed height */}
            <div style={{
                overflowX: 'auto',
                ...(height ? { height: typeof height === 'number' ? `${height}px` : height, overflowY: 'auto' } : {})
            }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selectable && (
                                <TableHead style={{ width: 40, textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(filteredData.findIndex(r => r === row)))}
                                        onChange={toggleSelectAll}
                                        disabled={loading || paginatedData.length === 0}
                                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                                    />
                                </TableHead>
                            )}
                            {expandable && <TableHead style={{ width: 40 }} />}
                            {columns.map(col => (
                                <TableHead key={col.key} style={{ width: col.width }}>
                                    <button
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        disabled={loading}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            background: 'none',
                                            border: 'none',
                                            color: 'inherit',
                                            cursor: col.sortable !== false ? 'pointer' : 'default',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            padding: 0,
                                        }}
                                    >
                                        {col.icon && <span style={{ marginRight: 4 }}>{col.icon}</span>}
                                        {col.label}
                                        {col.sortable !== false && renderSortIcon(col)}
                                    </button>
                                </TableHead>
                            ))}
                            {renderActions && <TableHead style={{ width: 80 }}>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((row, idx) => {
                            const globalIndex = filteredData.findIndex(r => r === row);
                            const isExpanded = expandedRows.has(idx);
                            return (
                                <React.Fragment key={idx}>
                                    <TableRow style={{ background: selectedRows.has(globalIndex) ? 'rgba(79,110,247,0.1)' : undefined }}>
                                        {selectable && (
                                            <TableCell style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(globalIndex)}
                                                    onChange={() => toggleRowSelection(globalIndex)}
                                                    disabled={loading}
                                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                                />
                                            </TableCell>
                                        )}
                                        {expandable && (
                                            <TableCell>
                                                <button
                                                    onClick={() => toggleRowExpand(idx)}
                                                    disabled={loading}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted, #8892A4)' }}
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </TableCell>
                                        )}
                                        {columns.map(col => (
                                            <TableCell key={col.key}>
                                                {row[col.key]}
                                            </TableCell>
                                        ))}
                                        {renderActions && (
                                            <TableCell>
                                                <div style={{ display: 'flex', gap: 4 }}>{renderActions(row)}</div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                    {expandable && isExpanded && renderExpandedRow && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (renderActions ? 1 : 0) + (expandable ? 1 : 0)}>
                                                {renderExpandedRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile card view (hidden on desktop) */}
            <div style={{ display: 'none' }}>
                {paginatedData.map((row, idx) => {
                    const globalIndex = filteredData.findIndex(r => r === row);
                    const isExpanded = expandedRows.has(idx);
                    return (
                        <div key={idx} style={{ padding: '1rem', borderBottom: `1px solid var(--color-border, #2A2D3E)`, background: selectedRows.has(globalIndex) ? 'rgba(79,110,247,0.1)' : undefined }}>
                            {selectable && (
                                <div style={{ marginBottom: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(globalIndex)}
                                        onChange={() => toggleRowSelection(globalIndex)}
                                        disabled={loading}
                                        style={{ marginRight: 8 }}
                                    />
                                </div>
                            )}
                            {columns.map(col => (
                                <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid var(--color-border, #2A2D3E)` }}>
                                    <span style={{ fontWeight: 500, color: 'var(--color-text-muted, #8892A4)' }}>{col.label}:</span>
                                    <span style={{ color: 'var(--color-text, #E8EDF5)' }}>{row[col.key]}</span>
                                </div>
                            ))}
                            {renderActions && (
                                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>{renderActions(row)}</div>
                            )}
                            {expandable && (
                                <>
                                    <button onClick={() => toggleRowExpand(idx)} style={{ marginTop: 8, color: 'var(--color-accent, #4F6EF7)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {isExpanded ? 'Hide' : 'Show'} details
                                    </button>
                                    {isExpanded && renderExpandedRow && (
                                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid var(--color-border, #2A2D3E)` }}>
                                            {renderExpandedRow(row)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid var(--color-border, #2A2D3E)`, background: 'var(--color-surface-2, #202432)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--color-text-muted, #8892A4)' }}>
                    <span>Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={e => setRowsPerPage(Number(e.target.value))}
                        disabled={loading}
                        style={{
                            background: 'var(--color-surface, #1A1D27)',
                            border: `1px solid var(--color-border, #2A2D3E)`,
                            borderRadius: '0.375rem',
                            padding: '0.25rem 0.5rem',
                            color: 'var(--color-text, #E8EDF5)',
                        }}
                    >
                        {rowsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <span>
                        {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || loading} style={paginationButtonStyle}><ChevronsLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} style={paginationButtonStyle}><ChevronLeft size={16} /></button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(pageNum)}
                                disabled={loading}
                                style={{
                                    ...paginationButtonStyle,
                                    background: currentPage === pageNum ? 'var(--color-accent, #4F6EF7)' : 'var(--color-surface, #1A1D27)',
                                    color: currentPage === pageNum ? '#fff' : 'var(--color-text, #E8EDF5)',
                                }}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading} style={paginationButtonStyle}><ChevronRight size={16} /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || loading} style={paginationButtonStyle}><ChevronsRight size={16} /></button>
                </div>
            </div>

            {/* Inject keyframe for spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ----------------------------------------------------------------------
// Shared styles
// ----------------------------------------------------------------------
const toolbarButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    background: 'var(--color-surface, #1A1D27)',
    color: 'var(--color-text, #E8EDF5)',
    border: `1px solid var(--color-border, #2A2D3E)`,
    cursor: 'pointer',
    transition: 'background 0.15s',
};

const paginationButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: '0.375rem',
    background: 'var(--color-surface, #1A1D27)',
    border: `1px solid var(--color-border, #2A2D3E)`,
    color: 'var(--color-text, #E8EDF5)',
    cursor: 'pointer',
    transition: 'background 0.15s',
};