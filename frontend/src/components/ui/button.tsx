import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[16px] border-2 border-black text-sm font-extrabold uppercase ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[3px_3px_0_#111111] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-[#ff6b00] hover:text-white hover:shadow-[5px_5px_0_#111111]",
        destructive: "bg-destructive text-destructive-foreground shadow-[3px_3px_0_#111111] hover:-translate-x-[1px] hover:-translate-y-[1px]",
        outline: "bg-background shadow-[3px_3px_0_#111111] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-accent hover:text-accent-foreground hover:shadow-[5px_5px_0_#111111]",
        secondary: "bg-secondary text-secondary-foreground shadow-[3px_3px_0_#111111] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_#111111]",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent bg-transparent px-0 py-0 shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-[12px] px-3",
        lg: "h-12 rounded-[16px] px-8",
        icon: "h-10 w-10 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
