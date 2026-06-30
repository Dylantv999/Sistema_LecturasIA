import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[24px] border border-transparent bg-clip-padding font-bold whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-sky-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-md hover:from-primary hover:to-primary/90",
        outline:
          "border-2 border-primary/20 bg-background text-primary hover:bg-primary/5 hover:border-primary/40 shadow-sm",
        secondary:
          "bg-gradient-to-b from-secondary/90 to-secondary text-secondary-foreground shadow-md hover:from-secondary hover:to-secondary/90",
        tertiary:
          "bg-gradient-to-b from-tertiary/90 to-tertiary text-white shadow-md hover:from-tertiary hover:to-tertiary/90",
        ghost:
          "hover:bg-sky-50 text-sky-800 hover:text-sky-900",
        destructive:
          "bg-gradient-to-b from-destructive/90 to-destructive text-destructive-foreground shadow-md hover:from-destructive hover:to-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8 text-lg gap-2",
        xs: "h-8 px-4 text-xs gap-1 rounded-[16px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 px-6 text-base gap-1.5 rounded-[20px] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-16 px-10 text-xl gap-2.5",
        icon: "size-14 rounded-full",
        "icon-xs": "size-8 rounded-full",
        "icon-sm": "size-10 rounded-full",
        "icon-lg": "size-16 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
