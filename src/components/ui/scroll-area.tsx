import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// ScrollArea (root)
// ─────────────────────────────────────────────────────────────────────────────
interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation = "vertical", className, style, children, ...props }, ref) => {
    const overflowY = orientation !== "horizontal" ? "auto" : "hidden"
    const overflowX = orientation !== "vertical" ? "auto" : "hidden"

    return (
      <div
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative", className)}
        style={{
          overflowY,
          overflowX,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-border, #2A2D3E) transparent",
          ...style,
        }}
        {...props}
      >
        <div
          data-slot="scroll-area-viewport"
          className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
          style={{ height: "100%", width: "100%" }}
        >
          {children}
        </div>
        <div data-slot="scroll-area-corner" style={{ display: "none" }} />
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

// ─────────────────────────────────────────────────────────────────────────────
// ScrollBar (subcomponent, for advanced use)
// ─────────────────────────────────────────────────────────────────────────────
interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
}
const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ orientation = "vertical", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area-scrollbar"
        data-orientation={orientation}
        className={cn(
          "flex touch-none p-px transition-colors select-none",
          orientation === "horizontal"
            ? "h-2.5 flex-col border-t border-t-transparent"
            : "w-2.5 border-l border-l-transparent",
          className
        )}
        {...props}
      >
        <div
          data-slot="scroll-area-thumb"
          className="relative flex-1 rounded-full bg-border"
        />
      </div>
    )
  }
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
export type { ScrollAreaProps, ScrollBarProps }