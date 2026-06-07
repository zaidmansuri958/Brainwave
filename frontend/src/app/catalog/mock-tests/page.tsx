"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { mockTestsApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ClipboardList, Loader2, Search, Timer,
  BookOpen, IndianRupee, ArrowRight, Brain,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

function fmtRupee(n: number) {
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function MockTestsCatalogPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["mock-catalog"],
    queryFn:  () => mockTestsApi.catalog().then(r => r.data),
  });

  const allPackages: any[] = data?.packages || [];
  const packages = allPackages.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <Brain className="h-3.5 w-3.5 text-white/80" />
            </div>
            <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">Practice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Mock Test Packages</h1>
          <p className="text-violet-200 text-base max-w-xl mb-8">
            Timed papers with structured sections — instant scoring and detailed analysis when you submit.
          </p>
          {/* Search */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 max-w-md backdrop-blur-sm">
            <Search className="h-4 w-4 text-white/60 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search test packages…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none" />
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
              <ClipboardList className="h-8 w-8 text-violet-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">
              {search ? "No packages match your search" : "No mock test packages yet"}
            </p>
            <p className="text-sm text-gray-500">
              {search ? "Try a different keyword" : "Teachers are working on it — check back soon!"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                <strong className="text-gray-900">{packages.length}</strong> package{packages.length !== 1 ? "s" : ""} available
              </p>
              <Link href="/dashboard" className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                My tests <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((p: any, i: number) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}>
                  <Link href={`/catalog/mock-tests/${p.slug}`}
                    className="group flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all h-full overflow-hidden">

                    {/* Card top */}
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 px-5 py-6 border-b border-gray-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-violet-100 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <ClipboardList className="h-6 w-6 text-violet-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-violet-700 transition-colors">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                      )}
                    </div>

                    {/* Card bottom */}
                    <div className="px-5 py-4 flex items-center justify-between mt-auto">
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
                      <span className={`text-sm font-extrabold ${p.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                        {fmtRupee(p.price)}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
