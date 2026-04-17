import { useEffect, useState } from "react"
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import {
	AlertCircle,
	Bold,
	ChevronDown,
	Italic,
	Terminal,
	Underline,
	User,
	Mail,
	Settings,
	LogOut,
	Star,
	CalendarIcon,
	SmileIcon,
	CalculatorIcon,
	UserIcon,
	BanIcon,
	ClockIcon,
	PlusIcon,
	SearchIcon,
	Command as CommandIcon,
} from "lucide-react"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandDialog, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubTrigger,
	ContextMenuSubContent,
	ContextMenuSeparator,
	ContextMenuShortcut,
} from "@/components/ui/context-menu"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupButton,
} from "@/components/ui/input-group"

import {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarItem,
	MenubarCheckboxItem,
	MenubarRadioItem,
	MenubarLabel,
	MenubarSeparator,
	MenubarShortcut,
	MenubarGroup,
	MenubarSub,
	MenubarSubTrigger,
	MenubarSubContent,
} from "@/components/ui/menubar"
import { DashboardData, fetchDashboard, fetchDashboardRaw } from "@/api/root/get-dashboard";

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

// ── Table sample data ────────────────────────────────────────────────────────
const tableData = [
	{ name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
	{ name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active" },
	{ name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive" },
	{ name: "David Lee", email: "david@example.com", role: "Editor", status: "Active" },
]

import { Calendar, CalendarRange, MarkedDate } from "@/components/ui/calendar";


function MenubarDemo() {
	const [showLineNumbers, setShowLineNumbers] = useState(false)
	const [editorTheme, setEditorTheme] = useState("dark")
	const [wrapText, setWrapText] = useState(true)

	return (
		<Section title="Menubar">
			<Menubar>
				{/* File Menu */}
				<MenubarMenu>
					<MenubarTrigger>File</MenubarTrigger>
					<MenubarContent>
						<MenubarItem onSelect={() => console.log("New file")}>
							New File
							<MenubarShortcut>⌘N</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onSelect={() => console.log("Open")}>
							Open…
							<MenubarShortcut>⌘O</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarSub>
							<MenubarSubTrigger>Open Recent</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarItem>src/app.tsx</MenubarItem>
								<MenubarItem>src/components/ui/button.tsx</MenubarItem>
								<MenubarItem>README.md</MenubarItem>
								<MenubarSeparator />
								<MenubarItem>Clear Recent</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
						<MenubarSeparator />
						<MenubarItem onSelect={() => console.log("Save")}>
							Save
							<MenubarShortcut>⌘S</MenubarShortcut>
						</MenubarItem>
						<MenubarItem variant="destructive" onSelect={() => console.log("Delete")}>
							Delete
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* Edit Menu */}
				<MenubarMenu>
					<MenubarTrigger>Edit</MenubarTrigger>
					<MenubarContent>
						<MenubarItem disabled>Undo</MenubarItem>
						<MenubarItem disabled>Redo</MenubarItem>
						<MenubarSeparator />
						<MenubarItem onSelect={() => console.log("Cut")}>
							Cut
							<MenubarShortcut>⌘X</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onSelect={() => console.log("Copy")}>
							Copy
							<MenubarShortcut>⌘C</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onSelect={() => console.log("Paste")}>
							Paste
							<MenubarShortcut>⌘V</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* View Menu – with checkboxes & radio group */}
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarLabel inset>Editor</MenubarLabel>
						<MenubarCheckboxItem checked={wrapText} onCheckedChange={setWrapText}>
							Wrap text
						</MenubarCheckboxItem>
						<MenubarCheckboxItem checked={showLineNumbers} onCheckedChange={setShowLineNumbers}>
							Show line numbers
						</MenubarCheckboxItem>
						<MenubarSeparator />
						<MenubarLabel inset>Theme</MenubarLabel>
						<MenubarGroup>
							<MenubarRadioItem
								value="light"
								groupValue={editorTheme}
								onGroupChange={setEditorTheme}
							>
								Light
							</MenubarRadioItem>
							<MenubarRadioItem
								value="dark"
								groupValue={editorTheme}
								onGroupChange={setEditorTheme}
							>
								Dark
								<MenubarShortcut>⌘D</MenubarShortcut>
							</MenubarRadioItem>
							<MenubarRadioItem
								value="system"
								groupValue={editorTheme}
								onGroupChange={setEditorTheme}
							>
								System
							</MenubarRadioItem>
						</MenubarGroup>
						<MenubarSeparator />
						<MenubarSub>
							<MenubarSubTrigger>Zoom</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarItem onSelect={() => console.log("Zoom in")}>Zoom In</MenubarItem>
								<MenubarItem onSelect={() => console.log("Zoom out")}>Zoom Out</MenubarItem>
								<MenubarItem onSelect={() => console.log("Reset zoom")}>Reset</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
					</MenubarContent>
				</MenubarMenu>

				{/* Help Menu – with only a label and item */}
				<MenubarMenu>
					<MenubarTrigger>Help</MenubarTrigger>
					<MenubarContent>
						<MenubarLabel>Documentation</MenubarLabel>
						<MenubarItem onSelect={() => window.open("https://example.com")}>
							Getting Started
						</MenubarItem>
						<MenubarItem onSelect={() => console.log("Keyboard shortcuts")}>
							Keyboard Shortcuts
							<MenubarShortcut>⌘/</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem onSelect={() => console.log("About")}>About</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>

			{/* Optional: display current state to see checkbox/radio changes */}
			<div className="mt-4 text-sm text-text-muted">
				<p>Wrap text: {wrapText ? "ON" : "OFF"}</p>
				<p>Show line numbers: {showLineNumbers ? "ON" : "OFF"}</p>
				<p>Editor theme: {editorTheme}</p>
			</div>
		</Section>
	)
}

// ── Main Component ───────────────────────────────────────────────────────────
export function Dashboard() {
	const [sliderValue, setSliderValue] = useState([40])
	const [switchOn, setSwitchOn] = useState(false)
	const [progressValue] = useState(68)
	const [commandOpen, setCommandOpen] = useState(false);

	const [date, setDate] = useState<Date>()
	const [dates, setDates] = useState<Date[]>([])
	const [range, setRange] = useState<CalendarRange>()

	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	const handleRefresh = () => {
		setLoading(true);
		fetchDashboard()
			.then((data) => setDashboardData(data))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchDashboardRaw()
			.then((data) => setDashboardData(data))
			.catch((err) => console.error(err))
			.finally(() => setLoading(false));
	}, []);

	const markedDates: MarkedDate[] = [
		{ date: new Date(2026, 4, 5), type: "holiday", label: "Public Holiday" },
		{ date: new Date(2026, 4, 10), type: "event", label: "Meeting" },
		{ date: new Date(2026, 4, 15), type: "reminder", label: "Deadline" },
		{ date: new Date(2026, 4, 20), type: "custom", label: "Special", color: "#8b5cf6" },
	]

	return (<>
		<div className="flex-1 space-y-10 p-5">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Component Showcase</h2>
				<p className="text-muted-foreground mt-1">
					All your custom components in one place.
				</p>
			</div>

			{/* ── BUTTONS ─────────────────────────────────────────────────── */}
			<Section title="Button">
				<div className="flex flex-wrap gap-3">
					<Button variant="default">Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
					<Button disabled>Disabled</Button>
					<Button size="sm">Small</Button>
					<Button size="lg">Large</Button>
					<Button size="icon"><Star className="h-4 w-4" /></Button>
				</div>
			</Section>

			{/* ── BADGES ──────────────────────────────────────────────────── */}
			<Section title="Badge">
				<div className="flex flex-wrap gap-3">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="destructive">Destructive</Badge>
				</div>
			</Section>

			{/* ── ALERTS ──────────────────────────────────────────────────── */}
			<Section title="Alert">
				<div className="space-y-3">
					<Alert>
						<Terminal className="h-4 w-4" />
						<AlertTitle>Default Alert</AlertTitle>
						<AlertDescription>This is a default informational alert message.</AlertDescription>
					</Alert>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Destructive Alert</AlertTitle>
						<AlertDescription>Something went wrong. Please try again later.</AlertDescription>
					</Alert>
				</div>
			</Section>

			<MenubarDemo />

			{/* ── CARDS ───────────────────────────────────────────────────── */}
			<Section title="Card">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Basic Card</CardTitle>
							<CardDescription>A simple card with a description.</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Content goes here.</p>
						</CardContent>
						<CardFooter>
							<Button size="sm" className="w-full">Action</Button>
						</CardFooter>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Revenue</CardTitle>
							<CardDescription>Monthly performance</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-3xl font-bold">$12,450</p>
							<Progress value={progressValue} />
							<p className="text-xs text-muted-foreground">{progressValue}% of monthly goal</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Notifications</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{["New comment", "File uploaded", "Task complete"].map((n) => (
								<div key={n} className="flex items-center gap-2 text-sm">
									<span className="h-2 w-2 rounded-full bg-primary" />
									{n}
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</Section>

			<Section title="Context Menu">
				<ContextMenu>
					<ContextMenuTrigger asChild>
						<div className="h-48 w-full rounded-lg border-2 border-dashed border-border flex items-center justify-center">
							Right click here
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem onSelect={() => console.log("New tab")}>
							New Tab
							<ContextMenuShortcut>⌘T</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem disabled>New Window</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuSub>
							<ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<ContextMenuItem>Developer Tools</ContextMenuItem>
								<ContextMenuItem>Task Manager</ContextMenuItem>
							</ContextMenuSubContent>
						</ContextMenuSub>
						<ContextMenuItem variant="destructive">Delete</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			</Section>

			{/* ── INPUTS ──────────────────────────────────────────────────── */}
			<Section title="Input / Label / Textarea">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="you@example.com" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" placeholder="••••••••" />
					</div>
					<div className="space-y-2 sm:col-span-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea id="bio" placeholder="Tell us about yourself…" rows={3} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="disabled">Disabled</Label>
						<Input id="disabled" disabled placeholder="Not editable" />
					</div>
				</div>
			</Section>

			<Section title="Input Group">
				<InputGroup>
					<InputGroupAddon align="start">@</InputGroupAddon>
					<InputGroupInput placeholder="Username" />
				</InputGroup>

				<InputGroup>
					<InputGroupInput placeholder="Search" />
					<InputGroupAddon align="end">
						<InputGroupButton>Search</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>

				<InputGroup error>
					<InputGroupInput placeholder="Invalid field" />
				</InputGroup>

				<InputGroup disabled>
					<InputGroupInput value="Disabled" />
				</InputGroup>

				<InputGroup>
					<InputGroupAddon align="start">
						<SearchIcon size={14} />
					</InputGroupAddon>
					<InputGroupInput placeholder="Type..." />
				</InputGroup>
			</Section>

			<Section title="Hover Card">
				<HoverCard openDelay={200} closeDelay={100}>
					<HoverCardTrigger asChild>
						<button className="rounded-md border border-border px-3 py-1.5 text-sm">
							Hover me
						</button>
					</HoverCardTrigger>
					<HoverCardContent side="bottom" align="center" sideOffset={8}>
						<div className="space-y-1">
							<h4 className="text-sm font-semibold">@username</h4>
							<p className="text-xs text-text-muted">This is a custom hover card.</p>
						</div>
					</HoverCardContent>
				</HoverCard>
			</Section>

			{/* ── SELECT ──────────────────────────────────────────────────── */}
			<Section title="Select">
				<div className="flex flex-wrap gap-4">
					<Select>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Pick a fruit" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="apple">Apple</SelectItem>
							<SelectItem value="banana">Banana</SelectItem>
							<SelectItem value="mango">Mango</SelectItem>
							<SelectItem value="grape">Grape</SelectItem>
						</SelectContent>
					</Select>
					<Select disabled>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Disabled" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="x">X</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</Section>

			<Section title="Test API">
				{loading && <Skeleton className="h-24 w-full" />}
				{!loading && dashboardData && (
					<Card>
						<CardHeader>
							<CardTitle>{dashboardData.message}</CardTitle>
						</CardHeader>
						<CardContent>
							<pre>{JSON.stringify(dashboardData.data, null, 2)}</pre>
						</CardContent>
						<CardFooter>
							<Button onClick={handleRefresh}>Refresh</Button>
						</CardFooter>
					</Card>
				)}
			</Section>

			<Section title="Checkbox / Switch / Radio">
				<div className="grid gap-6 sm:grid-cols-3">
					<Card className="p-4 space-y-3">
						<p className="text-sm font-medium">Checkbox</p>
						{["Notifications", "Marketing emails", "Updates"].map((label) => (
							<div key={label} className="flex items-center gap-2">
								<Checkbox id={label} />
								<Label htmlFor={label}>{label}</Label>
							</div>
						))}
					</Card>
					<Card className="p-4 space-y-3">
						<p className="text-sm font-medium">Switch</p>
						{["Dark mode", "Auto-save", "Beta features"].map((label) => (
							<div key={label} className="flex items-center justify-between p-1">
								<Label>{label}</Label>
								<Switch />
							</div>
						))}
					</Card>
					<Card className="p-4 space-y-3">
						<p className="text-sm font-medium">Radio</p>
						<RadioGroup defaultValue="option-1">
							{["Option 1", "Option 2", "Option 3"].map((o, i) => (
								<div key={o} className="flex items-center gap-2">
									<RadioGroupItem value={`option-${i + 1}`} id={`r-${i}`} />
									<Label htmlFor={`r-${i}`}>{o}</Label>
								</div>
							))}
						</RadioGroup>
					</Card>
				</div>
			</Section>

			{/* ── SLIDER / PROGRESS ───────────────────────────────────────── */}
			<Section title="Slider / Progress">
				<div className="grid gap-6 sm:grid-cols-2">
					<Card className="p-4 space-y-4">
						<p className="text-sm font-medium">Slider — {sliderValue[0]}%</p>
						<Slider
							value={sliderValue}
							onValueChange={setSliderValue}
							max={100}
							step={1}
						/>
					</Card>
					<Card className="p-4 space-y-4">
						<p className="text-sm font-medium mb-3">Progress</p>
						<div className="space-y-3">
							<Progress value={25} />
							<Progress value={50} />
							<Progress value={75} />
							<Progress value={100} />
						</div>
					</Card>
				</div>
			</Section>

			{/* ── TABS ────────────────────────────────────────────────────── */}
			<Section title="Tabs">
				<Tabs defaultValue="tab1">
					<TabsList>
						<TabsTrigger value="tab1">Account</TabsTrigger>
						<TabsTrigger value="tab2">Security</TabsTrigger>
						<TabsTrigger value="tab3">Notifications</TabsTrigger>
					</TabsList>
					<TabsContent value="tab1">
						<Card className="p-4">
							<p className="text-sm text-muted-foreground">Manage your account settings here.</p>
						</Card>
					</TabsContent>
					<TabsContent value="tab2">
						<Card className="p-4">
							<p className="text-sm text-muted-foreground">Update your password and 2FA settings.</p>
						</Card>
					</TabsContent>
					<TabsContent value="tab3">
						<Card className="p-4">
							<p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
						</Card>
					</TabsContent>
				</Tabs>
			</Section>

			{/* ── TABLE ───────────────────────────────────────────────────── */}
			<Section title="Table">
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tableData.map((row) => (
								<TableRow key={row.email}>
									<TableCell className="font-medium">{row.name}</TableCell>
									<TableCell>{row.email}</TableCell>
									<TableCell>{row.role}</TableCell>
									<TableCell>
										<Badge variant={row.status === "Active" ? "default" : "secondary"}>
											{row.status}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			</Section>

			<Section title="Scroll Area">
				<ScrollArea className="h-40 w-full rounded-md">
					{Array.from({ length: 20 }, (_, i) => (
						<p key={i} className="text-sm text-muted-foreground py-1">
							Item {i + 1} — scroll to see more content below
						</p>
					))}
				</ScrollArea>
			</Section>

			{/* ── SKELETON ────────────────────────────────────────────────── */}
			<Section title="Skeleton">
				<div className="flex items-center gap-4">
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</div>
			</Section>

			<Section title="Calendar">
				<div style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: "1.5rem",
					alignItems: "start"
				}}>
					{/* SINGLE MODE with min/max */}
					<div>
						<h4 className="text-sm font-medium mb-2">Single (March 2025 only)</h4>
						<Calendar mode="single" selected={date} onSelect={(d) => setDate(d as Date)} minDate={new Date(2025, 2, 1)} disableFuture={true} markedDates={markedDates} />
					</div>

					{/* MULTIPLE MODE */}
					<div>
						<h4 className="text-sm font-medium mb-2">Multiple (click any)</h4>
						<Calendar mode="multiple" selected={dates} onSelect={(d) => setDates(d as Date[])} markedDates={markedDates} />
					</div>

					{/* RANGE MODE with marked holidays */}
					<div>
						<h4 className="text-sm font-medium mb-2">Range + Marked holidays</h4>
						<Calendar mode="range" selected={range} onSelect={(d) => setRange(d as CalendarRange)} markedDates={markedDates} />
						<p className="text-xs text-text-muted mt-2">
							From: {range?.from ? range.from.toLocaleDateString() : "—"}<br />
							To: {range?.to ? range.to.toLocaleDateString() : "—"}
						</p>
					</div>
				</div>
			</Section>

			<Section title="Command">
				<Button variant="outline" onClick={() => setCommandOpen(true)}>
					<CommandIcon className="h-4 w-4 mr-2" /> Open Command
				</Button>
				<Command style={{ width: "100%", border: "1px solid var(--color-border)", borderRadius: "0.625rem" }}>
					<CommandInput placeholder="Type a command or search…" />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>

						<CommandGroup heading="Suggestions">
							<CommandItem>
								<CalendarIcon />
								Calendar
								<CommandShortcut>⌘C</CommandShortcut>
							</CommandItem>
							<CommandItem>
								<SmileIcon />
								Search Emoji
								<CommandShortcut>⌘E</CommandShortcut>
							</CommandItem>
							<CommandItem>
								<CalculatorIcon />
								Calculator
								<CommandShortcut>⌘K</CommandShortcut>
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />

						<CommandGroup heading="Settings">
							<CommandItem>
								<UserIcon />
								Profile
							</CommandItem>
							<CommandItem disabled>
								<BanIcon />
								Billing
								<CommandShortcut>⌘B</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>

				<CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
					<CommandInput placeholder="Search commands…" />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>

						<CommandGroup heading="Recent">
							<CommandItem onSelect={() => setCommandOpen(false)}>
								<ClockIcon />
								Profile
							</CommandItem>
							<CommandItem onSelect={() => setCommandOpen(false)}>
								<ClockIcon />
								Settings
								<CommandShortcut>⌘,</CommandShortcut>
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />

						<CommandGroup heading="Actions">
							<CommandItem onSelect={() => setCommandOpen(false)}>
								<PlusIcon />
								New Document
								<CommandShortcut>⌘N</CommandShortcut>
							</CommandItem>
							<CommandItem onSelect={() => setCommandOpen(false)}>
								<SearchIcon />
								Find in Files
								<CommandShortcut>⌘F</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</Section>

			{/* ── TOGGLE ──────────────────────────────────────────────────── */}
			<Section title="Toggle">
				<div className="flex flex-wrap gap-2">
					<Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
					<Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
					<Toggle aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
					<Toggle variant="outline" aria-label="Bold outline"><Bold className="h-4 w-4" /></Toggle>
					<Toggle disabled aria-label="Disabled"><Star className="h-4 w-4" /></Toggle>
				</div>
			</Section>

			{/* ── OVERLAYS row ────────────────────────────────────────────── */}
			<Section title="Dialog / Sheet / Popover / Dropdown / Tooltip">
				<div className="flex flex-wrap gap-3">
					{/* Dialog */}
					<Dialog>
						<DialogTrigger asChild>
							<Button>Open dialog</Button>
						</DialogTrigger>
						<DialogContent showCloseButton>
							<DialogHeader>
								<DialogTitle>Confirm action</DialogTitle>
								<DialogDescription>
									This action cannot be undone. Are you sure?
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button variant="default">Continue</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Sheet side="left" defaultOpen={false}>
						<SheetTrigger asChild>
							<Button>Open left sheet</Button>
						</SheetTrigger>
						<SheetContent showCloseButton>
							<SheetHeader>
								<SheetTitle>Left panel</SheetTitle>
								<SheetDescription>This slides from the left</SheetDescription>
							</SheetHeader>
							<div>Your content here</div>
							<SheetFooter>
								<Button variant="outline">Cancel</Button>
								<SheetClose asChild>
									<Button>Confirm</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>

					{/* Popover */}
					<div className="flex gap-4 justify-center">
						<Popover>
							<PopoverTrigger asChild><Button>Top</Button></PopoverTrigger>
							<PopoverContent side="top" align="center" sideOffset={8}>
								<PopoverTitle>Top popover</PopoverTitle>
								<PopoverDescription>Opens above the button</PopoverDescription>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild><Button>Bottom</Button></PopoverTrigger>
							<PopoverContent side="bottom" align="center" sideOffset={8}>
								<PopoverTitle>Bottom popover</PopoverTitle>
								<PopoverDescription>Opens below the button</PopoverDescription>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild><Button>Left</Button></PopoverTrigger>
							<PopoverContent side="left" align="center" sideOffset={8}>
								<PopoverTitle>Left popover</PopoverTitle>
								<PopoverDescription>Opens to the left</PopoverDescription>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild><Button>Right</Button></PopoverTrigger>
							<PopoverContent side="right" align="center" sideOffset={8}>
								<PopoverTitle>Right popover</PopoverTitle>
								<PopoverDescription>Opens to the right</PopoverDescription>
							</PopoverContent>
						</Popover>
					</div>

					{/* Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<User className="h-4 w-4 mr-2" /> Account
								<ChevronDown className="h-4 w-4 ml-2" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
							<DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Messages</DropdownMenuItem>
							<DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Settings</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">
								<LogOut className="h-4 w-4 mr-2" />Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Tooltip */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline">Hover me</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>This is a tooltip!</p>
						</TooltipContent>
					</Tooltip>

				</div>
			</Section>

			{/* ── COLLAPSIBLE ─────────────────────────────────────────────── */}
			<Section title="Collapsible">
				<Collapsible>
					<CollapsibleTrigger asChild>
						<Button>Toggle</Button>
					</CollapsibleTrigger>
					<CollapsibleContent animationDuration={200} className="mt-3">
						<div className="p-4 border rounded">
							This content will slide open and closed.
						</div>
					</CollapsibleContent>
				</Collapsible>
			</Section>

			{/* ── SWITCH with label (standalone demo) ─────────────────────── */}
			<Section title="Switch (controlled)">
				<div className="flex items-center gap-3">
					<Switch checked={switchOn} onCheckedChange={setSwitchOn} id="demo-switch" />
					<Label htmlFor="demo-switch">{switchOn ? "Enabled" : "Disabled"}</Label>
				</div>
			</Section>

			{/* ── SEPARATOR ───────────────────────────────────────────────── */}
			<Section title="Separator">
				<div className="space-y-3">
					<Separator />
					<div className="flex items-center gap-4">
						<span className="text-sm">Left</span>
						<Separator orientation="vertical" className="h-6" />
						<span className="text-sm">Right</span>
					</div>
				</div>
			</Section>

			{/* ── TOASTS ──────────────────────────────────────────────────── */}
			<Section title="Toast (Sonner)">
				<div className="flex flex-wrap gap-3">
					<Button onClick={() => toast.success("Successfully saved!")}>Success</Button>
					<Button variant="destructive" onClick={() => toast.error("Something went wrong.")}>Error</Button>
					<Button variant="secondary" onClick={() => toast.warning("Heads up! Check this.")}>Warning</Button>
					<Button variant="outline" onClick={() => toast.info("Here's some info for you.")}>Info</Button>
					<Button variant="ghost" onClick={() => {
						const toastId = toast.loading("Loading…", {
							cancel: {
								label: "Cancel",
								onClick: () => {
									toast.dismiss(toastId);
								},
							}
						})
					}}>Loading</Button>

					<Button
						variant="secondary"
						onClick={() => {
							toast.confirm({
								message: "Delete this item permanently?",
								confirmLabel: "Delete",
								cancelLabel: "Cancel",
								onConfirm: () => void toast.success("Item deleted."),
								onCancel: () => void toast.info("Cancelled."),
							});
						}}
					>
						Confirm
					</Button>

					<Button
						variant="default"
						onClick={async () => {
							try {
								const result = await toast.process({
									task: async () => {
										await new Promise(resolve => setTimeout(resolve, 2000));
										return { ok: true };
									},
									loadingMessage: "Processing your request...",
									successMessage: "Task completed successfully!",
									errorMessage: "Oops, something failed.",
									dismissible: true,
								});
								console.log("Process result:", result);
							} catch (error) {
								console.error("Process cancelled or failed:", error);
							}
						}}
					>
						Process (with overlay)
					</Button>
				</div>
			</Section>
		</div>
	</>
	)
}