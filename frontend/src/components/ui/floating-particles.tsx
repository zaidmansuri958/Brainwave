"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
  colors?: string[];
}

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  color: string;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function FloatingParticles({
  count = 20,
  className,
  colors = [
    "rgba(99,102,241,0.15)",
    "rgba(168,85,247,0.15)",
    "rgba(59,130,246,0.12)",
    "rgba(236,72,153,0.1)",
  ],
}: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: rand() * 20 + 4,
      x: rand() * 100,
      y: rand() * 100,
      color: colors[i % colors.length],
      driftX: (rand() - 0.5) * 60,
      driftY: (rand() - 0.5) * 60,
      duration: rand() * 8 + 10,
      delay: rand() * 5,
    }));
  }, [count, colors]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
          }}
          animate={{
            x: [0, p.driftX, -p.driftX * 0.5, 0],
            y: [0, p.driftY * 0.6, -p.driftY, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
