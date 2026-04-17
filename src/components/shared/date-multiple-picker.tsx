// components/shared/date-picker-multiple.tsx
import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, CalendarRange, MarkedDate } from "@/components/ui/calendar"

interface DateMultiplePickerProps {
    value?: Date[]
    minDate?: Date
    maxDate?: Date  
    disableFuture?: boolean
    markedDates?: MarkedDate[]
    className?: string
    locale?: string
    onChange?: (dates: Date[]) => void
}

export function DateMultiplePicker({ value = [], minDate, maxDate, disableFuture, markedDates, className, locale, onChange }: DateMultiplePickerProps) {
    const [dates, setDates] = useState<Date[]>(value)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setDates(value)
    }, [value])

    const handleSelect = (selected: Date | Date[] | CalendarRange | null) => {
        if (!selected) return
        if (Array.isArray(selected)) {
            setDates(selected)
            onChange?.(selected)
        }
    }

    const formatLabel = () => {
        if (dates.length === 0) return "Pick dates"
        if (dates.length === 1) return dates[0].toLocaleDateString()
        return `${dates.length} dates selected`
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${dates.length === 0 ? "text-muted-foreground" : ""
                        }`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatLabel()}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[340px]" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                <Calendar
                    mode="multiple"
                    selected={dates}
                    onSelect={handleSelect}
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