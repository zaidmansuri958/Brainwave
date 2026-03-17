"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics, skills..."
                variant="glass"
                icon={<Search className="h-4 w-4" />}
                className="h-12"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "default" : "glass"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 h-12"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 glass-card p-5 animate-slide-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">All Levels</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Category</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Programming"
                    variant="glass"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Max Price</label>
                  <Input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="No limit"
                    min={0}
                    variant="glass"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
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
                  className="mt-3 text-xs text-primary-500 hover:text-primary-400 transition-colors font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {query || level || category ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground text-sm">
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
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="glass-card h-72 animate-pulse">
                    <div className="h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-24 glass-card rounded-3xl">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-foreground text-lg font-semibold">No courses found</p>
                <p className="text-muted-foreground text-sm mt-1">Try different keywords or remove some filters</p>
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
          <div className="text-center py-24 glass-card rounded-3xl">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-semibold">Start searching</p>
            <p className="text-muted-foreground text-sm mt-1">Type a keyword to find courses, topics, or skills</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
