// components/shared/date-range-picker.tsx
import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, CalendarRange, MarkedDate } from "@/components/ui/calendar"

interface DateRangePickerProps {
    minDate?: Date
    maxDate?: Date
    disableFuture?: boolean
    markedDates?: MarkedDate[]
    className?: string
    locale?: string
    onRangeChange?: (range: CalendarRange | null) => void
}

export function DateRangePicker({ minDate, maxDate, disableFuture, markedDates, className, locale, onRangeChange }: DateRangePickerProps) {
    const [range, setRange] = useState<CalendarRange | null>(null)

    const handleRangeSelect = (value: CalendarRange | Date | Date[] | null) => {
        if (!value || Array.isArray(value) || value instanceof Date) return

        setRange(value)
        onRangeChange?.(value)
    }

    const formatRange = () => {
        if (!range?.from) return "Pick a date range"

        if (!range.to) {
            return range.from.toLocaleDateString()
        }

        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatRange()}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[340px]" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                <Calendar
                    mode="range"
                    selected={range ?? undefined}
                    onSelect={handleRangeSelect}
                    minDate={minDate}
                    maxDate={maxDate}
                    disableFuture={disableFuture}
                    markedDates={markedDates}
                    className={className}
                    locale={locale}
                />
            </PopoverContent>
        </Popover>
    )
}