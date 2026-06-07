"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Users, BookOpen, TrendingUp, IndianRupee,
  BarChart3, Target, AlertTriangle, ChevronDown,
  Loader2, Brain, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, RadialBarChart, RadialBar,
} from "recharts";

function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, loading }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; iconBg: string; iconColor: string; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} mb-4`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      {loading ? (
        <><Skeleton className="h-7 w-24 mb-2" /><Skeleton className="h-3.5 w-16" /></>
      ) : (
        <>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const CHART_COLORS = ["#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

// Truncate long course titles for chart labels
function shortTitle(title: string, max = 18) {
  return title.length > max ? title.slice(0, max) + "…" : title;
}

function RiskBadge({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
      level === "high"   ? "bg-red-50 text-red-700 border-red-200" :
      level === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
      "bg-green-50 text-green-700 border-green-200"
    }`}>
      <AlertTriangle className="h-3 w-3" /> {level}
    </span>
  );
}

export default function TeacherAnalyticsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const { data: dash, isLoading: dashLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn:  () => teacherApi.dashboard().then(r => r.data),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["teacher-analytics", selectedCourseId],
    queryFn:  () => teacherApi.analytics(selectedCourseId || undefined).then(r => r.data),
  });

  const courses: any[] = analyticsData?.courses || [];
  const atRisk:  any[] = dash?.at_risk_students  || [];

  // Chart data shapes
  const enrollmentData = courses.map(c => ({
    name: shortTitle(c.title),
    Students: c.enrollments || 0,
  }));

  const revenueData = courses.map(c => ({
    name:    shortTitle(c.title),
    Revenue: Math.round(c.revenue || 0),
  }));

  const completionData = courses.map(c => ({
    name:       shortTitle(c.title),
    Completion: c.enrollments > 0 ? Math.round((c.lesson_completions / c.enrollments) * 100) : 0,
    "Avg Quiz": c.avg_quiz_score != null ? Math.round(c.avg_quiz_score) : 0,
  }));

  const totalEnrollments = courses.reduce((s, c) => s + (c.enrollments || 0), 0);
  const totalRevenue     = courses.reduce((s, c) => s + (c.revenue || 0), 0);
  const avgQuiz          = courses.filter(c => c.avg_quiz_score != null);
  const avgQuizScore     = avgQuiz.length ? avgQuiz.reduce((s, c) => s + c.avg_quiz_score, 0) / avgQuiz.length : null;

  const topStats = [
    { icon: Users,       label: "Total Students",      value: (dash?.total_students ?? 0).toLocaleString(), sub: "Active enrollments",   iconBg: "bg-blue-50",   iconColor: "text-blue-600"   },
    { icon: BookOpen,    label: "Active Courses",       value: (dash?.active_courses ?? 0),                  sub: "Published courses",    iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { icon: TrendingUp,  label: "Avg Completion Rate",  value: dash?.avg_completion_rate ? `${Number(dash.avg_completion_rate).toFixed(1)}%` : "–", sub: "Across all courses", iconBg: "bg-green-50", iconColor: "text-green-600" },
    { icon: IndianRupee, label: "Net Earnings",         value: fmtRupee(dash?.my_earnings ?? 0),              sub: "After platform cut",   iconBg: "bg-amber-50",  iconColor: "text-amber-600"  },
  ];

  const chartHeight = 260;

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Enrollments, revenue, completion rates and quiz scores across your courses"
      breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Analytics" }]}
    >
      <div className="max-w-5xl py-6 space-y-6">

        {/* Course filter */}
        <div className="flex justify-end">
          {courses.length > 1 && (
            <div className="relative">
              <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none cursor-pointer">
                <option value="">All courses</option>
                {courses.map((c: any) => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topStats.map(s => <StatCard key={s.label} {...s} loading={dashLoading} />)}
        </div>

        {/* ── Charts ────────────────────────────────────────────────────── */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : courses.length > 0 ? (
          <>
            {/* Row 1: Enrollments + Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <SectionCard title="Enrollments by Course" subtitle="Number of students per course">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={enrollmentData} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip
                      formatter={(v: number) => [v.toLocaleString(), "Students"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    />
                    <Bar dataKey="Students" radius={[6, 6, 0, 0]}>
                      {enrollmentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              <SectionCard title="Revenue by Course" subtitle="Total revenue earned per course">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v: number) => [fmtRupee(v), "Revenue"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    />
                    <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]}>
                      {revenueData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? "#10b981" : "#34d399"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            {/* Row 2: Completion Rate vs Quiz Score */}
            <SectionCard
              title="Completion Rate vs Quiz Score"
              subtitle="Side-by-side comparison per course (%)"
            >
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={completionData} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    formatter={(v: number, name: string) => [`${v}%`, name]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="Completion" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Avg Quiz"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Summary totals row */}
              {courses.length > 1 && (
                <div className="flex flex-wrap gap-6 text-sm mt-4 pt-4 border-t border-gray-100">
                  <span className="text-gray-500">Total students: <strong className="text-gray-900">{totalEnrollments.toLocaleString()}</strong></span>
                  <span className="text-gray-500">Total revenue: <strong className="text-gray-900">{fmtRupee(totalRevenue)}</strong></span>
                  {avgQuizScore !== null && (
                    <span className="text-gray-500">Avg quiz score: <strong className="text-gray-900">{avgQuizScore.toFixed(1)}%</strong></span>
                  )}
                </div>
              )}
            </SectionCard>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mb-3">
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No chart data yet</p>
            <p className="text-xs text-gray-400">Charts appear once students start enrolling in your courses</p>
          </div>
        )}

        {/* ── Per-course detail table ───────────────────────────────────── */}
        {courses.length > 0 && !analyticsLoading && (
          <SectionCard title="Course Breakdown" subtitle="Detailed metrics per course">
            <div className="divide-y divide-gray-100 -mx-6 -mb-6">
              {courses.map((course: any) => {
                const completionRate = course.enrollments > 0
                  ? Math.round((course.lesson_completions / course.enrollments) * 100) : 0;
                return (
                  <div key={course.course_id} className="px-6 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 shrink-0">
                        <BookOpen className="h-4 w-4 text-violet-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-1 min-w-0 truncate">{course.title}</p>
                      <div className="flex items-center gap-6 shrink-0 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Users className="h-3.5 w-3.5 text-blue-400" />
                          <strong className="text-gray-900">{course.enrollments.toLocaleString()}</strong>
                        </span>
                        <span className="text-gray-500">
                          <strong className="text-gray-900">{fmtRupee(course.revenue)}</strong>
                        </span>
                        <span className="text-gray-500">
                          <strong className={completionRate >= 60 ? "text-green-600" : "text-amber-600"}>{completionRate}%</strong> done
                        </span>
                        {course.avg_quiz_score != null && (
                          <span className="text-gray-500">
                            Quiz: <strong className="text-gray-900">{Number(course.avg_quiz_score).toFixed(1)}%</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* ── At-risk students ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">At-Risk Students</h2>
              <p className="text-[11px] text-gray-400">Flagged by the AI monitoring system</p>
            </div>
            {atRisk.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
                {atRisk.length} flagged
              </span>
            )}
          </div>
          {dashLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : atRisk.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No at-risk students</p>
              <p className="text-xs text-gray-400">All students are progressing normally</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {atRisk.map((student: any) => (
                <div key={`${student.student_id}-${student.course_id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-red-50/30 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 shrink-0">
                    <span className="text-sm font-bold text-red-600">{student.student_name?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{student.student_name}</p>
                    <p className="text-xs text-gray-400 truncate">{student.course_title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Risk score</p>
                      <p className="text-sm font-bold text-red-600">{Number(student.risk_score).toFixed(0)}%</p>
                    </div>
                    <RiskBadge level={student.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
