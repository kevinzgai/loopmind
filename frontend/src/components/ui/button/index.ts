import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-2 border-primary hover:-translate-y-0.5 active:translate-y-0 [box-shadow:3px_3px_0px_hsl(var(--foreground))] hover:[box-shadow:4px_4px_0px_hsl(var(--foreground))] active:[box-shadow:1px_1px_0px_hsl(var(--foreground))]",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive hover:-translate-y-0.5 active:translate-y-0 [box-shadow:3px_3px_0px_hsl(var(--foreground))] hover:[box-shadow:4px_4px_0px_hsl(var(--foreground))] active:[box-shadow:1px_1px_0px_hsl(var(--foreground))]",
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 active:translate-y-0 [box-shadow:3px_3px_0px_hsl(var(--primary))] hover:[box-shadow:4px_4px_0px_hsl(var(--primary))] active:[box-shadow:1px_1px_0px_hsl(var(--primary))]",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-primary hover:-translate-y-0.5 active:translate-y-0 [box-shadow:3px_3px_0px_hsl(var(--primary))] hover:[box-shadow:4px_4px_0px_hsl(var(--primary))] active:[box-shadow:1px_1px_0px_hsl(var(--primary))]",
        ghost: "hover:bg-muted hover:text-foreground border-2 border-transparent hover:border-primary",
        link: "text-primary underline-offset-4 hover:underline border-2 border-transparent",
      },
      size: {
        "default": "h-10 px-5 py-2",
        "xs": "h-7 rounded-xl px-2 text-xs",
        "sm": "h-8 rounded-xl px-3 text-xs",
        "lg": "h-12 rounded-2xl px-8 text-base",
        "icon": "h-10 w-10",
        "icon-sm": "size-8 rounded-xl",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
