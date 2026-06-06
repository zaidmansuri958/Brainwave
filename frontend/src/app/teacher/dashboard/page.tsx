"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, DollarSign, TrendingUp, Plus, ChevronRight, ArrowRight, Star, AlertTriangle, BarChart2, Video, HelpCircle } from "lucide-react";
import { teacherApi } from "@/lib/api";
import { formatPrice, getRiskEmoji } from "@/lib/utils";
import { DashboardLayout, MetricCard, SectionCard, Badge } from "@/components/layout/DashboardLayout";

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => teacherApi.dashboard().then((r) => r.data),
  });

  const { data: onboarding } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => teacherApi.onboardingStatus().then((r) => r.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: () => teacherApi.analytics().then((r) => r.data),
  });

  const isApproved = onboarding?.onboarding_status === "approved";
  const courses = analytics?.courses || [];

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      subtitle="Your studio performance at a glance."
      breadcrumbs={[{ label: "Teacher Studio" }, { label: "Dashboard" }]}
      actions={
        isApproved ? (
          <Link href="/teacher/courses/new" className="dash-btn-primary">
            <Plus className="h-4 w-4" /> New Course
          </Link>
        ) : (
          <Link href="/teacher/onboarding" className="dash-btn-secondary">
            <AlertTriangle className="h-4 w-4 text-orange-500" /> Complete Verification
          </Link>
        )
      }
    >
      {/* Onboarding banner */}
      {onboarding && onboarding.onboarding_status !== "approved" && (
        <div className={`mb-5 flex items-center gap-4 rounded-xl px-5 py-4 border ${
          onboarding.onboarding_status === "submitted"
            ? "bg-blue-50 border-blue-200"
            : onboarding.onboarding_status === "rejected"
            ? "bg-red-50 border-red-200"
            : "bg-orange-50 border-orange-200"
        }`}>
          <AlertTriangle className={`h-5 w-5 shrink-0 ${
            onboarding.onboarding_status === "submitted" ? "text-blue-500" :
            onboarding.onboarding_status === "rejected" ? "text-red-500" : "text-orange-500"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">
              {onboarding.onboarding_status === "submitted" ? "Application under review" :
               onboarding.onboarding_status === "rejected" ? "Application needs attention" :
               "Complete your teacher verification"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {onboarding.onboarding_status === "submitted"
                ? "Our team is reviewing your documents. You'll be notified once approved."
                : onboarding.onboarding_status === "rejected"
                ? `Reason: ${onboarding.rejection_reason || "Please review and resubmit."}`
                : "You need to complete onboarding before publishing courses."}
            </p>
          </div>
          {onboarding.onboarding_status !== "submitted" && (
            <Link href="/teacher/onboarding" className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {onboarding.onboarding_status === "rejected" ? "Resubmit" : "Start"} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Earnings"
          value={isLoading ? "—" : formatPrice(data?.my_earnings || 0)}
          icon={DollarSign}
          color="green"
          trend={12}
          trendLabel="vs last month"
        />
        <MetricCard
          label="Total Students"
          value={isLoading ? "—" : (data?.total_students || 0)}
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="Active Courses"
          value={isLoading ? "—" : (data?.active_courses || 0)}
          icon={BookOpen}
          color="purple"
        />
        <MetricCard
          label="Pending Payout"
          value={isLoading ? "—" : formatPrice(data?.pending_payout || 0)}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Course Analytics */}
        <div className="xl:col-span-2 space-y-4">

          <SectionCard
            title="Course Performance"
            subtitle="Revenue and enrollment by course"
            action={
              <Link href="/teacher/courses" className="text-sm text-blue-600 font-medium flex items-center gap-1">
                All courses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {courses.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No courses yet</p>
                {isApproved && (
                  <Link href="/teacher/courses/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                    <Plus className="h-4 w-4" /> Create your first course
                  </Link>
                )}
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students</th>
                    <th>Revenue</th>
                    <th>Avg Score</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {courses.slice(0, 6).map((c: any) => (
                    <tr key={c.course_id}>
                      <td>
                        <p className="font-semibold text-gray-800 text-[13px] max-w-[200px] truncate">{c.title}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium text-gray-700">{c.enrollments}</span>
                        </div>
                      </td>
                      <td className="font-semibold text-gray-800">{formatPrice(c.revenue || 0)}</td>
                      <td>
                        {c.avg_quiz_score != null ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-gray-700">{c.avg_quiz_score.toFixed(1)}%</span>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td>
                        <Link href={`/teacher/courses/${c.course_id}/edit`}
                          className="text-xs text-blue-600 font-medium hover:text-blue-700">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* At Risk Students */}
          {(data?.at_risk_students || []).length > 0 && (
            <SectionCard
              title="Students Needing Attention"
              subtitle="High risk of dropout"
            >
              <div className="space-y-2">
                {(data?.at_risk_students || []).slice(0, 5).map((s: any) => (
                  <div key={`${s.student_id}-${s.course_id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 shrink-0">
                      {(s.student_name || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{s.student_name}</p>
                      <p className="text-xs text-gray-500 truncate">{s.course_title}</p>
                    </div>
                    <Badge variant="danger">{getRiskEmoji?.(s.risk_level) || "⚠️"} {s.risk_level}</Badge>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Recent Enrollments */}
          <SectionCard title="Recent Enrollments">
            {(data?.recent_enrollments || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent enrollments</p>
            ) : (
              <div className="space-y-1">
                {(data?.recent_enrollments || []).slice(0, 5).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                      {(e.student_name || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{e.student_name}</p>
                      <p className="text-xs text-gray-400 truncate">{e.course_title}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(e.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-1.5">
              {[
                { label: "Schedule Live Session", href: "/teacher/live-sessions", icon: Video, color: "text-blue-600 bg-blue-50" },
                { label: "Create Doubt Session", href: "/teacher/doubt-sessions", icon: HelpCircle, color: "text-purple-600 bg-purple-50" },
                { label: "View Analytics", href: "/teacher/analytics", icon: BarChart2, color: "text-green-600 bg-green-50" },
                { label: "Manage Students", href: "/teacher/students", icon: Users, color: "text-orange-600 bg-orange-50" },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gray-400" />
                </Link>
              ))}
            </div>
          </SectionCard>

          {/* Earnings Summary */}
          <SectionCard title="Earnings Summary">
            <div className="space-y-3">
              {[
                { label: "Total Revenue", value: data?.total_revenue, icon: "💰", color: "text-green-600" },
                { label: "Platform Cut", value: data?.platform_cut, icon: "🏢", color: "text-red-500" },
                { label: "Net Earnings", value: data?.my_earnings, icon: "✅", color: "text-blue-600" },
                { label: "Pending Payout", value: data?.pending_payout, icon: "⏳", color: "text-orange-500" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{icon}</span> {label}
                  </span>
                  <span className={`text-sm font-semibold ${color}`}>
                    {value != null ? formatPrice(value) : "—"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Link href="/teacher/earnings" className="flex items-center justify-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700">
                Full earnings report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
