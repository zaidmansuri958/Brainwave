"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Mathematics", "Physics", "Chemistry", "Biology", "Programming", "History", "English", "Commerce", "Arts", "Data Science", "Machine Learning", "Web Development", "Backend Development", "System Design"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["courses", search, category, level, sort, page],
    queryFn: () =>
      courseApi.list({ search, category, level, sort, page, limit: 12 }).then((r) => r.data),
    staleTime: 30000,
  });

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setSort("popular");
    setPage(1);
  };

  const hasFilters = !!(search || category || level);

  const selectClass = "appearance-none bg-[#0C1526] border border-white/[0.08] text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-white/[0.14]";

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Browse Courses</h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {total.toLocaleString()} courses available
          </p>
        </div>

        {/* Search + Controls Row */}
        <div className="flex gap-3 mb-4 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses, topics, teachers..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0C1526] border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-600 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              filtersOpen || hasFilters
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                : "bg-[#0C1526] border-white/[0.08] text-slate-400 hover:border-white/[0.14] hover:text-slate-300"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:block">Filters</span>
            {hasFilters && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={selectClass}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0C1526]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-[#0C1526] border border-white/[0.08] rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                      className={selectClass}
                    >
                      <option value="" className="bg-[#0C1526]">All Categories</option>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0C1526]">{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Level</label>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                      className={selectClass}
                    >
                      <option value="" className="bg-[#0C1526]">All Levels</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l} className="bg-[#0C1526]">
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2.5 rounded-xl hover:bg-red-500/5"
                  >
                    <X className="h-3.5 w-3.5" /> Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#0C1526] rounded-2xl aspect-[4/3] animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <div className="h-16 w-16 rounded-2xl bg-[#0C1526] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-white font-semibold text-lg">No courses found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                  p === page
                    ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-[#0C1526] border border-white/[0.08] text-slate-400 hover:border-white/[0.14] hover:text-slate-200"
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
