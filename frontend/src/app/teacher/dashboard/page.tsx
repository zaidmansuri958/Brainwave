"use client";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  Users, BookOpen, TrendingUp, Plus, AlertTriangle,
  Bell, CheckCircle, ArrowRight, DollarSign, BarChart2,
  Video, Award, Percent, Clock,
} from "lucide-react";
import { formatPrice, getRiskEmoji } from "@/lib/utils";

function StatCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4 ${href ? "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" : ""}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="font-display font-extrabold text-2xl text-gray-900 leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
  );
}

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => teacherApi.dashboard().then((r) => r.data),
  });

  const { data: ob } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => teacherApi.onboardingStatus().then((r) => r.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: () => teacherApi.analytics().then((r) => r.data),
  });

  const earnings     = data?.my_earnings     || 0;
  const pendingPayout = data?.pending_payout  || 0;
  const totalStudents = data?.total_students  || 0;
  const activeCourses = data?.active_courses  || 0;
  const commissionRate =
    totalStudents > 10000 ? 10 : totalStudents > 2000 ? 12 : 15;
  const nextTierStudents =
    totalStudents > 10000 ? null : totalStudents > 2000 ? 10000 : 2000;
  const progressToNext = nextTierStudents
    ? Math.min(Math.round((totalStudents / nextTierStudents) * 100), 100)
    : 100;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900">Teacher Studio</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your courses, track revenue, reach more students.</p>
            {ob && ob.onboarding_status && ob.onboarding_status !== "approved" && (
              <p className="text-amber-700 text-sm mt-2">
                Verification: {ob.onboarding_status}.{" "}
                <Link href="/teacher/onboarding" className="underline font-semibold">
                  Complete onboarding
                </Link>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/teacher/onboarding"
              className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-800 px-4 py-2.5 rounded-xl font-semibold text-sm"
            >
              Verification
            </Link>
            <Link
              href="/teacher/courses/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-button-indigo transition-colors"
            >
              <Plus className="w-4 h-4" /> New course
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/teacher/study-materials"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-indigo-200"
          >
            Study materials
          </Link>
          <Link
            href="/teacher/mock-tests"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-indigo-200"
          >
            Mock tests
          </Link>
          <Link
            href="/teacher/availability"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-indigo-200"
          >
            Doubt slots
          </Link>
        </div>

        {analytics?.courses?.length > 0 && (
          <div className="mb-10 bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" /> Course analytics
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Course</th>
                    <th className="pb-2 pr-4">Enrollments</th>
                    <th className="pb-2 pr-4">Revenue</th>
                    <th className="pb-2">Avg quiz</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.courses.map((c: any) => (
                    <tr key={c.course_id} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{c.title}</td>
                      <td className="py-2 pr-4">{c.enrollments}</td>
                      <td className="py-2 pr-4">{formatPrice(c.revenue)}</td>
                      <td className="py-2">
                        {c.avg_quiz_score != null ? `${c.avg_quiz_score.toFixed(1)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Stats Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => <SkeletonStat key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={DollarSign}  label="Total Earned"    value={formatPrice(earnings)}       sub="lifetime"            color="bg-emerald-50 text-emerald-600"  href="/teacher/earnings" />
            <StatCard icon={TrendingUp}  label="Pending Payout"  value={formatPrice(pendingPayout)}  sub="next 2-week cycle"   color="bg-amber-50 text-amber-600" />
            <StatCard icon={Users}       label="Total Students"  value={totalStudents.toLocaleString()} sub="across all courses" color="bg-indigo-50 text-indigo-600" href="/teacher/students" />
            <StatCard icon={BookOpen}    label="Active Courses"  value={activeCourses}               sub="published"           color="bg-violet-50 text-violet-600"   href="/teacher/courses" />
          </div>
        )}

        {/* ── Commission Tier Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900">Your commission rate</p>
                <p className="text-xs text-gray-500">Based on total enrolled students</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-extrabold text-3xl text-indigo-600">{commissionRate}%</p>
              <p className="text-xs text-gray-500">platform fee per sale</p>
            </div>
          </div>

          {nextTierStudents && (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{totalStudents.toLocaleString()} students</span>
                <span>{nextTierStudents.toLocaleString()} for {commissionRate - 1}% rate</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {(nextTierStudents - totalStudents).toLocaleString()} more students to unlock {commissionRate - 1}% rate
                {commissionRate > 8 ? " — contact us to negotiate." : "."}
              </p>
            </>
          )}

          {!nextTierStudents && (
            <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block mt-2">
              You&apos;re on our lowest commission rate.
            </p>
          )}
        </div>

        {/* ── Two-Column Section ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">

          {/* At-Risk Students */}
          {data?.at_risk_students?.length > 0 ? (
            <div className="bg-white rounded-2xl border border-rose-100 shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <h2 className="font-display font-bold text-gray-900">Students at risk</h2>
                <span className="ml-auto text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
                  {data.at_risk_students.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {data.at_risk_students.slice(0, 5).map((student: any) => (
                  <div key={student.student_id} className="flex items-center justify-between p-3 bg-[#FAFAF9] rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-sm flex-shrink-0">
                        {student.student_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{student.student_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{student.course_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-base">{getRiskEmoji(student.risk_level)}</span>
                      <Link
                        href={`/teacher/courses/${student.course_id}/students`}
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
                      >
                        View <ArrowRight className="w-3 h-3 inline" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">All students on track</p>
              <p className="text-xs text-gray-400 mt-1">No at-risk learners detected right now.</p>
            </div>
          )}

          {/* Recent Enrollments */}
          {data?.recent_enrollments?.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="font-display font-bold text-gray-900">Recent enrollments</h2>
              </div>
              <div className="space-y-2">
                {data.recent_enrollments.slice(0, 8).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-bold text-sm">{e.student_name?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{e.student_name}</p>
                      <p className="text-xs text-gray-500 truncate">enrolled in {e.course_title}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">No enrollments yet</p>
              <p className="text-xs text-gray-400 mt-1">Your first student will appear here.</p>
            </div>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/teacher/courses",       label: "My Courses",      icon: BookOpen,  color: "bg-indigo-50 text-indigo-600" },
            { href: "/teacher/courses/new",   label: "Create Course",   icon: Plus,      color: "bg-violet-50 text-violet-600" },
            { href: "/teacher/live-sessions", label: "Live Sessions",   icon: Video,     color: "bg-rose-50 text-rose-600" },
            { href: "/teacher/doubt-sessions",label: "Doubt Sessions",  icon: Award,     color: "bg-amber-50 text-amber-600" },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col items-center text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{link.label}</p>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
