"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { enrollmentApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  BookOpen, Play, Clock, CheckCircle2, Loader2,
  TrendingUp, Search, Filter,
} from "lucide-react";
import { useState } from "react";

function ProgressRing({ value }: { value: number }) {
  const r = 20, stroke = 4;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);
  const color = value >= 100 ? "#10b981" : value >= 50 ? "#7c3aed" : "#f59e0b";
  return (
    <svg width={52} height={52} className="-rotate-90">
      <circle cx={26} cy={26} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={26} y={26} dominantBaseline="middle" textAnchor="middle"
        className="fill-gray-700 text-[10px] font-bold" style={{ transform: "rotate(90deg)", transformOrigin: "26px 26px", fontSize: 10 }}>
        {value}%
      </text>
    </svg>
  );
}

export default function EnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn:  () => enrollmentApi.myCourses().then(r => r.data),
  });

  const allCourses: any[] = data?.courses || [];

  const filtered = allCourses
    .filter(c => !search || c.course?.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => {
      const p = c.progress || 0;
      if (filter === "in-progress") return p > 0 && p < 100;
      if (filter === "completed")   return p >= 100;
      return true;
    });

  const inProgress = allCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length;
  const completed  = allCourses.filter(c => (c.progress || 0) >= 100).length;

  return (
    <DashboardLayout
      title="My Courses"
      subtitle="All your enrolled courses in one place"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Courses" }]}
    >
      <div className="max-w-5xl py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Enrolled",    value: allCourses.length, icon: BookOpen,     bg: "bg-violet-50",  color: "text-violet-600" },
            { label: "In Progress", value: inProgress,        icon: TrendingUp,   bg: "bg-amber-50",   color: "text-amber-600"  },
            { label: "Completed",   value: completed,         icon: CheckCircle2, bg: "bg-green-50",   color: "text-green-600"  },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search your courses…"
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent" />
          </div>
          <div className="flex gap-2">
            {(["all", "in-progress", "completed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  filter === f ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-300"
                }`}>
                {f === "all" ? "All" : f === "in-progress" ? "In Progress" : "Completed"}
              </button>
            ))}
          </div>
        </div>

        {/* Course list */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 mb-4">
              <BookOpen className="h-7 w-7 text-violet-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">
              {search ? "No courses match your search" : "No courses yet"}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              {search ? "Try a different keyword" : "Enroll in a course to start learning"}
            </p>
            {!search && (
              <Link href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-5 py-2.5 transition-colors">
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((enrollment: any) => {
              const course   = enrollment.course || {};
              const progress = enrollment.progress || 0;
              const done     = progress >= 100;

              return (
                <div key={enrollment.enrollment_id || course.id}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                    done ? "border-green-200" : "border-gray-200 hover:border-violet-200"
                  }`}>
                  <div className="flex items-center gap-4 p-5">
                    {/* Thumbnail */}
                    <div className="h-16 w-24 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 shrink-0">
                      {course.thumbnail_url
                        ? <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white/70" />
                          </div>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{course.title || "Untitled"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {course.difficulty_level && <span className="capitalize">{course.difficulty_level}</span>}
                        {course.category && <><span>·</span><span>{course.category}</span></>}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-400">{progress}% complete</span>
                          {done && <span className="text-[11px] font-bold text-green-600 flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Done</span>}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${done ? "bg-green-500" : "bg-violet-500"}`}
                            style={{ width: `${Math.max(progress, 2)}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0">
                      <Link href={`/learn/${course.slug}`}
                        className={`inline-flex items-center gap-1.5 rounded-xl text-xs font-bold px-4 py-2.5 transition-colors ${
                          done
                            ? "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                            : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200"
                        }`}>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {done ? "Review" : progress > 0 ? "Continue" : "Start"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
