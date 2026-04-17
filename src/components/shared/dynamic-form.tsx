// components/ui/dynamic-form.tsx
import { useState, useMemo,	useCallback, ReactNode } from "react"
import { X, Plus, Edit,	Trash2,	ChevronRight } from	"lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button	} from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea }	from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox }	from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem	} from "@/components/ui/radio-group"
import { Select, SelectContent,	SelectItem,	SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DateSinglePicker }	from "@/components/shared/date-single-picker"
import { DateMultiplePicker	} from "@/components/shared/date-multiple-picker"
import { DateRangePicker } from	"@/components/shared/date-range-picker"
import type	{ MarkedDate } from	"@/components/ui/calendar"

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface FormField {
	name: string
	label: string
	type:
	| "text"
	| "email"
	| "password"
	| "number"
	| "url"
	| "tel"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio"
	| "file"
	| "date"
	| "date-multiple"
	| "date-range"
	| "datetime-local"
	| "time"
	| "month"
	| "week"
	| "custom"
	required?: boolean
	icon?: ReactNode
	placeholder?: string
	disabled?: boolean
	className?:	string
	validation?: (value: any) => string	| undefined
	options?: {	value: string; label: string }[]
	rows?: number
	accept?: string
	multiple?: boolean
	// Native date/time
	min?: string
	max?: string
	// Custom date picker props	(used for date,	date-multiple, date-range)
	minDate?: Date
	maxDate?: Date
	disableFuture?:	boolean
	markedDates?: MarkedDate[]
	locale?: string
	section?: string
	render?: (value: any, onChange:	(val: any) => void,	hasError: boolean) => ReactNode
}

export type	ActionType = "CREATE" |	"UPDATE" | "DELETE"

interface DynamicFormProps {
	isModal?: boolean
	isOpen?: boolean
	onClose?: () => void
	title?:	string
	fields:	FormField[]
	onSubmit?: (data: any) => void
	initialData?: any
	actionType?: ActionType
	submitButtonText?: string
	size?: "sm"	| "md" | "lg" |	"xl"
	className?:	string
}

// ----------------------------------------------------------------------
// Helper: format date/time	values for input fields
// ----------------------------------------------------------------------

function formatDateTimeValue(value:	any, type: string):	string {
	if (!value)	return ""
	try	{
		const date = new Date(value)
		if (isNaN(date.getTime())) return ""
		switch (type) {
			case "datetime-local": return date.toISOString().slice(0, 16)
			case "date": return	date.toISOString().split("T")[0]
			case "time": return	date.toISOString().slice(11, 16)
			case "month": return date.toISOString().slice(0, 7)
			default: return	value
		}
	} catch	{
		return ""
	}
}

// ----------------------------------------------------------------------
// FieldShell —	consistent outer wrapper for every field
// ----------------------------------------------------------------------

function FieldShell({
	field,
	hasError,
	errorMsg,
	children,
}: {
	field: FormField
	hasError: boolean
	errorMsg?: string
	children: ReactNode
}) {
	return (
		<div className={cn("group flex flex-col	gap-1.5", field.className)}>
			<div className="flex items-center gap-1.5">
				{field.icon	&& (
					<span className="text-muted-foreground">{field.icon}</span>
				)}
				<Label
				>
					{field.label}
					{field.required	&& (
						<span className="ml-1.5	inline-block h-1.5 w-1.5 rounded-full bg-accent	align-middle" />
					)}
				</Label>
			</div>
			{children}
			{hasError && errorMsg && (
				<p className="flex items-center	gap-1 text-[11px] text-destructive">
					<span className="inline-block h-1 w-1 rounded-full bg-destructive" />
					{errorMsg}
				</p>
			)}
		</div>
	)
}

// ----------------------------------------------------------------------
// Main	Component
// ----------------------------------------------------------------------

