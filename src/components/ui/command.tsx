import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchIcon, CheckIcon } from "lucide-react"

// ─── Shared style tokens (mirrors dropdown) ───────────────────────────────────

const SURFACE = "var(--color-surface, #1A1D27)"
const SURFACE_2 = "var(--color-surface-2, #202432)"
const BORDER = "var(--color-border, #2A2D3E)"
const TEXT = "var(--color-text, #E8EDF5)"
const MUTED = "var(--color-text-muted, #8892A4)"
const FAINT = "var(--color-text-faint, #4A5168)"
const SHADOW = "0 8px 24px rgba(0,0,0,0.3)"
const FONT = "var(--font-sans, 'DM Sans', system-ui, sans-serif)"
const ANIM = "fadeUp 0.15s ease-out"

// ─── Command (root) ───────────────────────────────────────────────────────────

interface CommandProps extends React.ComponentProps<typeof CommandPrimitive> { }

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  CommandProps
>(({ style, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    data-slot="command"
    style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      overflow: "hidden",
      borderRadius: "0.625rem",
      background: SURFACE,
      color: TEXT,
      fontFamily: FONT,
      animation: ANIM,
      ...style,
    }}
    {...props}
  />
))
Command.displayName = "Command"

// ─── CommandDialog ────────────────────────────────────────────────────────────

interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  title?: string
  description?: string
  showCloseButton?: boolean
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  showCloseButton = false,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={showCloseButton}
        style={{
          overflow: "hidden",
          borderRadius: "0.625rem",
          padding: 0,
          border: `1px solid ${BORDER}`,
          boxShadow: SHADOW,
          background: SURFACE,
        }}
      >
        <Command style={{ borderRadius: 0, animation: "none" }}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

// ─── CommandInput ─────────────────────────────────────────────────────────────

interface CommandInputProps
  extends React.ComponentProps<typeof CommandPrimitive.Input> { }

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ style, ...props }, ref) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      borderBottom: `1px solid ${BORDER}`,
      padding: "0 0.75rem",
    }}
  >
    <SearchIcon
      style={{
        width: "0.875rem",
        height: "0.875rem",
        flexShrink: 0,
        color: MUTED,
      }}
    />
    <CommandPrimitive.Input
      ref={ref}
      data-slot="command-input"
      style={{
        display: "flex",
        height: "2.5rem",
        width: "100%",
        background: "transparent",
        fontSize: "0.875rem",
        color: TEXT,
        fontFamily: FONT,
        border: "none",
        outline: "none",
        padding: "0.5rem 0",
        caretColor: "var(--color-accent, #4F6EF7)",
        ...style,
      }}
      {...props}
    />
  </div>
))
CommandInput.displayName = "CommandInput"

// ─── CommandList ──────────────────────────────────────────────────────────────

interface CommandListProps
  extends React.ComponentProps<typeof CommandPrimitive.List> { }

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ style, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    style={{
      maxHeight: "18rem",
      overflowY: "auto",
      padding: "0.25rem",
      scrollbarWidth: "thin",
      scrollbarColor: `${BORDER} transparent`,
      ...style,
    }}
    {...props}
  />
))
CommandList.displayName = "CommandList"

// ─── CommandEmpty ─────────────────────────────────────────────────────────────

interface CommandEmptyProps
  extends React.ComponentProps<typeof CommandPrimitive.Empty> { }

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(({ style, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    style={{
      padding: "1.5rem 0",
      textAlign: "center",
      fontSize: "0.875rem",
      color: MUTED,
      fontFamily: FONT,
      ...style,
    }}
    {...props}
  />
))
CommandEmpty.displayName = "CommandEmpty"

// ─── CommandGroup ─────────────────────────────────────────────────────────────

interface CommandGroupProps
  extends React.ComponentProps<typeof CommandPrimitive.Group> { }

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ style, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    style={{
      overflow: "hidden",
      padding: "0.25rem 0",
      // Group heading via CSS — cmdk adds [cmdk-group-heading]
      ...style,
    }}
    // Inline styles can't target the child heading; inject a small <style> via wrapper
    {...props}
  />
))
CommandGroup.displayName = "CommandGroup"

// Small global patch so cmdk group headings get the right look
// (Drop this once you integrate into a CSS file)
function CommandGroupHeadingStyle() {
  return (
    <style>{`
      [cmdk-group-heading] {
        padding: 0.35rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: ${MUTED};
        letter-spacing: 0.04em;
        font-family: ${FONT};
        user-select: none;
      }
    `}</style>
  )
}

// ─── CommandSeparator ─────────────────────────────────────────────────────────

interface CommandSeparatorProps
  extends React.ComponentProps<typeof CommandPrimitive.Separator> { }

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ style, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    data-slot="command-separator"
    style={{
      height: "1px",
      background: BORDER,
      margin: "0.25rem 0",
      ...style,
    }}
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"

// ─── CommandItem ──────────────────────────────────────────────────────────────

interface CommandItemProps
  extends React.ComponentProps<typeof CommandPrimitive.Item> { }

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ style, children, ...props }, ref) => {
  const [hov, setHov] = React.useState(false)

  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.45rem 0.75rem",
        fontSize: "0.875rem",
        color: TEXT,
        fontFamily: FONT,
        background: hov ? SURFACE_2 : "transparent",
        borderRadius: "0.375rem",
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.1s",
        outline: "none",
        ...style,
      }}
      {...props}
    >
      {children}
      <CheckIcon
        style={{
          marginLeft: "auto",
          width: "0.875rem",
          height: "0.875rem",
          color: MUTED,
          opacity: 0,
          flexShrink: 0,
        }}
        // cmdk sets data-selected="true" — wire opacity via inline style workaround
        data-check
      />
    </CommandPrimitive.Item>
  )
})
CommandItem.displayName = "CommandItem"

// Patch for cmdk selected + disabled states
function CommandItemStyle() {
  return (
    <style>{`
      [cmdk-item][data-selected="true"] {
        background: ${SURFACE_2} !important;
        color: ${TEXT};
      }
      [cmdk-item][data-selected="true"] [data-check] {
        opacity: 1 !important;
      }
      [cmdk-item][data-disabled="true"] {
        color: ${FAINT};
        pointer-events: none;
        cursor: not-allowed;
      }
      [cmdk-input]::placeholder {
        color: ${FAINT};
      }
    `}</style>
  )
}

// ─── CommandLabel (mirrors DropdownMenuLabel) ─────────────────────────────────

interface CommandLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const CommandLabel = React.forwardRef<HTMLDivElement, CommandLabelProps>(
  ({ inset, style, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="command-label"
      style={{
        padding: `0.35rem ${inset ? "2.25rem" : "0.75rem"}`,
        paddingLeft: inset ? "2.25rem" : "0.75rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: MUTED,
        letterSpacing: "0.04em",
        userSelect: "none",
        fontFamily: FONT,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
)
CommandLabel.displayName = "CommandLabel"

// ─── CommandShortcut ──────────────────────────────────────────────────────────

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> { }

const CommandShortcut = React.forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ style, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="command-shortcut"
      style={{
        marginLeft: "auto",
        fontSize: "0.7rem",
        color: FAINT,
        letterSpacing: "0.05em",
        fontFamily: FONT,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
)
CommandShortcut.displayName = "CommandShortcut"

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandGroupHeadingStyle,
  CommandItemStyle,
  CommandSeparator,
  CommandItem,
  CommandLabel,
  CommandShortcut,
}