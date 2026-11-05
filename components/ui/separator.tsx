"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  decorative?: boolean
  orientation?: "horizontal" | "vertical"
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, decorative, orientation = "horizontal", ...props }, ref) => {
    return (
      <hr
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation}
        className={cn(
          "relative w-full shrink-0 border",
          orientation === "horizontal"
            ? "h-[px] border-t border-input"
            : "w-[px] border-l border-input",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }
