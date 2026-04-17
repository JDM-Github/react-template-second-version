import * as React from "react"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ style, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="skeleton"
      style={{
        background: "var(--color-surface-2, #202432)",
        borderRadius: "0.375rem",
        animation: "skeleton-pulse 1.6s ease-in-out infinite",
        ...style,
      }}
      {...props}
    >
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
export type { SkeletonProps }