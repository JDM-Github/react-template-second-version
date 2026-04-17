// pages/root/component.tsx
import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import { Separator } from "@/components/ui/separator"
import { Combobox } from "@/components/shared/combobox"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { FileUploader } from "@/components/shared/file-uploader"
import DataTable from "@/components/shared/data-table"
import { Edit, Trash, FileText } from "lucide-react"
import { DateSinglePicker } from "@/components/shared/date-single-picker"
import { DateMultiplePicker } from "@/components/shared/date-multiple-picker"
import { DynamicForm, FormField } from "@/components/shared/dynamic-form"
import { Button } from "@/components/ui/button"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <Separator className="flex-1" />
            </div>
            {children}
        </div>
    )
}

// Sample data for combobox
const fruitOptions = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "date", label: "Date" },
    { value: "elderberry", label: "Elderberry" },
]

// Sample columns and data for DataTable
const columns = [
    { key: "name", label: "Name", sortable: true, filterable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", filterable: true },
]

const sampleData = [
    { name: "John Doe", email: "john@example.com", role: "Admin" },
    { name: "Jane Smith", email: "jane@example.com", role: "User" },
    { name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
]



export function ComponentShowcase() {
    const [comboboxValue, setComboboxValue] = useState("")
    const [formOpen, setFormOpen] = useState(false)

    const [singleDate, setSingleDate] = useState<Date | null>(null)
    const [multipleDates, setMultipleDates] = useState<Date[]>([])

    const demoFields: FormField[] = [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
        { name: "email", label: "Email", type: "email", required: true },
        {
            name: "role", label: "Role", type: "select", options: [
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
            ]
        },
        { name: "bio", label: "Bio", type: "textarea", rows: 3, section: "Details" },
        { name: "startDate", label: "Start Date", type: "date", section: "Details" },
        { name: "active", label: "Active", type: "checkbox", section: "Status" },
    ]

    return (
        <div className="flex-1 space-y-10 p-5">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Component Showcase</h2>
                <p className="text-muted-foreground mt-1">
                    All your custom components in one place.
                </p>
            </div>

            <Section title="Dynamic Form">
                <Button onClick={() => setFormOpen(true)}>Open Form (Modal)</Button>
                <DynamicForm
                    isOpen={formOpen}
                    onClose={() => setFormOpen(false)}
                    title="User Form"
                    fields={demoFields}
                    onSubmit={(data) => {
                        console.log(data)
                        toast.success("Form submitted!")
                    }}
                    actionType="CREATE"
                />

                <DynamicForm
                    isModal={false}
                    title="Inline Form"
                    fields={demoFields}
                    onSubmit={(data) => toast.success(JSON.stringify(data))}
                    actionType="UPDATE"
                />
            </Section>

            {/* SINGLE DATE PICKER */}
            <Section title="Single Date Picker">
                <div className="max-w-sm">
                    <DateSinglePicker
                        value={singleDate ?? undefined}
                        onChange={(date) => {
                            setSingleDate(date)
                            toast.info(date ? date.toLocaleDateString() : "Cleared")
                        }}
                        disableFuture={true}
                    />
                </div>
            </Section>

            {/* MULTIPLE DATE PICKER */}
            <Section title="Multiple Date Picker">
                <div className="max-w-sm">
                    <DateMultiplePicker
                        value={multipleDates}
                        onChange={(dates) => {
                            setMultipleDates(dates)
                            toast.info(`${dates.length} date(s) selected`)
                        }}
                    />
                </div>
            </Section>

            {/* DATE RANGE PICKER */}
            <Section title="Date Range Picker">
                <div className="max-w-sm">
                    <DateRangePicker
                        onRangeChange={(range) => {
                            toast.info(
                                `From ${range!.from?.toLocaleDateString()} to ${range!.to?.toLocaleDateString()}`
                            )
                        }}
                    />
                </div>
            </Section>

            {/* Combobox */}
            <Section title="Combobox (Searchable Select)">
                <div className="max-w-sm">
                    <Combobox
                        options={fruitOptions}
                        value={comboboxValue}
                        onChange={setComboboxValue}
                        placeholder="Pick a fruit..."
                    />
                    {comboboxValue && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Selected: {fruitOptions.find(o => o.value === comboboxValue)?.label}
                        </p>
                    )}
                </div>
            </Section>

            {/* File Uploader */}
            <Section title="File Uploader">
                <FileUploader
                    maxSize={5}
                    accept="image/*,application/pdf"
                    onUpload={(files) => {
                        console.log("Uploaded files:", files)
                        toast.success(`${files.length} file(s) uploaded`)
                    }}
                />
            </Section>

            {/* Data Table */}
            <Section title="Data Table">
                <DataTable
                    columns={columns}
                    data={sampleData}
                    title="Users"
                    selectable
                    onSelectionChange={(selected) => console.log("Selected:", selected)}
                    expandable
                    height="300px"
                    renderExpandedRow={(row) => (
                        <div className="p-4 bg-muted/50 rounded">
                            Extra details for {row.name} – you can put anything here.
                        </div>
                    )}
                    renderActions={(row) => (
                        <div className="flex gap-2">
                            <button onClick={() => toast.info(`Edit ${row.name}`)}>
                                <Edit size={16} />
                            </button>
                            <button onClick={() => toast.error(`Delete ${row.name}`)}>
                                <Trash size={16} />
                            </button>
                        </div>
                    )}
                    additionalButtons={[
                        {
                            label: "Custom",
                            icon: <FileText size={16} />,
                            onClick: () => toast.info("Custom action"),
                        },
                    ]}
                    loading={false}
                />
            </Section>
        </div>
    )
}