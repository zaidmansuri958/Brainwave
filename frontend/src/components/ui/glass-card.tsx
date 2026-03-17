"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "gradient-border";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, padding = "md", children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "glass-card",
      elevated: "glass-card shadow-glass-lg",
      subtle: "bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5",
      "gradient-border": "glass-card gradient-border",
    };

    const paddings: Record<string, string> = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          paddings[padding],
          hover && "card-hover cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
