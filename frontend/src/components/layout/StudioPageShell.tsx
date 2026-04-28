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
  "neo-primary-btn rounded-full";

export const studioBtnSecondary =
  "neo-secondary-btn rounded-full";

export function LightStudioLayout({
  children,
  maxWidthClassName = "max-w-5xl",
  showFooter = true,
}: {
  children: ReactNode;
  maxWidthClassName?: string;
  showFooter?: boolean;
  dotGridOpacity?: number;
}) {
  return (
    <div className="bw-page flex min-h-screen flex-col">
      <Navbar />
      <main className={cn("bw-shell relative z-10 flex-1 pb-6", maxWidthClassName)}>{children}</main>
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("bw-band bw-band-muted mb-6", className)}
    >
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn("font-display text-3xl font-extrabold uppercase sm:text-4xl", titleGradient ? "text-[#ff6b00]" : "text-slate-950")}>
            {title}
          </h1>
          {description ? <p className="bw-muted mt-3 max-w-2xl text-sm leading-7 sm:text-base">{description}</p> : null}
        </div>
        {action}
      </div>
    </motion.div>
  );
}

export function StudioBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4">
      <Link href={href} className="neo-secondary-btn rounded-full px-4 py-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className="bw-card group block h-full p-5 transition duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]">
        <div className={`neo-icon-badge mb-4 h-11 w-11 bg-[#fff4d6] ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-display text-lg font-bold uppercase text-slate-950 transition group-hover:text-[#ff6b00]">{title}</p>
        <p className="mt-3 text-2xl font-extrabold uppercase text-slate-950">{price}</p>
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">View details</p>
      </Link>
    </motion.div>
  );
}

export function CatalogSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bw-card h-40 animate-pulse bg-white/70 p-5" />
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="bw-card-soft border-dashed px-8 py-14 text-center"
    >
      <div className="neo-icon-badge mx-auto mb-4 h-14 w-14 bg-[#8ed8ff] text-black">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-display text-lg font-bold uppercase text-slate-950">{title}</p>
      {description ? <p className="bw-muted mx-auto mt-2 max-w-sm text-sm leading-7">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
