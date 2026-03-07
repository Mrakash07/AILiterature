import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-bold transition-all uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1B5FA7] text-white shadow-sm",
        secondary:
          "border-transparent bg-[#E6EEF6] text-[#1B5FA7]",
        destructive:
          "border-transparent bg-red-100 text-red-600",
        outline: "text-[#6B7C93] border-gray-200 bg-white",
        premium: "border-transparent bg-gradient-to-r from-[#0F4C81] to-[#1E6FB5] text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
