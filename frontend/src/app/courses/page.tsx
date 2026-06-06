"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, BookOpen, Loader2 } from "lucide-react";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const CATEGORIES = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Programming",
  "History", "English", "Commerce", "Data Science", "Machine Learning",
  "Web Development", "Design",
];

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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courses", search, category, level, sort, page],
    queryFn: () => courseApi.list({ search, category, level, sort, page, limit: 12 }).then((r) => r.data),
    staleTime: 30000,
  });

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const hasFilters = Boolean(search || category || level);

  const clearFilters = () => { setSearch(""); setCategory(""); setLevel(""); setSort("popular"); setPage(1); };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="page-container">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Courses</h1>
          <p className="text-gray-500">Explore {total > 0 ? `${total}+` : "our"} courses across all subjects and levels</p>

          {/* Search + sort bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search courses, teachers, topics..."
                className="input pl-10"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((p) => !p)}
              className={`btn btn-md flex items-center gap-2 shrink-0 ${filtersOpen || hasFilters ? "btn-primary" : "btn-secondary"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {hasFilters ? `(${[category, level].filter(Boolean).length})` : ""}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input shrink-0 sm:w-48 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <div className="mt-4 card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input">
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Level</label>
                <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="input">
                  <option value="">All Levels</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="btn btn-md btn-secondary flex items-center gap-2 w-full justify-center">
                    <X className="h-4 w-4" /> Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick category chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {["Programming", "Data Science", "Mathematics", "Design", "Commerce"].map((chip) => (
              <button key={chip} type="button"
                onClick={() => { setCategory(category === chip ? "" : chip); setPage(1); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  category === chip
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}>
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="flex-1 page-container py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {isLoading ? "Loading..." : isError ? "Error loading courses" : `${total.toLocaleString()} courses found`}
          </p>
          <div className="flex flex-wrap gap-2">
            {category && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{category}</span>}
            {level && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium capitalize">{level}</span>}
            {search && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">"{search}"</span>}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-gray-100 rounded-t-xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="card p-16 text-center">
            <p className="text-gray-600 font-medium mb-3">Couldn&apos;t load courses</p>
            <button type="button" onClick={() => refetch()} className="btn btn-md btn-primary">Retry</button>
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-16 text-center">
            <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No courses found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="btn btn-md btn-secondary mt-4">Clear filters</button>}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {page > 1 && (
                  <button type="button" onClick={() => setPage(p => p - 1)} className="btn btn-md btn-secondary">← Prev</button>
                )}
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)}
                    className={`btn btn-md ${page === p ? "btn-primary" : "btn-secondary"} w-10 justify-center`}>
                    {p}
                  </button>
                ))}
                {page < pages && (
                  <button type="button" onClick={() => setPage(p => p + 1)} className="btn btn-md btn-secondary">Next →</button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
