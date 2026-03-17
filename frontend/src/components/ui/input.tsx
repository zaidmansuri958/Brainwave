"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  variant?: "default" | "glass";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "border border-border bg-background focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20",
      glass:
        "glass-input",
    };

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            variants[variant],
            icon && "pl-11",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
