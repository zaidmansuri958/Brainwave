"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

const containerVariants: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.05,
      delayChildren: delay,
    },
  }),
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export function AnimatedText({
  text,
  className,
  delay = 0,
  as: Tag = "p",
}: AnimatedTextProps) {
  const words = useMemo(() => text.split(" "), [text]);

  const MotionTag = motion(Tag);

  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="mr-[0.25em] inline-block will-change-transform"
          variants={wordVariants}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  );
}
