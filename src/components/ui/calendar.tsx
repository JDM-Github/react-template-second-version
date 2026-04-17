// components/ui/calendar.tsx
import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarMode = "single" | "multiple" | "range"
export type CalendarRange = { from: Date; to: Date | null }

export interface MarkedDate {
    date: Date
    type?: "holiday" | "event" | "reminder" | "custom"
    label?: string
    color?: string
}

interface CalendarProps {
    selected?: Date | Date[] | CalendarRange
    onSelect?: (date: Date | Date[] | CalendarRange | null) => void
    mode?: CalendarMode
    minDate?: Date
    maxDate?: Date
    disableFuture?: boolean
    markedDates?: MarkedDate[]
    className?: string
    locale?: string
}

// ─── Type Guards ──────────────────────────────────────────────────────────────
function isRange(value: unknown): value is CalendarRange {
    return (
        typeof value === "object" &&
        value !== null &&
        "from" in value
    )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return {
        daysInMonth: lastDay.getDate(),
        startWeekday: firstDay.getDay(),
    }
}

function isSameDay(d1: Date, d2: Date) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    )
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

// ─── Component ────────────────────────────────────────────────────────────────
export function Calendar({
    selected,
    onSelect,
    mode = "single",
    minDate,
    maxDate,
    disableFuture = false,
    markedDates = [],
    className,
    locale = "en-PH",
}: CalendarProps) {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const { daysInMonth, startWeekday } = getMonthDays(year, month)

    // ── Navigation ──────────────────────────────────────────────────────────────
    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

    // ── Constraints ─────────────────────────────────────────────────────────────
    const isDisabled = useCallback(
        (date: Date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            if (disableFuture && date > today) return true
            return false
        },
        [minDate, maxDate, disableFuture, today]
    )

    const getMarked = useCallback(
        (date: Date) => markedDates.find((m) => isSameDay(m.date, date)),
        [markedDates]
    )

    // ── Click handler ───────────────────────────────────────────────────────────
    const handleDateClick = useCallback(
        (day: number) => {
            const clicked = new Date(year, month, day)
            if (isDisabled(clicked)) return

            if (mode === "single") {
                onSelect?.(clicked)
                return
            }

            if (mode === "multiple") {
                const current = (selected as Date[]) ?? []
                const exists = current.some((d) => isSameDay(d, clicked))
                onSelect?.(
                    exists
                        ? current.filter((d) => !isSameDay(d, clicked))
                        : [...current, clicked]
                )
                return
            }

            if (mode === "range") {
                const range = isRange(selected) ? selected : null

                // If no range started yet, or range is already complete → start fresh
                if (!range || range.to !== null) {
                    onSelect?.({ from: clicked, to: null })
                } else {
                    // range.to is null → user is picking the end date
                    const from = range.from
                    onSelect?.(
                        clicked < from
                            ? { from: clicked, to: from }
                            : { from, to: clicked }
                    )
                }
            }
        },
        [year, month, mode, selected, onSelect, isDisabled]
    )

    // ── Selection state helpers ─────────────────────────────────────────────────
    const isSelected = useCallback(
        (date: Date) => {
            if (mode === "single") return selected ? isSameDay(selected as Date, date) : false
            if (mode === "multiple") return (selected as Date[])?.some((d) => isSameDay(d, date)) ?? false
            return false
        },
        [mode, selected]
    )

    const isRangeStart = useCallback(
        (date: Date) => mode === "range" && isRange(selected) ? isSameDay(selected.from, date) : false,
        [mode, selected]
    )

    const isRangeEnd = useCallback(
        (date: Date) => {
            if (mode !== "range" || !isRange(selected) || !selected.to) return false
            return isSameDay(selected.to, date)
        },
        [mode, selected]
    )

    const isInRange = useCallback(
        (date: Date) => {
            if (mode !== "range" || !isRange(selected) || !selected.to) return false
            return date > selected.from && date < selected.to
        },
        [mode, selected]
    )

    // ── Hover preview (while picking end date) ──────────────────────────────────
    const isPreviewInRange = useCallback(
        (date: Date) => {
            if (mode !== "range" || !isRange(selected) || selected.to !== null || !hoveredDate) return false
            const from = selected.from
            const to = hoveredDate
            return to > from ? date > from && date < to : date > to && date < from
        },
        [mode, selected, hoveredDate]
    )

    const isPreviewEnd = useCallback(
        (date: Date) => {
            if (mode !== "range" || !isRange(selected) || selected.to !== null || !hoveredDate) return false
            return isSameDay(hoveredDate, date)
        },
        [mode, selected, hoveredDate]
    )

    // ── Build grid ──────────────────────────────────────────────────────────────
    const cells: (number | null)[] = [
        ...Array(startWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (cells.length < 42) cells.push(null)

    const isSelecting = mode === "range" && isRange(selected) && selected.to === null

    return (
        <div
            className={cn(className)}
            style={{
                width: "100%",
                maxWidth: "300px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                padding: "16px",
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                boxSizing: "border-box",
            }}
        >
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "14px", gap: "8px" }}>
                <NavButton onClick={prevMonth} dir="left" />
                <span style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text)",
                }}>
                    {locale
                        ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(currentMonth)
                        : `${MONTH_NAMES[month]} ${year}`
                    }
                </span>
                <NavButton onClick={nextMonth} dir="right" />
            </div>

            {/* ── Weekday row ─────────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
                {WEEKDAYS.map((d) => (
                    <div key={d} style={{
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "var(--color-text-faint)",
                        padding: "4px 0",
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* ── Day grid ────────────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
                {cells.map((cell, idx) => {
                    if (cell === null) return <div key={`e-${idx}`} />

                    const date = new Date(year, month, cell)
                    const disabled = isDisabled(date)
                    const sel = isSelected(date)
                    const start = isRangeStart(date)
                    const end = isRangeEnd(date)
                    const inRange = isInRange(date)
                    const previewIn = isPreviewInRange(date)
                    const previewEnd = isPreviewEnd(date)
                    const marked = getMarked(date)
                    const isToday = isSameDay(date, today)
                    const highlight = sel || start || end || previewEnd

                    // ── Cell background & shape ─────────────────────────────────
                    let wrapBg = "transparent"
                    let wrapRadius = "6px"

                    if (mode === "range") {
                        if (inRange || previewIn) {
                            wrapBg = "var(--color-accent)1a" // accent at ~10% opacity
                            wrapRadius = "0"
                        }
                        if (start && (end || previewEnd)) {
                            // both endpoints visible → full pill on start side
                            wrapRadius = "6px 0 0 6px"
                            wrapBg = "var(--color-accent)1a"
                        }
                        if (!end && !previewEnd && start) {
                            // only start picked, no range yet
                            wrapBg = "transparent"
                            wrapRadius = "6px"
                        }
                        if (end || previewEnd) {
                            wrapRadius = inRange || previewIn ? "0 6px 6px 0" : "6px"
                            wrapBg = inRange || previewIn ? "var(--color-accent)1a" : "transparent"
                        }
                    }

                    let btnBg = "transparent"

                    if (start) {
                        btnBg = "var(--color-success)"
                    } else if (end) {
                        btnBg = "var(--color-info)"
                    } else if (highlight) {
                        btnBg = "var(--color-accent)"
                    }

                    return (
                        <div
                            key={`${cell}-${idx}`}
                            style={{
                                position: "relative",
                                borderRadius: wrapRadius,
                                background: wrapBg,
                            }}
                        >
                            <button
                                onClick={() => handleDateClick(cell)}
                                disabled={disabled}
                                aria-label={date.toDateString()}
                                aria-pressed={highlight}
                                style={{
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "13px",
                                    fontWeight: highlight ? 600 : 400,
                                    color: highlight
                                        ? "#fff"
                                        : disabled
                                            ? "var(--color-text-faint)"
                                            : isToday
                                                ? "var(--color-accent)"
                                                : "var(--color-text)",
                                    background: btnBg,
                                    borderRadius: "6px",
                                    border: isToday && !highlight
                                        ? "1px solid var(--color-accent)60"
                                        : "none",
                                    cursor: disabled ? "not-allowed" : "pointer",
                                    opacity: disabled ? 0.35 : 1,
                                    position: "relative",
                                    transition: "background 0.12s, color 0.12s",
                                    outline: "none",
                                    padding: 0,
                                }}
                                onMouseEnter={(e) => {
                                    if (!highlight && !disabled) {
                                        e.currentTarget.style.background = "var(--color-surface-2)"
                                    }
                                    setHoveredDate(date)
                                }}
                                onMouseLeave={(e) => {
                                    if (!highlight) {
                                        e.currentTarget.style.background = "transparent"
                                    }
                                    setHoveredDate(null)
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-accent)60"
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            >
                                {cell}
                                {marked && (
                                    <>
                                        <span style={{
                                            position: "absolute",
                                            bottom: "3px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "3px",
                                            height: "3px",
                                            borderRadius: "50%",
                                            background: highlight
                                                ? "rgba(255,255,255,0.7)"
                                                : marked.color ?? (
                                                    marked.type === "holiday"
                                                        ? "var(--color-error)"
                                                        : "var(--color-warning)"
                                                ),
                                        }} />

                                        {hoveredDate && isSameDay(hoveredDate, date) && marked.label && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: "110%",
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    background: "var(--color-surface-2)",
                                                    color: "var(--color-text)",
                                                    fontSize: "10px",
                                                    padding: "4px 6px",
                                                    borderRadius: "4px",
                                                    whiteSpace: "nowrap",
                                                    border: "1px solid var(--color-border)",
                                                    pointerEvents: "none",
                                                    zIndex: 20,
                                                }}
                                            >
                                                {marked.label}
                                            </div>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* ── Range hint ──────────────────────────────────────────────────────── */}
            {mode === "range" && (
                <p style={{
                    marginTop: "10px",
                    fontSize: "11px",
                    textAlign: "center",
                    color: "var(--color-text-faint)",
                }}>
                    {isSelecting ? "Now click an end date" : "Click a start date"}
                </p>
            )}
        </div>
    )
}

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({ onClick, dir }: { onClick: () => void; dir: "left" | "right" }) {
    return (
        <button
            onClick={onClick}
            aria-label={dir === "left" ? "Previous month" : "Next month"}
            style={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                flexShrink: 0,
                transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-2)"
                e.currentTarget.style.color = "var(--color-text)"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "none"
                e.currentTarget.style.color = "var(--color-text-muted)"
            }}
        >
            {dir === "left" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
    )
}