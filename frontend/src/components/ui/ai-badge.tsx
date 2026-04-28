"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  className?: string;
  label?: string;
}

export function AIBadge({ className, label = "AI" }: AIBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-black shadow-[2px_2px_0_#111111]",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      <span>{label}</span>
    </span>
  );
}
