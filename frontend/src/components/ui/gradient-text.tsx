"use client";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export function GradientText({
  children,
  className,
  colors = ["#6366f1", "#a855f7", "#ec4899", "#6366f1"],
}: GradientTextProps) {
  const gradient = colors.join(", ");

  return (
    <>
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <span
        className={cn("inline-block", className)}
        style={{
          backgroundImage: `linear-gradient(90deg, ${gradient})`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "gradient-shift 6s ease infinite",
          willChange: "background-position",
        }}
      >
        {children}
      </span>
    </>
  );
}
