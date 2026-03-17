"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "glass" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variants: Record<string, string> = {
      default:
        "bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg active:scale-[0.98]",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      outline:
        "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      ghost:
        "hover:bg-accent hover:text-accent-foreground",
      destructive:
        "bg-destructive text-white hover:bg-red-600 shadow-md",
      glass:
        "glass hover:shadow-lg active:scale-[0.98]",
      gradient:
        "gradient-bg text-white shadow-lg hover:shadow-glow active:scale-[0.98] hover:opacity-90",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-5 text-sm rounded-xl gap-2",
      lg: "h-12 px-8 text-base rounded-xl gap-2.5",
      icon: "h-10 w-10 rounded-xl",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
