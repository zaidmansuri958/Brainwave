"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("bw-page relative overflow-hidden", className)}>{children}</div>;
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
  return (
    <section 
      className={cn(
        "bw-band relative rounded-[32px] sm:rounded-[40px] border-4 transition-all duration-500", 
        muted ? "bw-band-muted border-black/10" : "border-black shadow-[8px_8px_0_#111111]", 
        className
      )}
    >
      {muted && <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay rounded-[36px]" />}
      {children}
    </section>
  );
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
    <div className={cn("relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="eyebrow inline-block mb-4 bg-[#ffe500] text-black border-2 border-black shadow-[2px_2px_0_#111111] px-4 py-1.5 text-xs font-black tracking-widest">{eyebrow}</span>
          </motion.div>
        ) : null}
        <motion.h2 
          initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight text-slate-950"
        >
          {title}
        </motion.h2>
        {description ? (
          <motion.p 
            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-700 font-medium"
          >
            {description}
          </motion.p>
        ) : null}
      </div>
      {action ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          {action}
        </motion.div>
      ) : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  accentClass = "bg-[#8ed8ff] text-black",
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  accentClass?: string;
}) {
  const Icon = icon;
  return (
    <motion.div 
      whileHover={{ y: -6, x: -6, boxShadow: "12px 12px 0px #111111" }}
      className="bw-card group relative p-6 sm:p-8 rounded-[32px] border-4 border-black bg-white shadow-[6px_6px_0_#111111] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-4 group-hover:text-black transition-colors">{label}</p>
          <p className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter text-slate-950 group-hover:scale-105 origin-left transition-transform duration-300">{value}</p>
          {detail ? <p className="mt-3 text-sm font-bold text-slate-600 bg-slate-100 inline-block px-3 py-1 rounded-full">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-[20px] border-4 border-black shadow-[4px_4px_0_#111111] group-hover:rotate-12 transition-transform duration-300", accentClass)}>
            <Icon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function InsightCard({
  title,
  description,
  icon,
  accentClass = "bg-[#f7a8d8] text-black",
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
    <motion.div 
      whileHover={{ y: -4, x: -4, boxShadow: "8px 8px 0px #111111" }}
      className={cn("bw-card group p-6 sm:p-8 rounded-[28px] border-4 border-black bg-white shadow-[4px_4px_0_#111111] transition-all duration-300", className)}
    >
      {Icon ? (
        <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] border-4 border-black shadow-[4px_4px_0_#111111] group-hover:-rotate-6 transition-transform duration-300", accentClass)}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
      ) : null}
      <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">{description}</p>
    </motion.div>
  );
}

export function StickyAsideCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("bw-card sticky top-28 p-6 sm:p-8 rounded-[32px] border-4 border-black shadow-[8px_8px_0_#111111]", className)}>
      {children}
    </aside>
  );
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
    <div className="bw-card-soft relative overflow-hidden rounded-[40px] border-4 border-black bg-[#fff4d6] px-8 py-20 text-center shadow-[8px_8px_0_#111111]">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay pointer-events-none" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10"
      >
        {Icon ? (
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border-4 border-black bg-[#8ed8ff] text-black shadow-[6px_6px_0_#111111] hover:rotate-12 transition-transform duration-300">
            <Icon className="h-10 w-10" strokeWidth={2.5} />
          </div>
        ) : null}
        <p className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">{title}</p>
        {description ? <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg font-medium leading-relaxed text-slate-700">{description}</p> : null}
        {action ? <div className="mt-10">{action}</div> : null}
      </motion.div>
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const toneMap = {
    neutral: "bg-white text-black border-black",
    success: "bg-[#7dde92] text-black border-black",
    warning: "bg-[#ffe500] text-black border-black",
    danger: "bg-[#ff6b00] text-white border-black",
    info: "bg-[#8ed8ff] text-black border-black",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border-2 sm:border-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-widest shadow-[2px_2px_0_#111111] sm:shadow-[4px_4px_0_#111111]", toneMap[tone], className)}>
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
  return <div className={cn("bw-card p-4 sm:p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0_#111111] bg-white", className)}>{children}</div>;
}

export function CourseMetaRow({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-600", className)}>{items}</div>;
}

export function ActionRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
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
    <div className={cn("overflow-hidden rounded-[24px] sm:rounded-[32px] border-4 border-black bg-white shadow-[8px_8px_0_#111111]", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base font-medium">
          <thead className="bg-[#ffe500] border-b-4 border-black">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-5 text-left text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-950 whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-black/10">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-[#fff4d6] transition-colors group">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-5 align-top text-slate-800">
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
    <div className="grid gap-8 lg:gap-12 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-8 lg:space-y-10">
        <div className="relative rounded-[40px] border-4 border-black bg-[#8ed8ff] p-8 sm:p-10 shadow-[8px_8px_0_#111111] overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
             <div className="w-64 h-64 border-8 border-black rounded-full mix-blend-overlay"></div>
          </div>
          <div className="relative z-10">
            <span className="eyebrow inline-block mb-4 bg-white text-black border-4 border-black shadow-[4px_4px_0_#111111] px-4 py-1.5 text-xs font-black tracking-widest">Guided Workflow</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight text-slate-950 mt-2">{title}</h1>
            {description ? <p className="mt-4 max-w-2xl text-base sm:text-lg font-bold text-slate-800 leading-relaxed">{description}</p> : null}
            
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isPast = index < activeStep;
                return (
                  <div
                    key={step}
                    className={cn(
                      "relative rounded-[24px] border-4 px-5 py-5 transition-all duration-300",
                      isActive
                        ? "border-black bg-[#ffe500] text-black shadow-[4px_4px_0_#111111] -translate-y-1"
                        : isPast 
                          ? "border-black bg-white text-slate-600 opacity-80"
                          : "border-black/20 bg-white/50 text-slate-500 border-dashed"
                    )}
                  >
                    <p className={cn("text-xs font-black uppercase tracking-widest", isActive ? "text-black" : "text-slate-500")}>Step {index + 1}</p>
                    <p className="mt-2 text-sm sm:text-base font-bold uppercase leading-tight">{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="relative rounded-[40px] border-4 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0_#111111]">
           {children}
        </div>
      </div>
      {aside ? <StickyAsideCard>{aside}</StickyAsideCard> : null}
    </div>
  );
}
