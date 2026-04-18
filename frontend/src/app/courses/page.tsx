"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "Mathematics","Physics","Chemistry","Biology","Programming","History",
  "English","Commerce","Arts","Data Science","Machine Learning",
  "Web Development","Backend Development","System Design",
];
const LEVELS = ["beginner","intermediate","advanced"];
const SORT_OPTIONS = [
  { value: "popular",    label: "Most Popular" },
  { value: "newest",     label: "Newest" },
  { value: "rating",     label: "Top Rated" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

const inputClass =
  "appearance-none bg-white border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer";

export default function CoursesPage() {
  const [search,      setSearch]      = useState("");
  const [category,   setCategory]    = useState("");
  const [level,      setLevel]       = useState("");
  const [sort,       setSort]        = useState("popular");
  const [page,       setPage]        = useState(1);
  const [filtersOpen,setFiltersOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courses", search, category, level, sort, page],
    queryFn: () =>
      courseApi.list({ search, category, level, sort, page, limit: 12 }).then((r) => r.data),
    staleTime: 30000,
  });

  const courses = data?.courses || [];
  const total   = data?.total   || 0;
  const pages   = data?.pages   || 1;

  const clearFilters = () => {
    setSearch(""); setCategory(""); setLevel(""); setSort("popular"); setPage(1);
  };
  const hasFilters = !!(search || category || level);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 tracking-tight">
            Browse Courses
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isError ? "Unable to load count" : `${total.toLocaleString()} courses available`}
          </p>
        </div>

        {/* Search + controls */}
        <div className="flex gap-3 mb-4 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses, topics, teachers..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              filtersOpen || hasFilters
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:block">Filters</span>
            {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={inputClass}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                      className={inputClass}
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</label>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                      className={inputClass}
                    >
                      <option value="">All Levels</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-2.5 rounded-xl hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" /> Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl aspect-[4/3] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-6 py-12 text-center max-w-md mx-auto">
            <p className="font-semibold text-gray-900">We couldn&apos;t load courses</p>
            <p className="text-sm text-gray-600 mt-2">Check your connection and try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold shadow-button-indigo"
            >
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="font-semibold text-lg text-gray-900">No courses found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isError && pages > 1 && (
          <div className="flex justify-center gap-1.5 mt-10">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                  p === page
                    ? "bg-indigo-600 text-white shadow-button-indigo"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
