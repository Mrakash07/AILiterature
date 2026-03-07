import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base shadow-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#1F2937] placeholder:text-[#6B7C93]/50 focus-visible:outline-none focus-visible:border-[#1B5FA7] focus-visible:ring-2 focus-visible:ring-[#1B5FA7]/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
