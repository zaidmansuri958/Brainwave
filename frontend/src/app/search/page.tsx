"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, SlidersHorizontal, X, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const LEVELS = ["beginner", "intermediate", "advanced"];
const SORT_OPTIONS = [
  { label: "Most Relevant", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Enrolled", value: "popular" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
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
  const hasFilters = Boolean(query || level || category);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", query, level, category, sortBy, maxPrice],
    queryFn: () =>
      api.get("/courses/search", {
        params: { q: query || undefined, level: level || undefined, category: category || undefined, sort_by: sortBy, max_price: maxPrice || undefined },
      }).then((r) => r.data),
    enabled: hasFilters,
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="bg-gray-50 border-b border-gray-100 py-8">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics, teachers..."
                className="input pl-10 pr-8" autoFocus />
              {query && (
                <button type="button" onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button type="button" onClick={() => setShowFilters(p => !p)}
              className={`btn btn-md flex items-center gap-2 shrink-0 ${showFilters ? "btn-primary" : "btn-secondary"}`}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input shrink-0 sm:w-44 cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {showFilters && (
            <div className="mt-4 card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="input">
                  <option value="">All Levels</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className="input" placeholder="e.g. Programming" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Max Price (₹)</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input" placeholder="No limit" />
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 page-container py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {isFetching ? "Searching..." : hasFilters ? `${total} results` : "Enter a keyword to search"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {query && <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">"{query}"</span>}
            {level && <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium capitalize">{level}</span>}
            {category && <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">{category}</span>}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !hasFilters ? (
          <div className="card p-16 text-center max-w-md mx-auto">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-blue-400" />
            </div>
            <p className="font-semibold text-gray-700">Search courses, teachers, topics</p>
            <p className="text-sm text-gray-400 mt-1">Type a keyword above to find what you&apos;re looking for.</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-16 text-center max-w-md mx-auto">
            <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No courses found</p>
            <p className="text-sm text-gray-400 mt-1">Try broader keywords or adjust filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
