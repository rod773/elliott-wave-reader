"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AspectRatioProps
  extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: "square" | "4by3" | "16by9"
  className?: string
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = "square", ...props }, ref) => {
    const ratioMap: Record<string, string> = {
      square: "aspect-[1/1]",
      "4by3": "aspect-[4/3]",
      "16by9": "aspect-[16/9]",
    }

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden rounded-md", ratioMap[ratio], className)}
        {...props}
      />
    )
  }
)
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
