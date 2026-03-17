"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGridBgProps {
  className?: string;
}

interface GlowDot {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function AnimatedGridBg({ className }: AnimatedGridBgProps) {
  const dots = useMemo<GlowDot[]>(() => {
    const rand = seededRandom(7);
    const gridSize = 60;
    const cols = Math.ceil(1920 / gridSize);
    const rows = Math.ceil(1080 / gridSize);
    const count = 18;
    const result: GlowDot[] = [];

    for (let i = 0; i < count; i++) {
      const col = Math.floor(rand() * cols);
      const row = Math.floor(rand() * rows);
      result.push({
        id: i,
        x: col * gridSize,
        y: row * gridSize,
        delay: rand() * 8,
        duration: rand() * 4 + 3,
        size: rand() * 3 + 2,
      });
    }
    return result;
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden grid-bg",
        className
      )}
      aria-hidden
    >
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full will-change-transform"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            backgroundColor: "rgba(99,102,241,0.4)",
            boxShadow: "0 0 8px 2px rgba(99,102,241,0.15)",
          }}
          animate={{
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
