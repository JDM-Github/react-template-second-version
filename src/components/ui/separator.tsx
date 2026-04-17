import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", decorative = true, className, style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      flexShrink: 0,
      backgroundColor: "var(--color-border, #2A2D3E)",
    }

    const orientationStyles: React.CSSProperties =
      orientation === "horizontal"
        ? { width: "100%", height: "1px" }
        : { width: "1px", alignSelf: "stretch" } 

    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        data-slot="separator"
        data-orientation={orientation}
        className={cn(className)}
        style={{
          ...baseStyles,
          ...orientationStyles,
          ...style,
        }}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }
export type { SeparatorProps }