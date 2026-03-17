"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, SlidersHorizontal, X, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-4">
            Explore
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Browse <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-muted-foreground mt-2">{total.toLocaleString()} courses available</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses, topics, teachers..."
              variant="glass"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button
            variant={filtersOpen ? "default" : "glass"}
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:block">Filters</span>
            {hasFilters && (
              <span className="h-2 w-2 rounded-full gradient-bg" />
            )}
          </Button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {filtersOpen && (
          <div className="glass-card p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Level</label>
                <select
                  value={level}
                  onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">All Levels</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              {hasFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" /> Clear filters
                  </button>
                </div>
              )}
            </div>

            {(category || level) && (
              <div className="flex gap-2 mt-4">
                {category && (
                  <Badge variant="default" className="gap-1">
                    {category}
                    <button onClick={() => setCategory("")} className="hover:text-foreground ml-1">&times;</button>
                  </Badge>
                )}
                {level && (
                  <Badge variant="default" className="gap-1">
                    {level}
                    <button onClick={() => setLevel("")} className="hover:text-foreground ml-1">&times;</button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card aspect-[4/3] animate-pulse">
                <div className="h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 glass-card">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">No courses found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-10 w-10 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  p === page
                    ? "gradient-bg text-white shadow-glow"
                    : "glass hover:bg-accent text-muted-foreground"
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
