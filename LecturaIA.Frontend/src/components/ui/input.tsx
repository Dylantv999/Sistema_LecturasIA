import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-[20px] border-2 border-primary/20 bg-white/50 px-5 py-2 text-lg transition-all duration-300 outline-none placeholder:text-neutral-color/60 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-white hover:border-primary/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
