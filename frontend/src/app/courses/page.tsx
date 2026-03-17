"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["Mathematics", "Physics", "Chemistry", "Biology", "Programming", "History", "English", "Commerce", "Arts"];
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

  const hasFilters = search || category || level;

  return (
    <div className="app-shell flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 glass-panel p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Browse Courses</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total.toLocaleString()} courses available</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses, topics, teachers..."
              className="modern-input pl-10 pr-4"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="modern-btn-secondary px-4 py-3"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:block">Filters</span>
            {hasFilters && <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5">•</span>}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="modern-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {filtersOpen && (
          <div className="glass-panel p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="modern-select w-full px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                className="modern-select w-full px-3 py-2 text-sm"
              >
                <option value="">All Levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-panel text-center py-20 text-slate-500 dark:text-slate-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No courses found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  p === page
                    ? "bg-primary-600 text-white"
                    : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
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
