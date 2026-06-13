"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, BookOpen, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { courseApi, mockTestsApi } from "@/lib/api";
import { MockTestCard, type MockTestPackageCard } from "@/components/mock-tests/MockTestCard";

const FALLBACK_COURSES = [
  { id: "1", slug: "ai-ml-bootcamp", title: "Complete AI & Machine Learning Bootcamp", teacher_name: "Dr. Arjun Patel", category: "AI/ML", rating: 4.8, total_students: 12600, price: 1499, original_price: 2000, thumbnail_color: "from-violet-600 to-indigo-800", emoji: "🤖" },
  { id: "2", slug: "web-dev-mern", title: "Web Development Full Stack with MERN", teacher_name: "John Smith", category: "Web Dev", rating: 4.7, total_students: 9800, price: 1299, original_price: 2000, thumbnail_color: "from-orange-500 to-red-600", emoji: "💻" },
  { id: "3", slug: "data-science-python", title: "Data Science with Python", teacher_name: "Riya Sharma", category: "Data Science", rating: 4.8, total_students: 13400, price: 1499, original_price: 2099, thumbnail_color: "from-blue-500 to-cyan-600", emoji: "📊" },
  { id: "4", slug: "uiux-design", title: "UI/UX Design Mastery Course", teacher_name: "Neha Verma", category: "Design", rating: 4.7, total_students: 6700, price: 1199, original_price: 2000, thumbnail_color: "from-purple-500 to-pink-600", emoji: "🎨" },
  { id: "5", slug: "digital-marketing", title: "Digital Marketing Complete Guide", teacher_name: "Rahul Mehta", category: "Marketing", rating: 4.6, total_students: 7700, price: 999, original_price: 1999, thumbnail_color: "from-yellow-400 to-orange-500", emoji: "📣" },
];

function CourseCard({ course }: { course: typeof FALLBACK_COURSES[0] & { thumbnail_url?: string } }) {
  const isReal = !!(course as any).thumbnail_url;

  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {isReal && (course as any).thumbnail_url ? (
          <img src={(course as any).thumbnail_url} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${course.thumbnail_color || "from-violet-500 to-indigo-700"} flex items-center justify-center`}>
            <span className="text-5xl">{(course as any).emoji || "📚"}</span>
          </div>
        )}
        {course.category && (
          <span className="absolute top-2.5 left-2.5 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            {course.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-violet-700 transition-colors">
          {course.title}
        </h3>

        {course.teacher_name && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center text-[9px] font-bold text-violet-700">
              {course.teacher_name[0]}
            </div>
            <p className="text-xs text-gray-500">{course.teacher_name}</p>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-bold text-orange-500">{course.rating?.toFixed(1) || "New"}</span>
          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className={`h-3 w-3 ${i <= Math.round(course.rating || 0) ? "text-orange-400 fill-orange-400" : "text-gray-200"}`} />
            ))}
          </div>
          {course.total_students ? (
            <span className="text-[11px] text-gray-400">({course.total_students >= 1000 ? `${(course.total_students/1000).toFixed(1)}k` : course.total_students})</span>
          ) : null}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            ₹{course.price?.toLocaleString("en-IN") || "Free"}
          </span>
          {(course as any).original_price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{(course as any).original_price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

type Tab = "courses" | "mock-tests";

export function TopCoursesSection() {
  const [tab, setTab] = useState<Tab>("courses");

  const { data: coursesData } = useQuery({
    queryKey: ["courses-preview"],
    queryFn: () => courseApi.list({ sort: "popular", limit: 5 }).then((r) => r.data),
    staleTime: 60000,
  });

  const { data: mockData } = useQuery({
    queryKey: ["mock-catalog-preview"],
    queryFn: () => mockTestsApi.catalog().then((r) => r.data),
    staleTime: 60000,
    enabled: tab === "mock-tests",
  });

  const liveCourses = coursesData?.courses || [];
  const displayCourses = liveCourses.length >= 5
    ? liveCourses.slice(0, 5).map((c: any, i: number) => ({ ...FALLBACK_COURSES[i], ...c }))
    : FALLBACK_COURSES;

  const mockPackages: MockTestPackageCard[] = (mockData?.packages || []).slice(0, 5);

  const tabs: { key: Tab; label: string; icon: typeof BookOpen }[] = [
    { key: "courses", label: "Courses", icon: BookOpen },
    { key: "mock-tests", label: "Mock Tests", icon: ClipboardList },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Explore What&apos;s Popular</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tab === "courses"
                ? "Our most popular and highly rated courses"
                : "Timed, exam-style mock tests with instant scoring & analytics"}
            </p>
          </div>
          <Link
            href={tab === "courses" ? "/courses" : "/catalog/mock-tests"}
            className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            View all {tab === "courses" ? "courses" : "mock tests"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="mb-7 inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {tab === "courses" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayCourses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : mockPackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockPackages.map((pkg) => (
              <MockTestCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-600">Mock tests coming soon</p>
            <p className="mt-1 text-sm text-gray-400">Our teachers are crafting exam-ready papers — check back shortly.</p>
            <Link
              href="/catalog/mock-tests"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Browse mock tests <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
