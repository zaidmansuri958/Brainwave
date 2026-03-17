"use client";

import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(180px,1fr)] grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  icon,
  title,
  description,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6",
        "backdrop-blur-sm transition-colors hover:border-white/[0.12]",
        "bento-shine tilt-card",
        colSpan === 2 && "md:col-span-2",
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        {icon && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </div>
  );
}
