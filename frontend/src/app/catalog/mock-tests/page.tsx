"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MockTestCard, type MockTestPackageCard } from "@/components/mock-tests/MockTestCard";
import {
  ClipboardList, Search, X, Home, ChevronRight,
  Trophy, Brain, CheckCircle2, Users, BarChart3, Zap, Sparkles,
} from "lucide-react";

type PriceFilter = "all" | "free" | "paid";
type Sort = "newest" | "price_asc" | "price_desc" | "papers";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "papers", label: "Most Papers" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function MockTestsCatalogPage() {
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const { data, isLoading } = useQuery({
    queryKey: ["mock-catalog"],
    queryFn: () => mockTestsApi.catalog().then((r) => r.data),
  });

  const all: MockTestPackageCard[] = data?.packages || [];

  const filtered = useMemo(() => {
    let list = all.filter((p) => {
      const q = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
      const f = price === "free" ? !p.price : price === "paid" ? p.price > 0 : true;
      return q && f;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price_asc": return (a.price || 0) - (b.price || 0);
        case "price_desc": return (b.price || 0) - (a.price || 0);
        case "papers": return (b.papers_count || 0) - (a.papers_count || 0);
        default: return 0; // newest — backend already returns recent-ish order
      }
    });
    return list;
  }, [all, search, price, sort]);

  const freeCount = all.filter((p) => !p.price).length;
  const totalPapers = all.reduce((s, p) => s + (p.papers_count || 0), 0);
  const totalQuestions = all.reduce((s, p) => s + (p.total_questions || 0), 0);
  const hasFilters = Boolean(search) || price !== "all";

  const clear = () => { setSearch(""); setPrice("all"); setSort("newest"); };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7ff]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">
        {/* Glows */}
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs font-medium text-violet-300">
            <Link href="/" className="flex items-center gap-1 hover:text-white"><Home className="h-3.5 w-3.5" /> Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Mock Tests</span>
          </nav>

          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> Exam-ready practice papers
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Ace your exam with <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">realistic mock tests</span>
            </h1>
            <p className="mt-4 text-base text-violet-200">
              Timed, full-length papers built by expert educators. Get instant scoring, negative marking,
              and detailed performance analytics — just like the real thing.
            </p>

            {/* Feature badges */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                { icon: Brain, label: "Expert Designed" },
                { icon: BarChart3, label: "Instant Analytics" },
                { icon: Trophy, label: "Latest Exam Pattern" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
                  <b.icon className="h-3.5 w-3.5 text-violet-300" /> {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Stat tiles */}
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ClipboardList, value: all.length, label: "Packages" },
              { icon: CheckCircle2, value: totalPapers, label: "Total Papers" },
              { icon: Zap, value: freeCount, label: "Free Packs" },
              { icon: Users, value: "50K+", label: "Students" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <s.icon className="mb-2 h-5 w-5 text-violet-300" />
                <p className="text-2xl font-extrabold text-white tabular-nums">{s.value}</p>
                <p className="text-xs text-violet-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mock test packages…"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Price toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
              {(["all", "free", "paid"] as PriceFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setPrice(f)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold capitalize transition-all ${
                    price === f ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-violet-400 sm:w-52"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {hasFilters && (
              <button
                onClick={clear}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-violet-300 hover:text-violet-700"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {!isLoading && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-gray-600">
              {filtered.length} package{filtered.length !== 1 ? "s" : ""} found
            </p>
            {price !== "all" && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold capitalize text-violet-700">{price}</span>}
            {search && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">&quot;{search}&quot;</span>}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="h-24 animate-pulse bg-gray-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-gray-200" />
            <p className="mb-1 font-semibold text-gray-700">
              {hasFilters ? "No packages match your filters" : "No mock tests yet"}
            </p>
            <p className="text-sm text-gray-400">
              {hasFilters ? "Try adjusting your search or filters" : "Teachers are building packages — check back soon!"}
            </p>
            {hasFilters && (
              <button onClick={clear} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              >
                <MockTestCard pkg={pkg} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Why practice with us strip */}
        {!isLoading && all.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Trophy, color: "bg-amber-50 text-amber-600", title: "Instant Results", desc: "Detailed score and analysis right after you submit" },
              { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", title: "Real Exam Pattern", desc: "Negative marking, sections & timing like the real test" },
              { icon: Brain, color: "bg-violet-50 text-violet-600", title: "Expert Crafted", desc: "Questions written by verified subject specialists" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{f.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
