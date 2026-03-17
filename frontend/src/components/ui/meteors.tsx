"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  count?: number;
  className?: string;
}

interface MeteorData {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Meteors({ count = 8, className }: MeteorsProps) {
  const meteors = useMemo<MeteorData[]>(() => {
    const rand = seededRandom(99);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      delay: `${rand() * 5}s`,
      duration: `${rand() * 5 + 3}s`,
      size: rand() * 40 + 60,
    }));
  }, [count]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      {meteors.map((m) => (
        <span
          key={m.id}
          className="meteor absolute will-change-transform"
          style={{
            left: m.left,
            top: "-5%",
            height: m.size,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  );
}
