"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { CourseCard } from "@/components/course/CourseCard";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

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
      api.get("/courses/search", {
        params: {
          q: query || undefined,
          level: level || undefined,
          category: category || undefined,
          sort_by: sortBy,
          max_price: maxPrice || undefined,
        },
      }).then((r) => r.data),
    enabled: !!query || !!level || !!category,
  });

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (level) params.set("level", level);
    if (category) params.set("category", category);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (maxPrice) params.set("max_price", maxPrice);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timeout = setTimeout(updateUrl, 500);
    return () => clearTimeout(timeout);
  }, [query, level, category, sortBy, maxPrice]);

  const courses = data?.courses || data || [];
  const total = data?.total || courses.length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics, skills..."
                className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-800"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters ? "bg-primary-600 border-primary-500 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Levels</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Programming"
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Max Price (INR)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="No limit"
                    min={0}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(level || category || maxPrice) && (
                <button
                  onClick={() => { setLevel(""); setCategory(""); setMaxPrice(""); }}
                  className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {query || level || category ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">
                {isFetching ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                  </span>
                ) : (
                  `${total} result${total !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}`
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-72 bg-gray-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-24">
                <Search className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-semibold">No courses found</p>
                <p className="text-gray-500 text-sm mt-1">Try different keywords or remove some filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <Search className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">Start searching</p>
            <p className="text-gray-500 text-sm mt-1">Type a keyword to find courses, topics, or skills</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
