"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
}

export function Marquee({
  children,
  className,
  speed = 40,
  pauseOnHover = false,
  direction = "left",
}: MarqueeProps) {
  const animationDirection = direction === "left" ? "normal" : "reverse";

  return (
    <>
      <style jsx>{`
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
      <div
        className={cn("overflow-hidden", className)}
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          className="flex w-max will-change-transform"
          style={{
            animation: `marquee-scroll ${speed}s linear infinite`,
            animationDirection,
            ...(pauseOnHover ? {} : {}),
          }}
          onMouseEnter={(e) => {
            if (pauseOnHover) e.currentTarget.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            if (pauseOnHover) e.currentTarget.style.animationPlayState = "running";
          }}
        >
          <div className="flex shrink-0 items-center gap-4">{children}</div>
          <div className="flex shrink-0 items-center gap-4" aria-hidden>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
