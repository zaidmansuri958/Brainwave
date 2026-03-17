"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { CourseCard } from "@/components/course/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

  const { data, isLoading } = useQuery({
    queryKey: ["courses", search, category, level, sort, page],
    queryFn: () =>
      courseApi
        .list({ search, category, level, sort, page, limit: 12 })
        .then((r) => r.data),
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
    <div className="min-h-screen flex flex-col bg-[#030014]">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Dark Hero Header */}
        <FadeIn>
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[#030014]">
              <div className="absolute top-0 left-1/3 h-[400px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
              <div className="absolute top-0 right-1/4 h-[300px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
              <h1 className="text-3xl md:text-5xl font-bold text-white">
                <GradientText className="text-3xl md:text-5xl font-bold">
                  Browse Courses
                </GradientText>
              </h1>
              <p className="text-gray-400 mt-3 text-base md:text-lg">
                {total.toLocaleString()} courses available to fuel your learning
              </p>
            </div>
          </section>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Search Bar */}
          <FadeIn delay={0.1}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search courses, topics, teachers..."
                  className="pl-11 pr-4 h-12 rounded-xl text-base bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
              </div>
              <Select value={sort} onValueChange={(val) => setSort(val)}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white/5 border-white/10 text-gray-300 focus:ring-indigo-500/20">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-gray-300">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FadeIn>

          {/* Category Filter Pills */}
          <FadeIn delay={0.15}>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn(
                    "cursor-pointer px-3 py-1.5 text-sm transition-all select-none border",
                    !category
                      ? "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
                  )}
                  onClick={() => {
                    setCategory("");
                    setPage(1);
                  }}
                >
                  All
                </Badge>
                {CATEGORIES.map((c) => (
                  <Badge
                    key={c}
                    className={cn(
                      "cursor-pointer px-3 py-1.5 text-sm transition-all select-none border",
                      category === c
                        ? "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
                    )}
                    onClick={() => {
                      setCategory(category === c ? "" : c);
                      setPage(1);
                    }}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Level Filter Pills */}
          <FadeIn delay={0.2}>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500">Level</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn(
                    "cursor-pointer px-3 py-1.5 text-sm transition-all select-none border",
                    !level
                      ? "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
                  )}
                  onClick={() => {
                    setLevel("");
                    setPage(1);
                  }}
                >
                  All Levels
                </Badge>
                {LEVELS.map((l) => (
                  <Badge
                    key={l}
                    className={cn(
                      "cursor-pointer px-3 py-1.5 text-sm transition-all select-none border",
                      level === l
                        ? "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
                    )}
                    onClick={() => {
                      setLevel(level === l ? "" : l);
                      setPage(1);
                    }}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Active Filter Chips */}
          {hasFilters && (
            <FadeIn delay={0.25}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">
                  Active filters:
                </span>
                {search && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 pr-1.5 cursor-pointer border-white/10 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    Search: &quot;{search}&quot;
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {category && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 pr-1.5 cursor-pointer border-white/10 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    onClick={() => {
                      setCategory("");
                      setPage(1);
                    }}
                  >
                    {category}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {level && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 pr-1.5 cursor-pointer border-white/10 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    onClick={() => {
                      setLevel("");
                      setPage(1);
                    }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
            </FadeIn>
          )}

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-44 w-full rounded-xl bg-white/5" />
                  <div className="space-y-2 px-1">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-5 w-3/4 bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-3 w-1/3 bg-white/5" />
                    <div className="flex gap-3 pt-1">
                      <Skeleton className="h-3 w-12 bg-white/5" />
                      <Skeleton className="h-3 w-12 bg-white/5" />
                      <Skeleton className="h-3 w-12 bg-white/5" />
                    </div>
                    <Skeleton className="h-px w-full mt-2 bg-white/5" />
                    <div className="flex justify-between pt-1">
                      <Skeleton className="h-6 w-16 bg-white/5" />
                      <Skeleton className="h-4 w-20 bg-white/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <FadeIn>
              <div className="text-center py-20 rounded-2xl border border-white/10 bg-gray-900/30">
                <div className="relative mx-auto mb-6 h-24 w-24">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl" />
                  <div className="relative h-24 w-24 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  No courses found
                </h3>
                <p className="text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
                  Try adjusting your search or filters to discover more courses.
                </p>
                {hasFilters && (
                  <Button
                    variant="shimmer"
                    size="lg"
                    className="rounded-xl"
                    onClick={clearFilters}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Clear Filters &amp; Show All
                  </Button>
                )}
              </div>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any, idx: number) => (
                <FadeIn key={course.id} delay={idx * 0.04} direction="up">
                  <CourseCard course={course} />
                </FadeIn>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <FadeIn delay={0.3}>
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {Array.from(
                  { length: Math.min(pages, 7) },
                  (_, i) => {
                    if (pages <= 7) return i + 1;
                    if (page <= 4) return i + 1;
                    if (page >= pages - 3) return pages - 6 + i;
                    return page - 3 + i;
                  }
                ).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-lg w-9 h-9 p-0",
                      p === page
                        ? "bg-indigo-600 text-white border-indigo-500 pointer-events-none"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </FadeIn>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
