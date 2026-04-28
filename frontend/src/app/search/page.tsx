"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import api from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppShell, EmptyStatePanel, FilterToolbar, SectionHeader, StatusBadge } from "@/components/ui/app-shell";

const LEVELS = ["beginner", "intermediate", "advanced"];
const SORT_OPTIONS = [
  { label: "Most Relevant", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Enrolled", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [level, setLevel] = useState(searchParams.get("level") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", query, level, category, sortBy, maxPrice],
    queryFn: () =>
      api
        .get("/courses/search", {
          params: {
            q: query || undefined,
            level: level || undefined,
            category: category || undefined,
            sort_by: sortBy,
            max_price: maxPrice || undefined,
          },
        })
        .then((response) => response.data),
    enabled: Boolean(query || level || category),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (level) params.set("level", level);
      if (category) params.set("category", category);
      if (sortBy !== "relevance") params.set("sort", sortBy);
      if (maxPrice) params.set("max_price", maxPrice);
      router.push(`/search?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [category, level, maxPrice, query, router, sortBy]);

  const courses = data?.courses || data || [];
  const total = data?.total || courses.length;

  return (
    <AppShell>
      <Navbar />
      <main className="bw-shell space-y-6 pb-6">
        <FilterToolbar className="bw-band bw-band-muted p-5 sm:p-7">
          <SectionHeader
            eyebrow="Search"
            title="Search now works like a guided discovery surface."
            description="Instead of a lonely input on a wide page, search combines structured filters, active state chips, and denser result framing."
          />
          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, topics, skills..."
                className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-2 rounded-[1.25rem] border px-4 py-3 text-sm font-semibold transition ${
                showFilters ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:text-slate-950"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Level</label>
                <select value={level} onChange={(event) => setLevel(event.target.value)} className="w-full rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-slate-900 outline-none">
                  <option value="">All Levels</option>
                  {LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Category</label>
                <input value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-slate-900 outline-none" placeholder="e.g. Programming" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Max Price</label>
                <input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="w-full rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-slate-900 outline-none" placeholder="No limit" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Sort By</label>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-slate-900 outline-none">
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </FilterToolbar>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-extrabold text-slate-950">
                {isFetching ? "Searching..." : query || level || category ? `${total} results` : "Start a search"}
              </p>
              <p className="text-sm text-slate-500">
                {query || level || category
                  ? "Results are shown in denser cards with stronger context and clearer pricing."
                  : "Use search to find courses, topics, teachers, and skill paths."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {query ? <StatusBadge tone="neutral">Query: {query}</StatusBadge> : null}
              {level ? <StatusBadge tone="warning">{level}</StatusBadge> : null}
              {category ? <StatusBadge tone="info">{category}</StatusBadge> : null}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : !(query || level || category) ? (
            <EmptyStatePanel title="Start searching" description="Type a keyword or open the filters to find topics, teachers, or learning paths." icon={Search} />
          ) : courses.length === 0 ? (
            <EmptyStatePanel title="No courses found" description="Try broader keywords, remove filters, or increase the max price range." icon={Search} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
