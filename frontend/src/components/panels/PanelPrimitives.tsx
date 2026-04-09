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
      className="panel-surface relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
    >
      <div className="panel-grid absolute inset-0 opacity-30" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          {chips?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="panel-chip">
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
    blue: "from-sky-500/15 to-blue-500/5 text-sky-700",
    green: "from-emerald-500/15 to-lime-500/5 text-emerald-700",
    amber: "from-amber-500/15 to-orange-500/5 text-amber-700",
    rose: "from-rose-500/15 to-pink-500/5 text-rose-700",
    violet: "from-violet-500/15 to-fuchsia-500/5 text-violet-700",
  }[tone];

  const content = (
    <div className="panel-card rounded-[1.6rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(15,23,42,0.11)]">
      <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br", toneClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
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
  return <section className={cn("panel-card rounded-[1.75rem] p-5 sm:p-6", className)}>{children}</section>;
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
        <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {href && cta ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
