import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("bw-page", className)}>{children}</div>;
}

export function ContentBand({
  children,
  className,
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return <section className={cn("bw-band", muted && "bw-band-muted", className)}>{children}</section>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-extrabold uppercase leading-[0.95] text-slate-950 sm:text-4xl">{title}</h2>
        {description ? <p className="bw-muted mt-3 max-w-2xl text-sm leading-7 sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  accentClass = "bg-indigo-50 text-indigo-600",
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  accentClass?: string;
}) {
  const Icon = icon;
  return (
    <div className="bw-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="bw-kicker">{label}</p>
          <p className="mt-3 font-display text-3xl font-extrabold uppercase text-slate-950">{value}</p>
          {detail ? <p className="bw-muted mt-1 text-sm">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-black", accentClass)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function InsightCard({
  title,
  description,
  icon,
  accentClass = "bg-sky-50 text-sky-600",
  className,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  accentClass?: string;
  className?: string;
}) {
  const Icon = icon;
  return (
    <div className={cn("bw-card p-5", className)}>
      {Icon ? (
        <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-black", accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="font-display text-lg font-bold uppercase text-slate-950">{title}</h3>
      <p className="bw-muted mt-2 text-sm leading-7">{description}</p>
    </div>
  );
}

export function StickyAsideCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <aside className={cn("bw-card sticky top-24 p-5", className)}>{children}</aside>;
}

export function EmptyStatePanel({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="bw-card-soft border-dashed px-8 py-14 text-center">
      {Icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] border-2 border-black bg-[#8ed8ff] text-black">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <p className="font-display text-lg font-bold uppercase text-slate-950">{title}</p>
      {description ? <p className="bw-muted mx-auto mt-2 max-w-md text-sm leading-7">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const toneMap = {
    neutral: "bg-white text-slate-700 border-black",
    success: "bg-[#dff8df] text-[#246b31] border-black",
    warning: "bg-[#ffe6c9] text-[#a04a00] border-black",
    danger: "bg-[#ffd6d6] text-[#b93131] border-black",
    info: "bg-[#d7f1ff] text-[#0d67a5] border-black",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border-2 px-2.5 py-1 text-[11px] font-extrabold uppercase", toneMap[tone])}>
      {children}
    </span>
  );
}

export function FilterToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("bw-card p-4 sm:p-5", className)}>{children}</div>;
}

export function CourseMetaRow({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-3 text-xs text-slate-500", className)}>{items}</div>;
}

export function ActionRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

export function DenseDataTable({
  columns,
  rows,
  className,
}: {
  columns: string[];
  rows: ReactNode[][];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[1.5rem] border-2 border-black bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#ffe500] text-left">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-950">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/10">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-[#fff6dc]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-4 align-top text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StepFormLayout({
  title,
  description,
  steps,
  activeStep,
  children,
  aside,
}: {
  title: string;
  description?: string;
  steps: string[];
  activeStep: number;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <ContentBand muted>
          <p className="eyebrow mb-3">Guided Workflow</p>
          <h1 className="font-display text-3xl font-extrabold text-slate-950">{title}</h1>
          {description ? <p className="bw-muted mt-3 max-w-2xl text-sm leading-7">{description}</p> : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "rounded-[1.25rem] border-2 px-4 py-4 text-sm shadow-[3px_3px_0_#111111]",
                  index === activeStep
                    ? "border-black bg-[#ffe500] text-slate-950"
                    : "border-black bg-white text-slate-600"
                )}
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]">Step {index + 1}</p>
                <p className="mt-2 font-extrabold uppercase">{step}</p>
              </div>
            ))}
          </div>
        </ContentBand>
        {children}
      </div>
      {aside ? <StickyAsideCard>{aside}</StickyAsideCard> : null}
    </div>
  );
}
