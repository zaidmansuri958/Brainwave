"use client";

import Link from "next/link";
import { ClipboardList, BookOpen, Timer, HelpCircle, ArrowRight, Award } from "lucide-react";

export interface MockTestPackageCard {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  teacher_name?: string | null;
  papers_count?: number;
  total_duration_minutes?: number;
  total_questions?: number;
  total_marks?: number;
}

function fmtRupee(n: number) {
  if (!n || n === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDuration(m?: number) {
  if (!m) return null;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

export function MockTestCard({ pkg }: { pkg: MockTestPackageCard }) {
  const isFree = !pkg.price || pkg.price === 0;
  const duration = fmtDuration(pkg.total_duration_minutes);

  return (
    <Link
      href={`/catalog/mock-tests/${pkg.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
    >
      {/* Purple header band */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] p-4">
        {/* Decorative glow */}
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-violet-500/30 blur-2xl" />
        <div className="absolute -bottom-10 left-8 h-20 w-20 rounded-full bg-indigo-400/20 blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              isFree
                ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30"
                : "bg-white text-violet-700"
            }`}
          >
            {fmtRupee(pkg.price)}
          </span>
        </div>

        <span className="absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-200 ring-1 ring-white/15">
          Mock Test
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-violet-700">
          {pkg.title}
        </h3>

        {pkg.teacher_name && (
          <p className="mb-2 text-xs text-gray-400">by {pkg.teacher_name}</p>
        )}

        {pkg.description && (
          <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">
            {pkg.description}
          </p>
        )}

        {/* Meta chips */}
        <div className="mb-4 mt-auto flex flex-wrap gap-1.5">
          {(pkg.papers_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
              <BookOpen className="h-3 w-3" />
              {pkg.papers_count} {pkg.papers_count === 1 ? "paper" : "papers"}
            </span>
          )}
          {duration && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
              <Timer className="h-3 w-3" />
              {duration}
            </span>
          )}
          {(pkg.total_questions ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
              <HelpCircle className="h-3 w-3" />
              {pkg.total_questions} Qs
            </span>
          )}
          {(pkg.total_marks ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
              <Award className="h-3 w-3" />
              {pkg.total_marks} marks
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs font-semibold text-gray-400 group-hover:text-violet-600">
            View Package
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all group-hover:bg-violet-600 group-hover:text-white">
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
