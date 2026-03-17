"use client";

import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  children?: React.ReactNode;
}

export function Spotlight({ className, children }: SpotlightProps) {
  return (
    <>
      <style jsx>{`
        @keyframes spotlight-a {
          0%,
          100% {
            transform: translate(0%, 0%) scale(1);
          }
          25% {
            transform: translate(15%, -10%) scale(1.1);
          }
          50% {
            transform: translate(-10%, 15%) scale(0.95);
          }
          75% {
            transform: translate(5%, 10%) scale(1.05);
          }
        }
        @keyframes spotlight-b {
          0%,
          100% {
            transform: translate(0%, 0%) scale(1);
          }
          25% {
            transform: translate(-20%, 10%) scale(1.05);
          }
          50% {
            transform: translate(10%, -15%) scale(1.1);
          }
          75% {
            transform: translate(-5%, -10%) scale(0.95);
          }
        }
        @keyframes spotlight-c {
          0%,
          100% {
            transform: translate(0%, 0%) scale(1.05);
          }
          33% {
            transform: translate(12%, 8%) scale(0.95);
          }
          66% {
            transform: translate(-8%, -12%) scale(1.1);
          }
        }
      `}</style>
      <div className={cn("relative overflow-hidden", className)}>
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute -top-1/2 -left-1/4 h-[80%] w-[60%] rounded-full opacity-20 blur-3xl will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
              animation: "spotlight-a 15s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-1/3 -right-1/4 h-[70%] w-[50%] rounded-full opacity-20 blur-3xl will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
              animation: "spotlight-b 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/4 left-1/3 h-[50%] w-[40%] rounded-full opacity-15 blur-3xl will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
              animation: "spotlight-c 20s ease-in-out infinite",
            }}
          />
        </div>

        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}