export function	DynamicForm({
	isModal	= true,
	isOpen = true,
	onClose,
	title =	"Form",
	fields,
	onSubmit,
	initialData	= {},
	actionType = "CREATE",
	submitButtonText,
	size = "md",
	className =	"",
}: DynamicFormProps) {
	const getEmptyData = () => {
		const empty: any = {}
		fields.forEach((f) => {
			if (f.type === "checkbox") empty[f.name] = false
			else if (f.type	===	"date-multiple") empty[f.name] = []
			else if (f.type	===	"date-range") empty[f.name]	= null
			else empty[f.name] = ""
		})
		return empty
	}

	const processInitialData = (data: any) => {
		const processed	= {	...data	}
		fields.forEach((field) => {
			if (["datetime-local", "time", "month",	"week"].includes(field.type)) {
				if (processed[field.name]) {
					processed[field.name] =	formatDateTimeValue(processed[field.name], field.type)
				}
			}
		})
		return processed
	}

	const initialFormData =	useMemo(() => {
		if (initialData	&& Object.keys(initialData).length > 0) {
			return processInitialData(initialData)
		}
		return getEmptyData()
	}, [initialData, fields])

	const [formData, setFormData] =	useState(initialFormData)
	const [errors, setErrors] =	useState<Record<string,	string>>({})

	const sizeWidth	= {
		sm:	"max-w-xl",
		md:	"max-w-3xl",
		lg:	"max-w-5xl",
		xl:	"max-w-7xl",
	}[size]

	const handleChange = useCallback((fieldName: string, value:	any) => {
		setFormData((prev: any)	=> ({ ...prev, [fieldName]:	value }))
		if (errors[fieldName]) {
			setErrors((prev) => ({ ...prev,	[fieldName]: "" }))
		}
	}, [errors])

	const validateForm = () => {
		const newErrors: Record<string,	string>	= {}
		fields.forEach((field) => {
			const val =	formData[field.name]
			const isEmpty =
				val	===	undefined ||
				val	===	null ||
				val	===	"" ||
				(Array.isArray(val)	&& val.length === 0)
			if (field.required && isEmpty) {
				newErrors[field.name] =	`${field.label}	is required`
			}
			if (field.validation && !isEmpty) {
				const err =	field.validation(val)
				if (err) newErrors[field.name] = err
			}
		})
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = () => {
		if (validateForm() && onSubmit)	{
			onSubmit(formData)
			if (isModal	&& onClose)	onClose()
		}
	}

	const handleClose =	() => {
		setFormData(initialFormData)
		setErrors({})
		if (onClose) onClose()
	}

	const actionConfig = {
		CREATE:	{ icon:	Plus, color: "var(--color-accent, #4F6EF7)", label:	"Create" },
		UPDATE:	{ icon:	Edit, color: "var(--color-accent, #4F6EF7)", label:	"Update" },
		DELETE:	{ icon:	Trash2,	color: "var(--color-error, #ef4444)", label: "Delete" },
	}
	const config = actionConfig[actionType]	|| actionConfig.CREATE
	const ActionIcon = config.icon
	const buttonText = submitButtonText	|| config.label

	// ----------------------------------------------------------------------
	// Field renderer
	// ----------------------------------------------------------------------
	const renderField =	(field:	FormField) => {
		const value	= formData[field.name] ?? (
			field.type === "checkbox" ?	false :
				field.type === "date-multiple" ? [] :
					field.type === "date-range"	? null : ""
		)
		const hasError = !!errors[field.name]
		const errorMsg = errors[field.name]

		const inputCls = cn(
			"h-9 bg-surface	border-border text-text	text-sm	transition-all",
			"placeholder:text-muted-foreground/50",
			"focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:border-accent/60",
			hasError && "border-destructive	focus-visible:ring-destructive/40 focus-visible:border-destructive"
		)

		switch (field.type)	{
			// ── Text-like	inputs ──────────────────────────────────────────
			case "text":
			case "email":
			case "password":
			case "number":
			case "url":
			case "tel":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<Input
							type={field.type}
							value={value}
							onChange={(e) => handleChange(field.name, e.target.value)}
							placeholder={field.placeholder}
							disabled={field.disabled}
							className={inputCls}
						/>
					</FieldShell>
				)

			// ── Textarea ──────────────────────────────────────────────────
			case "textarea":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<Textarea
							value={value}
							onChange={(e) => handleChange(field.name, e.target.value)}
							placeholder={field.placeholder}
							disabled={field.disabled}
							rows={field.rows || 4}
							className={cn(
								"bg-surface	border-border text-text	text-sm	transition-all",
								"placeholder:text-muted-foreground/50 resize-none",
								"focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:border-accent/60",
								hasError && "border-destructive	focus-visible:ring-destructive/40"
							)}
						/>
					</FieldShell>
				)

			// ── Select ────────────────────────────────────────────────────
			case "select":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<Select
							value={value || ""}
							onValueChange={(val) => handleChange(field.name, val)}
							disabled={field.disabled}
						>
							<SelectTrigger className={cn(inputCls, "w-full")}>
								<SelectValue placeholder={field.placeholder	|| "Select an option"} />
							</SelectTrigger>
							<SelectContent className="bg-surface border-border">
								{field.options?.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
										className="text-text text-sm focus:bg-surface-2"
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FieldShell>
				)

			// ── Checkbox ──────────────────────────────────────────────────
			case "checkbox":
				return (
					<div key={field.name} className={cn("flex items-start gap-3	py-1", field.className)}>
						<Checkbox
							id={field.name}
							checked={!!value}
							onCheckedChange={(checked) => handleChange(field.name, checked)}
							disabled={field.disabled}
							className={cn(
								"mt-0.5	border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent",
								hasError && "border-destructive"
							)}
						/>
						<div className="flex flex-col gap-0.5">
							<Label
								htmlFor={field.name}
								className="cursor-pointer text-xs text-text	leading-none"
							>
								{field.icon	&& <span className="mr-1 inline-block">{field.icon}</span>}
								{field.label}
								{field.required	&& (
									<span className="ml-1.5	inline-block h-1.5 w-1.5 rounded-full bg-accent	align-middle" />
								)}
							</Label>
							{hasError && errorMsg && (
								<p className="text-[11px] text-destructive">{errorMsg}</p>
							)}
						</div>
					</div>
				)

			// ── Radio	─────────────────────────────────────────────────────
			case "radio":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<RadioGroup
							value={value}
							onValueChange={(val) => handleChange(field.name, val)}
							disabled={field.disabled}
							className="flex	flex-wrap gap-x-5 gap-y-2 pt-0.5"
						>
							{field.options?.map((opt) => (
								<div key={opt.value} className="flex items-center gap-2">
									<RadioGroupItem
										value={opt.value}
										id={`${field.name}-${opt.value}`}
										className="border-border text-accent"
									/>
									<Label
										htmlFor={`${field.name}-${opt.value}`}
										className="cursor-pointer text-sm text-text"
									>
										{opt.label}
									</Label>
								</div>
							))}
						</RadioGroup>
					</FieldShell>
				)

			// ── File ──────────────────────────────────────────────────────
			case "file":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<Input
							type="file"
							onChange={(e) => handleChange(field.name, e.target.files?.[0])}
							disabled={field.disabled}
							accept={field.accept}
							multiple={field.multiple}
							className={cn(inputCls,	"cursor-pointer	file:mr-3 file:text-xs file	file:text-muted-foreground")}
						/>
						{value && typeof value === "string"	&& (
							<p className="text-[11px] text-muted-foreground">Current: {value}</p>
						)}
					</FieldShell>
				)

			// ── Native date /	time ─────────────────────────────────────────
			case "datetime-local":
			case "time":
			case "month":
			case "week":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<Input
							type={field.type}
							value={value}
							onChange={(e) => handleChange(field.name, e.target.value)}
							disabled={field.disabled}
							min={field.min}
							max={field.max}
							className={inputCls}
						/>
					</FieldShell>
				)

			// ── Single date picker ────────────────────────────────────────
			case "date":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<DateSinglePicker
							value={value instanceof	Date ? value : value ? new Date(value) : undefined}
							minDate={field.minDate}
							maxDate={field.maxDate}
							disableFuture={field.disableFuture}
							markedDates={field.markedDates}
							locale={field.locale}
							onChange={(date) => handleChange(field.name, date)}
						/>
					</FieldShell>
				)

			// ── Multiple date	picker ──────────────────────────────────────
			case "date-multiple":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<DateMultiplePicker
							value={Array.isArray(value)	? value	: []}
							minDate={field.minDate}
							maxDate={field.maxDate}
							disableFuture={field.disableFuture}
							markedDates={field.markedDates}
							locale={field.locale}
							onChange={(dates) => handleChange(field.name, dates)}
						/>
					</FieldShell>
				)

			// ── Range	date picker	─────────────────────────────────────────
			case "date-range":
				return (
					<FieldShell	key={field.name} field={field} hasError={hasError} errorMsg={errorMsg}>
						<DateRangePicker
							minDate={field.minDate}
							maxDate={field.maxDate}
							disableFuture={field.disableFuture}
							markedDates={field.markedDates}
							locale={field.locale}
							onRangeChange={(range) => handleChange(field.name, range)}
						/>
					</FieldShell>
				)

			// ── Custom ────────────────────────────────────────────────────
			case "custom":
				return field.render	? (
					<div key={field.name} className={cn(field.className)}>
						{field.render(value, (val) => handleChange(field.name, val), hasError)}
					</div>
				) :	null

			default:
				return null
		}
	}

	// Group fields	by section
	const fieldsBySection: Record<string, FormField[]> = {}
	const noSectionFields: FormField[] = []
	fields.forEach((f) => {
		if (f.section) {
			if (!fieldsBySection[f.section]) fieldsBySection[f.section]	= []
			fieldsBySection[f.section].push(f)
		} else {
			noSectionFields.push(f)
		}
	})

	// ----------------------------------------------------------------------
	// Form	shell
	// ----------------------------------------------------------------------
	const formContent =	(
		<div
			className={cn(
				"w-full	overflow-hidden	rounded-xl border border-border",
				"shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)]",
				className
			)}
			style={{
				background: "var(--color-surface-4)"
			}}
		>
			{/*	── Header ─────────────────────────────────────────────────	*/}
			<div className="relative flex items-center justify-between border-b	border-border bg-surface-2 px-6	py-5 overflow-hidden">
				{/*	Left accent	bar	*/}
				<span
					className="absolute	left-0 top-0 h-full	w-[3px]"
					style={{ background: config.color }}
				/>
				<div className="flex items-center gap-3	pl-1">
					<div
						className="flex	h-7	w-7	items-center justify-center	rounded-lg"
						style={{ background: `${config.color}20` }}
					>
						<ActionIcon	size={14} style={{ color: config.color }} />
					</div>
					<h2	className="text-base font-semibold text-text tracking-tight">{title}</h2>
				</div>
				{isModal && onClose	&& (
					<button
						onClick={handleClose}
						className="rounded-md p-1.5	text-muted-foreground transition-colors	hover:bg-surface hover:text-text"
					>
						<X size={16} />
					</button>
				)}
			</div>

			{/*	── Body	───────────────────────────────────────────────────	*/}
			<div className={cn("px-6 py-6",	isModal	&& "max-h-[60vh] overflow-y-auto")}>
				<div className="flex flex-col gap-8">
					{/*	Fields without a section */}
					{noSectionFields.length	> 0	&& (
						<div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
							{noSectionFields.map((f) => renderField(f))}
						</div>
					)}

					{/*	Sectioned field	groups */}
					{Object.entries(fieldsBySection).map(([sectionName,	sectionFields])	=> (
						<div
							key={sectionName}
							className="rounded-lg border border-border/60 bg-surface-2/40 p-4"
						>
							{/*	Section	header */}
							<div className="mb-4 flex items-center gap-2">
								<ChevronRight
									size={13}
									className="text-muted-foreground/60"
								/>
								<span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
									{sectionName}
								</span>
								<div className="ml-1 h-px flex-1 bg-border/60" />
							</div>

							<div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
								{sectionFields.map((f) => renderField(f))}
							</div>
						</div>
					))}
				</div>
			</div>

			{/*	── Footer ─────────────────────────────────────────────────	*/}
			<div className="flex items-center justify-end gap-2.5 border-t border-border bg-surface-2/60 px-6 py-4">
				{isModal && onClose	&& (
					<Button
						variant="outline"
						onClick={handleClose}
						className="h-8 border-border bg-transparent	text-muted-foreground text-xs hover:bg-surface hover:text-text"
					>
						Cancel
					</Button>
				)}
				<Button
					onClick={handleSubmit}
					className="h-8 gap-1.5 text-xs font-semibold text-white	shadow-sm hover:opacity-90 transition-opacity"
					style={{ background: config.color, borderColor:	config.color }}
				>
					<ActionIcon	size={13} />
					{buttonText}
				</Button>
			</div>
		</div>
	)

	if (!isModal) return isOpen	? formContent :	null
	if (!isOpen) return	null

	return (
		<Dialog	open={isOpen} onOpenChange={(open) => !open	&& handleClose()}>
			<DialogContent
				showCloseButton={false}
				className={cn("p-0", sizeWidth)}
				style={{ background: "transparent", border: "none", boxShadow: "none" }}
			>
				{formContent}
			</DialogContent>
		</Dialog>
	)
}