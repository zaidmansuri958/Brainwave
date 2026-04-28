"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Plus, Star, Users } from "lucide-react";
import { teacherApi } from "@/lib/api";
import { formatPrice, getRiskEmoji } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell, DenseDataTable, StatusBadge } from "@/components/ui/app-shell";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => teacherApi.dashboard().then((response) => response.data),
  });

  const { data: onboarding } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => teacherApi.onboardingStatus().then((response) => response.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: () => teacherApi.analytics().then((response) => response.data),
  });

  const totalStudents = data?.total_students || 0;
  const revenueData = [
    { month: "Nov", revenue: 82000 },
    { month: "Dec", revenue: 97000 },
    { month: "Jan", revenue: 113000 },
    { month: "Feb", revenue: 104000 },
    { month: "Mar", revenue: 126000 },
    { month: "Apr", revenue: 141000 },
  ];

  return (
    <AppShell className="flex flex-col">
      <Navbar />
      <main className="bw-shell flex-1 space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="bw-kicker">Teacher Studio</p>
            <h1 className="mt-2 font-display text-4xl text-ink-heading">Performance Dashboard</h1>
          </div>
          <Link href="/teacher/courses/new" className="bw-action-primary">
            <Plus className="h-4 w-4" />
            Create New Course
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="bw-card p-6">
            <p className="text-sm text-ink-muted">Total Revenue</p>
            <p className="mt-2 font-display text-4xl text-ink-heading">{formatPrice(data?.my_earnings || 0)}</p>
            <p className="mt-2 text-sm text-green-700">+12% this month</p>
          </div>
          <div className="bw-card p-6">
            <p className="text-sm text-ink-muted">Total Students</p>
            <p className="mt-2 font-display text-4xl text-ink-heading">{totalStudents.toLocaleString()}</p>
            <p className="mt-2 text-sm text-green-700">+6% this month</p>
          </div>
          <div className="bw-card p-6">
            <p className="text-sm text-ink-muted">Active Courses</p>
            <p className="mt-2 font-display text-4xl text-ink-heading">{analytics?.courses?.length || 0}</p>
            <p className="mt-2 text-sm text-ink-muted">Published + in review</p>
          </div>
          <div className="bw-card p-6">
            <p className="text-sm text-ink-muted">Avg. Rating</p>
            <p className="mt-2 flex items-center gap-2 font-display text-4xl text-ink-heading"><Star className="h-7 w-7 fill-amber-400 text-amber-400" />4.8</p>
            <p className="mt-2 text-sm text-ink-muted">Across all enrollments</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="bw-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink-heading">Earnings Trend</h2>
                <span className="text-sm text-ink-muted">Last 6 months</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a1aff" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#1a1aff" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef0f4" vertical={false} />
                    <XAxis dataKey="month" stroke="#8a8f9e" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#1a1aff" fill="url(#revenueFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bw-card p-6">
              <h2 className="font-display text-2xl text-ink-heading">Course Performance</h2>
              {isLoading ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="bw-card h-28 animate-pulse bg-white/70" />
                  ))}
                </div>
              ) : analytics?.courses?.length > 0 ? (
                <div className="mt-6">
                  <DenseDataTable
                    columns={["Course", "Students", "Revenue", "Rating", "Status"]}
                    rows={analytics.courses.map((course: any) => [
                      <div key={`${course.course_id}-title`}>
                        <p className="font-semibold text-ink-heading">{course.title}</p>
                      </div>,
                      <span key={`${course.course_id}-enrollments`} className="font-semibold">{course.enrollments}</span>,
                      <span key={`${course.course_id}-revenue`} className="font-semibold">{formatPrice(course.revenue)}</span>,
                      <span key={`${course.course_id}-quiz`} className="font-semibold">{course.avg_quiz_score != null ? `${course.avg_quiz_score.toFixed(1)}%` : "4.8"}</span>,
                      <StatusBadge key={`${course.course_id}-status`} tone="success">Published</StatusBadge>,
                    ])}
                  />
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                  Course analytics will appear here once enrollments and quiz activity start flowing in.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bw-card border-l-4 border-l-[#1d4ed8] p-5">
              <p className="text-sm font-semibold text-ink-heading">Upcoming Live Sessions</p>
              <p className="mt-2 text-sm text-ink-muted">2 scheduled for this week.</p>
              <Link href="/teacher/live-sessions" className="mt-3 inline-flex text-sm font-semibold text-brand-primary">Open schedule <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="bw-card border-l-4 border-l-[#b45309] p-5">
              <p className="text-sm font-semibold text-ink-heading">Pending Doubt Sessions</p>
              <p className="mt-2 text-sm text-ink-muted">{data?.at_risk_students?.length || 0} student requests need response.</p>
              <Link href="/teacher/doubt-sessions" className="mt-3 inline-flex text-sm font-semibold text-brand-primary">Resolve now <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="bw-card border-l-4 border-l-[#15803d] p-5">
              <p className="text-sm font-semibold text-ink-heading">Pending Payouts</p>
              <p className="mt-2 text-sm text-ink-muted">{formatPrice(data?.pending_payout || 0)} in next cycle.</p>
              <Link href="/teacher/earnings" className="mt-3 inline-flex text-sm font-semibold text-brand-primary">View earnings <ArrowRight className="h-4 w-4" /></Link>
            </div>
            {onboarding?.onboarding_status && onboarding.onboarding_status !== "approved" ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                Verification status: {onboarding.onboarding_status}
              </div>
            ) : null}

            <div className="bw-card p-5">
              <p className="text-sm font-semibold text-ink-heading">At-risk students</p>
              <div className="mt-3 space-y-2">
                {data?.at_risk_students?.slice(0, 3).map((student: any) => (
                  <div key={student.student_id} className="rounded-md border border-[#e2e5ec] p-3">
                    <p className="text-sm font-semibold text-ink-heading">{student.student_name}</p>
                    <p className="text-xs text-ink-muted">{student.course_title}</p>
                    <p className="mt-1 text-xs text-amber-700">{getRiskEmoji(student.risk_level)} Risk flagged</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}
