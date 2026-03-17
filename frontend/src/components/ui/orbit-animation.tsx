"use client";

import { cn } from "@/lib/utils";

interface OrbitItem {
  icon: React.ReactNode;
  label?: string;
}

interface OrbitAnimationProps {
  children: React.ReactNode;
  orbitItems: OrbitItem[];
  radius?: number;
  duration?: number;
  className?: string;
}

export function OrbitAnimation({
  children,
  orbitItems,
  radius = 120,
  duration = 20,
  className,
}: OrbitAnimationProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}
    >
      <div
        className="absolute rounded-full border border-white/[0.06]"
        style={{ width: radius * 2, height: radius * 2 }}
      />

      <div className="relative z-10">{children}</div>

      {orbitItems.map((item, i) => {
        const angle = (360 / orbitItems.length) * i;
        return (
          <div
            key={i}
            className="absolute will-change-transform"
            style={{
              animation: `orbit ${duration}s linear infinite`,
              animationDelay: `${-(duration / orbitItems.length) * i}s`,
              ["--orbit-radius" as string]: `${radius}px`,
              left: "50%",
              top: "50%",
              marginLeft: -16,
              marginTop: -16,
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] backdrop-blur-sm border border-white/[0.08]"
              style={{
                animation: `orbit ${duration}s linear infinite reverse`,
                animationDelay: `${-(duration / orbitItems.length) * i}s`,
              }}
            >
              {item.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
