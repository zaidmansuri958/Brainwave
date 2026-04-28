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
    <main className={cn("panel-page relative z-10 mx-auto w-full px-4 pb-14 pt-8 sm:px-6 lg:px-8", maxWidth)}>
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="panel-surface relative overflow-hidden rounded-[2rem] border-2 border-black bg-[#fffdf7] p-6 shadow-[6px_6px_0_#111111] sm:p-8"
    >
      <div className="panel-grid absolute inset-0 opacity-30" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="max-w-3xl font-display text-4xl font-black uppercase tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          {chips?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="bw-chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
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
  tone?: "blue" | "green" | "amber" | "rose" | "violet";
  href?: string;
}) {
  const toneClass = {
    blue: "bg-[#8ed8ff] text-sky-900",
    green: "bg-[#7dde92] text-green-900",
    amber: "bg-[#ffe500] text-black",
    rose: "bg-[#f7a8d8] text-rose-900",
    violet: "bg-[#fff6a8] text-black",
  }[tone];

  const content = (
    <div className="panel-card rounded-[1.6rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0_#111111] transition duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]">
      <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] border-2 border-black", toneClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function PanelCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("panel-card rounded-[1.75rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0_#111111] sm:p-6", className)}>{children}</section>;
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
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {href && cta ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-extrabold uppercase text-slate-950">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
