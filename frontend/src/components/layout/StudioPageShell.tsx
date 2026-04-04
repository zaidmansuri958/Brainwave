"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/** Primary CTA — indigo shadow, hover lift, active press */
export const studioBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-button-indigo transition-all duration-200 hover:bg-indigo-700 hover:shadow-button-hover active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100";

export const studioBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50/80 active:scale-[0.98]";

export function LightStudioLayout({
  children,
  maxWidthClassName = "max-w-5xl",
  showFooter = true,
  dotGridOpacity = 0.35,
}: {
  children: ReactNode;
  maxWidthClassName?: string;
  showFooter?: boolean;
  dotGridOpacity?: number;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col relative">
      <div
        className="pointer-events-none absolute inset-0 bg-dot-grid"
        style={{ opacity: dotGridOpacity }}
        aria-hidden
      />
      <Navbar />
      <main className={`relative z-10 flex-1 ${maxWidthClassName} mx-auto px-4 py-10 w-full`}>{children}</main>
      {showFooter && <Footer />}
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-10 ${className}`}
    >
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className={`font-display font-extrabold text-3xl sm:text-4xl tracking-tight ${
              titleGradient ? "text-gradient-indigo" : "text-gray-900"
            }`}
          >
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {action}
      </div>
    </motion.div>
  );
}

export function StudioBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
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
  accentClass = "text-indigo-500",
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="group block h-full rounded-2xl border border-gray-100/90 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/80 hover:shadow-card-hover"
      >
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 ${accentClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-semibold text-gray-900 group-hover:text-indigo-950 transition-colors line-clamp-2">{title}</p>
        <p className="mt-3 text-lg font-bold text-gray-900 tabular-nums">{price}</p>
        <p className="mt-3 text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
          View details →
        </p>
      </Link>
    </motion.div>
  );
}

export function CatalogSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card overflow-hidden animate-pulse"
        >
          <div className="h-11 w-11 rounded-xl bg-gray-100 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
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
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-8 py-16 text-center shadow-card"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50">
        <Icon className="h-7 w-7 text-indigo-300" />
      </div>
      <p className="font-display font-bold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
