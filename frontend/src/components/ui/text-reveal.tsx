"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.25"],
  });

  const characters = text.split("");

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex flex-wrap">
        {characters.map((char, i) => (
          <Character
            key={`${char}-${i}`}
            char={char}
            index={i}
            total={characters.length}
            progress={scrollYProgress}
          />
        ))}
      </span>
    </div>
  );
}

interface CharacterProps {
  char: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function Character({ char, index, total, progress }: CharacterProps) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.1, 1]);

  return (
    <motion.span
      className="will-change-[opacity] inline-block whitespace-pre"
      style={{ opacity }}
    >
      {char}
    </motion.span>
  );
}
