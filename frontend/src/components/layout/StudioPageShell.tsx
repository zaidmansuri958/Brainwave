"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

export const studioBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-[#ffe500] px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-[4px_4px_0_#111111] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#111111]";

export const studioBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-[4px_4px_0_#111111] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#8ed8ff] hover:shadow-[6px_6px_0_#111111]";

export function LightStudioLayout({
  children,
  maxWidthClassName = "max-w-[1400px]",
  showFooter = true,
}: {
  children: ReactNode;
  maxWidthClassName?: string;
  showFooter?: boolean;
  dotGridOpacity?: number;
}) {
  return (
    <div className="bw-page flex min-h-screen flex-col bg-[#fffdf7]">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <Navbar />
      <main className={cn("relative z-10 flex-1 px-4 sm:px-6 lg:px-8 pb-20 pt-8 mx-auto w-full", maxWidthClassName)}>
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}

export function StudioHero({
  eyebrow,
  title,
  titleGradient = false,
  description,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  titleGradient?: boolean;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn("relative overflow-hidden rounded-[32px] sm:rounded-[40px] border-4 border-black bg-[#fff4d6] p-8 sm:p-12 shadow-[8px_8px_0_#111111] mb-10", className)}
    >
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      {eyebrow ? (
        <span className="eyebrow inline-block mb-6 bg-white text-black border-4 border-black shadow-[4px_4px_0_#111111] px-4 py-2 text-sm font-black tracking-widest">
          {eyebrow}
        </span>
      ) : null}
      
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <h1 className={cn("font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight", titleGradient ? "text-[#ff6b00]" : "text-slate-950")}>
            {title}
          </h1>
          {description ? <p className="mt-6 max-w-2xl text-lg sm:text-xl font-medium leading-relaxed text-slate-700">{description}</p> : null}
        </div>
        {action ? <div className="mt-8 lg:mt-0 flex shrink-0">{action}</div> : null}
      </div>
    </motion.div>
  );
}

export function StudioBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-8 inline-block">
      <Link href={href} className="inline-flex items-center gap-2 rounded-full border-4 border-black bg-white px-5 py-2.5 text-sm font-black uppercase tracking-widest text-slate-950 shadow-[4px_4px_0_#111111] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#8ed8ff] hover:shadow-[6px_6px_0_#111111]">
        <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        {children}
      </Link>
    </motion.div>
  );
}

export function CatalogProductCard({
  href,
  icon: Icon,
  title,
  price,
  accentClass = "text-[#ff6b00]",
  index = 0,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  price: string;
  accentClass?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.4 }}
    >
      <Link 
        href={href} 
        className="group relative flex flex-col h-full rounded-[32px] border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0_#111111] transition-all duration-300 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0_#111111]"
      >
        <div className={cn("mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] border-4 border-black bg-[#fff4d6] shadow-[4px_4px_0_#111111] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110", accentClass)}>
          <Icon className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="font-display text-2xl font-black uppercase leading-tight text-slate-950 transition-colors group-hover:text-[#ff6b00]">{title}</p>
        <div className="mt-auto pt-6 flex items-end justify-between">
          <p className="text-3xl font-black uppercase text-slate-950">{price}</p>
          <span className="inline-block rounded-full border-2 border-black bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors group-hover:bg-[#ffe500] group-hover:text-black">
            View
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function CatalogSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-[32px] border-4 border-black/10 bg-black/5 p-6" />
      ))}
    </div>
  );
}

export function EmptyStateWell({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="relative overflow-hidden rounded-[40px] border-4 border-black bg-white px-8 py-20 text-center shadow-[8px_8px_0_#111111]"
    >
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <div className="relative z-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border-4 border-black bg-[#ffe500] text-black shadow-[6px_6px_0_#111111]">
          <Icon className="h-10 w-10" strokeWidth={2.5} />
        </div>
        <p className="font-display text-3xl font-black uppercase tracking-tight text-slate-950">{title}</p>
        {description ? <p className="mx-auto mt-4 max-w-lg text-lg font-medium leading-relaxed text-slate-600">{description}</p> : null}
        {action ? <div className="mt-8">{action}</div> : null}
      </div>
    </motion.div>
  );
}
