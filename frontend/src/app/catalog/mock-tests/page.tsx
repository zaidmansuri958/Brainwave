"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { mockTestsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ClipboardList, Loader2, Search, Timer,
  BookOpen, ArrowRight, Brain, Zap, Trophy,
  CheckCircle2, SlidersHorizontal, X,
} from "lucide-react";
import { useState } from "react";

function fmtRupee(n: number) {
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

type Filter = "all" | "free" | "paid";

export default function MockTestsCatalogPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["mock-catalog"],
    queryFn: () => mockTestsApi.catalog().then((r) => r.data),
  });

  const all: any[] = data?.packages || [];
  const packages = all.filter((p) => {
    const q = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const f =
      filter === "free" ? p.price === 0 :
      filter === "paid" ? p.price > 0 : true;
    return q && f;
  });

  const freeCount = all.filter((p) => p.price === 0).length;

  return (
    <DashboardLayout
      title="Mock Test Packages"
      subtitle="Timed, exam-style papers with instant scoring and performance analytics"
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: ClipboardList, label: "Total Packages",  value: all.length,  color: "blue"   },
          { icon: Zap,           label: "Free Packages",   value: freeCount,   color: "green"  },
          { icon: Trophy,        label: "Avg Papers/Pack", value: all.length ? Math.round(all.reduce((s, p) => s + (p.papers_count || 0), 0) / all.length) : 0, color: "purple" },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
              s.color === "blue"   ? "bg-blue-50 text-blue-600" :
              s.color === "green"  ? "bg-green-50 text-green-600" :
              "bg-purple-50 text-purple-600"
            }`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test packages…"
            className="input !pl-10"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(["all", "free", "paid"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-md capitalize ${filter === f ? "btn-primary" : "btn-secondary"}`}
            >
              {f}
            </button>
          ))}
          {(search || filter !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="btn btn-md btn-secondary flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          {packages.length} package{packages.length !== 1 ? "s" : ""} found
          {filter !== "all" && <span className="ml-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{filter}</span>}
          {search && <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">"{search}"</span>}
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-2 bg-gray-100 rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="card p-16 text-center">
          <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 mb-1">
            {search || filter !== "all" ? "No packages match your filters" : "No test packages yet"}
          </p>
          <p className="text-sm text-gray-400">
            {search || filter !== "all"
              ? "Try adjusting your search or filter"
              : "Teachers are building packages — check back soon!"}
          </p>
          {(search || filter !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="btn btn-md btn-secondary mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p: any) => (
            <Link
              key={p.id}
              href={`/catalog/mock-tests/${p.slug}`}
              className="card group hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Accent top bar */}
              <div className="h-1 bg-gradient-to-r from-violet-500 to-blue-500" />

              <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 shrink-0">
                    <ClipboardList className="h-5 w-5 text-violet-600" />
                  </div>
                  <span className={`text-sm font-bold ${p.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                    {fmtRupee(p.price)}
                  </span>
                </div>

                {/* Title + desc */}
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-violet-700 transition-colors">
                  {p.title}
                </h3>
                {p.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{p.description}</p>
                )}

                {/* Footer meta */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {p.papers_count > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {p.papers_count} paper{p.papers_count !== 1 ? "s" : ""}
                      </span>
                    )}
                    {p.total_duration_minutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {p.total_duration_minutes} min
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Info strip */}
      {!isLoading && all.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Trophy,       color: "bg-amber-50 text-amber-600",  title: "Instant Results",       desc: "Score and full analysis right after submission" },
            { icon: CheckCircle2, color: "bg-green-50 text-green-600",  title: "Detailed Explanations", desc: "Every question has a full walkthrough" },
            { icon: Brain,        color: "bg-violet-50 text-violet-600", title: "Expert Crafted",       desc: "Questions by verified subject specialists" },
          ].map((f) => (
            <div key={f.title} className="card p-4 flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${f.color} shrink-0`}>
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
