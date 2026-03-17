"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RippleEffectProps {
  className?: string;
  color?: string;
  count?: number;
}

export function RippleEffect({
  className,
  color = "rgba(99,102,241,0.15)",
  count = 3,
}: RippleEffectProps) {
  const rings = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        delay: `${i * 1.2}s`,
        size: 200 + i * 120,
      })),
    [count]
  );

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden",
        className
      )}
      aria-hidden
    >
      {rings.map((ring) => (
        <span
          key={ring.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: ring.size,
            height: ring.size,
            border: `1px solid ${color}`,
            animation: `ripple 3.5s ease-out infinite`,
            animationDelay: ring.delay,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
