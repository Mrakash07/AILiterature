import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FA7]/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-tight",
  {
    variants: {
      variant: {
        default:
          "bg-[#1B5FA7] text-white shadow-lg shadow-[#1B5FA7]/10 hover:bg-[#0F4C81] hover:shadow-[#1B5FA7]/20 active:scale-95",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-gray-200 bg-white text-[#1F2937] hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        secondary:
          "bg-[#F3F7FC] text-[#1B5FA7] hover:bg-[#E6EEF6] shadow-sm",
        ghost: "text-[#6B7C93] hover:text-[#1F2937] hover:bg-gray-100/50",
        link: "text-[#1B5FA7] underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-[#0F4C81] to-[#1E6FB5] text-white shadow-lg shadow-[#1B5FA7]/20 hover:shadow-xl transition-all",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-12 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
