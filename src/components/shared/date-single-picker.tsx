import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, CalendarRange, MarkedDate } from "@/components/ui/calendar"

interface DateSinglePickerProps {
    value?: Date
    minDate?: Date
    maxDate?: Date
    disableFuture?: boolean
    markedDates?: MarkedDate[]
    className?: string
    locale?: string
    onChange?: (date: Date | null) => void
}

export function DateSinglePicker({ value, minDate, maxDate, disableFuture, markedDates, className, locale, onChange }: DateSinglePickerProps) {
    const [date, setDate] = useState<Date | undefined>(value)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setDate(value)
    }, [value])

    const handleSelect = (
        selected: Date | Date[] | CalendarRange | null
    ) => {
        if (!selected || Array.isArray(selected)) return
        if ("from" in selected) return
        setDate(selected)
        onChange?.(selected)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""
                        }`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString() : "Pick a date"}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[340px]" style={{background: "transparent", border: "none", boxShadow: "none"}}>
                <Calendar
                    mode="single"
                    selected={date}
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