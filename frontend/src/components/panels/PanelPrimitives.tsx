"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PanelPage({
  children,
  maxWidth = "max-w-7xl",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <main className={cn("panel-page relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 pt-10", maxWidth)}>
      {children}
    </main>
  );
}

export function PanelHero({
  eyebrow,
  title,
  description,
  action,
  chips,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  chips?: string[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="relative overflow-hidden rounded-[40px] border-4 border-black bg-[#fffdf7] p-8 shadow-[8px_8px_0_#111111] sm:p-12"
    >
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" aria-hidden />
      
      {/* Background brutalist decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[12px] border-[#ffe500] opacity-30 pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 h-40 w-40 border-[8px] border-[#8ed8ff] rotate-12 opacity-30 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          {eyebrow ? (
            <span className="eyebrow inline-block mb-6 bg-[#ff6b00] text-white border-4 border-black shadow-[4px_4px_0_#111111] px-4 py-2 text-sm font-black tracking-[0.2em]">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tight text-slate-950">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl font-medium leading-relaxed text-slate-700">{description}</p>
          {chips?.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {chips.map((chip) => (
                <span key={chip} className="inline-flex items-center rounded-full border-4 border-black bg-white px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-widest text-slate-950 shadow-[4px_4px_0_#111111]">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap gap-4 mt-8 lg:mt-0">{action}</div> : null}
      </div>
    </motion.section>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "blue",
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "blue" | "green" | "amber" | "rose" | "violet" | "orange";
  href?: string;
}) {
  const toneClass = {
    blue: "bg-[#8ed8ff] text-black",
    green: "bg-[#7dde92] text-black",
    amber: "bg-[#ffe500] text-black",
    rose: "bg-[#f7a8d8] text-black",
    violet: "bg-[#fff6a8] text-black",
    orange: "bg-[#ff6b00] text-white",
  }[tone];

  const content = (
    <motion.div 
      whileHover={{ y: -6, x: -6, boxShadow: "12px 12px 0px #111111" }}
      className="relative flex flex-col h-full rounded-[32px] border-4 border-black bg-white p-6 shadow-[6px_6px_0_#111111] transition-all duration-300"
    >
      <div className={cn("mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] border-4 border-black shadow-[4px_4px_0_#111111]", toneClass)}>
        <Icon className="h-8 w-8" strokeWidth={2.5} />
      </div>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter text-slate-950">{value}</p>
      {hint ? (
        <div className="mt-auto pt-4">
          <p className="text-sm font-bold text-slate-600 bg-slate-100 inline-block px-3 py-1.5 rounded-full">{hint}</p>
        </div>
      ) : null}
    </motion.div>
  );

  return href ? <Link href={href} className="block h-full">{content}</Link> : content;
}

export function PanelCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[32px] sm:rounded-[40px] border-4 border-black bg-white p-6 sm:p-10 shadow-[8px_8px_0_#111111]", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-[0.9] tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-3 text-base sm:text-lg font-medium leading-relaxed text-slate-600">{description}</p> : null}
      </div>
      {href && cta ? (
        <Link href={href} className="inline-flex shrink-0 items-center gap-2 rounded-full border-4 border-black bg-white px-5 py-2.5 text-sm font-black uppercase tracking-widest text-slate-950 shadow-[4px_4px_0_#111111] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#111111] hover:bg-[#ffe500] transition-all">
          {cta}
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
      ) : null}
    </div>
  );
}
