"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell, EmptyStatePanel, FilterToolbar, SectionHeader, StatusBadge } from "@/components/ui/app-shell";

const CATEGORIES = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Programming",
  "History",
  "English",
  "Commerce",
  "Arts",
  "Data Science",
  "Machine Learning",
  "Web Development",
  "Backend Development",
  "System Design",
];

const LEVELS = ["beginner", "intermediate", "advanced"];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courses", search, category, level, sort, page],
    queryFn: () => courseApi.list({ search, category, level, sort, page, limit: 12 }).then((response) => response.data),
    staleTime: 30000,
  });

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const hasFilters = Boolean(search || category || level);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setSort("popular");
    setPage(1);
  };

  return (
    <AppShell>
      <Navbar />
      <main className="bw-shell space-y-6 pb-6">
        <FilterToolbar className="bw-band bw-band-muted p-5 sm:p-7">
          <SectionHeader
            eyebrow="Marketplace"
            title="Browse premium learning experiences with stronger context."
            description="The marketplace now uses denser filters, category shortcuts, richer course cards, and clearer result framing so users can scan faster without feeling overwhelmed."
          />

          <div className="mt-7 flex flex-wrap gap-2">
            {["Programming", "Data Science", "Mathematics", "Commerce", "Machine Learning"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setCategory(chip);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === chip ? "bg-slate-950 text-white" : "bg-white text-slate-600 hover:text-slate-950"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search courses, topics, teachers..."
                className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-2 rounded-[1.25rem] border px-4 py-3 text-sm font-semibold transition ${
                filtersOpen || hasFilters
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-950"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <div className="relative min-w-[200px]">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full appearance-none rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Category</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(event) => {
                          setCategory(event.target.value);
                          setPage(1);
                        }}
                        className="w-full appearance-none rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 pr-10 text-sm text-slate-900 outline-none"
                      >
                        <option value="">All Categories</option>
                        {CATEGORIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Level</label>
                    <div className="relative">
                      <select
                        value={level}
                        onChange={(event) => {
                          setLevel(event.target.value);
                          setPage(1);
                        }}
                        className="w-full appearance-none rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 pr-10 text-sm text-slate-900 outline-none"
                      >
                        <option value="">All Levels</option>
                        {LEVELS.map((item) => (
                          <option key={item} value={item}>
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    {hasFilters ? (
                      <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        <X className="h-4 w-4" />
                        Clear filters
                      </button>
                    ) : (
                      <div className="rounded-[1rem] bg-[#fcf8f3] px-4 py-3 text-sm text-slate-500">Use filters to tighten discovery.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </FilterToolbar>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-extrabold text-slate-950">{isError ? "Results unavailable" : `${total.toLocaleString()} courses`}</p>
              <p className="text-sm text-slate-500">Cards carry more context now, so decisions can happen faster above the fold.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {category ? <StatusBadge tone="info">{category}</StatusBadge> : null}
              {level ? <StatusBadge tone="warning">{level}</StatusBadge> : null}
              {search ? <StatusBadge tone="neutral">Search: {search}</StatusBadge> : null}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bw-card h-[360px] animate-pulse bg-white/70" />
              ))}
            </div>
          ) : isError ? (
            <EmptyStatePanel
              title="We couldn&apos;t load courses"
              description="The redesigned marketplace is ready, but the course list could not be fetched right now."
              action={
                <button type="button" onClick={() => refetch()} className="bw-action-primary">
                  Retry
                </button>
              }
            />
          ) : courses.length === 0 ? (
            <EmptyStatePanel title="No courses found" description="Try adjusting your search, category, or level filters to widen the result set." />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {pages > 1 ? (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {Array.from({ length: Math.min(pages, 10) }, (_, index) => index + 1).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPage(value)}
                      className={`h-11 w-11 rounded-full text-sm font-semibold transition ${
                        page === value ? "bg-slate-950 text-white" : "bg-white text-slate-600 hover:bg-[#f8f2eb] hover:text-slate-950"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}
