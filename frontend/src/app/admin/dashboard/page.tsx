"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice } from "@/lib/utils";
import {
  Users, BookOpen, DollarSign, TrendingUp, CheckCircle, XCircle,
  Star, Loader2, ShieldCheck, ShieldX, Clock, BarChart2,
  RefreshCw, ChevronRight, AlertCircle, AlertTriangle, GraduationCap, Banknote,
  CreditCard, ArrowUpRight,
} from "lucide-react";

type Tab = "overview" | "teachers" | "courses" | "refunds" | "payments";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "teachers",  label: "Teachers"  },
  { id: "courses",   label: "Courses"   },
  { id: "refunds",   label: "Refunds"   },
  { id: "payments",  label: "Payments"  },
];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  /* ── Queries ── */
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: () => adminApi.teachers().then((r) => r.data),
    enabled: activeTab === "teachers" || activeTab === "overview",
  });

  const { data: pendingData } = useQuery({
    queryKey: ["pending-teachers"],
    queryFn: () => adminApi.pendingTeachers().then((r) => r.data),
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => adminApi.courses().then((r) => r.data),
    enabled: activeTab === "courses" || activeTab === "overview",
  });

  const { data: refundsData, isLoading: refundsLoading } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: () => adminApi.refunds().then((r) => r.data),
    enabled: activeTab === "refunds" || activeTab === "overview",
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminApi.payments({ limit: 50 }).then((r) => r.data),
    enabled: activeTab === "payments",
  });

  /* ── Mutations ── */
  const verifyTeacher = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.verifyTeacher(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const featureCourse = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      adminApi.featureCourse(id, featured),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const approveRefund = useMutation({
    mutationFn: (id: string) => adminApi.approveRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const rejectRefund = useMutation({
    mutationFn: (id: string) => adminApi.rejectRefund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-refunds"] }),
  });

  const processPayouts = useMutation({
    mutationFn: () => adminApi.processPayouts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const reviewOnboarding = useMutation({
    mutationFn: (args: { teacherId: string; action: "approve" | "reject"; reason?: string }) =>
      adminApi.reviewOnboarding(args.teacherId, args.action, args.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const moderateCourse = useMutation({
    mutationFn: (args: { id: string; status: "approved" | "rejected" }) =>
      adminApi.moderateCourse(args.id, args.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  /* ── Derived data ── */
  const teachers    = teachersData?.teachers || [];
  const pending     = pendingData?.pending || [];
  const onboardingQueue = pending.filter((t: any) => t.onboarding_status === "submitted");
  const courses     = coursesData?.courses || [];
  const pendingModeration = courses.filter(
    (c: any) =>
      (c.moderation_status === "pending" || !c.moderation_status) && c.status !== "archived"
  ).length;
  const refunds     = refundsData?.refunds || [];
  const payments    = paymentsData?.payments || [];

  const statCards = [
    { label: "Total Users",       value: stats?.total_users       ?? "—", icon: Users,        color: "text-blue-600",   bg: "bg-blue-50"    },
    { label: "Total Students",    value: stats?.total_students    ?? "—", icon: GraduationCap, color: "text-sky-600",    bg: "bg-sky-50"     },
    { label: "Total Teachers",    value: stats?.total_teachers    ?? "—", icon: Users,        color: "text-violet-600", bg: "bg-violet-50"  },
    { label: "Total Courses",     value: stats?.total_courses     ?? "—", icon: BookOpen,     color: "text-indigo-600", bg: "bg-indigo-50"  },
    { label: "Total Enrollments", value: stats?.total_enrollments ?? "—", icon: TrendingUp,   color: "text-emerald-600",bg: "bg-emerald-50" },
    { label: "Total Revenue",     value: stats?.total_revenue     != null ? formatPrice(stats.total_revenue) : "—",    icon: DollarSign,   color: "text-green-600",  bg: "bg-green-50"   },
    { label: "Platform Revenue",  value: stats?.platform_revenue  != null ? formatPrice(stats.platform_revenue) : "—", icon: Banknote,    color: "text-teal-600",   bg: "bg-teal-50"    },
    { label: "Pending Verif.",    value: stats?.pending_verifications ?? "—", icon: AlertCircle, color: "text-amber-600",  bg: "bg-amber-50"   },
    { label: "Moderation queue",  value: pendingModeration, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50"    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage teachers, courses, refunds and payouts</p>
          </div>
          {activeTab === "teachers" && (
            <button
              onClick={() => processPayouts.mutate()}
              disabled={processPayouts.isPending}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {processPayouts.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
              Process Payouts
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.label}
              {t.id === "refunds" && refunds.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {refunds.length}
                </span>
              )}
              {t.id === "teachers" && pending.length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* Stat grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
                        <card.icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Top courses + Pending verifications */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Top courses */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-display font-bold text-gray-900">Top Courses</h2>
                      <button onClick={() => setActiveTab("courses")} className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:text-indigo-800">
                        View all <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {!stats?.top_courses?.length ? (
                        <p className="p-6 text-center text-gray-400 text-sm">No courses yet</p>
                      ) : stats.top_courses.map((c: any, i: number) => (
                        <div key={c.id} className="p-4 flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-300 w-5 text-center">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                            <p className="text-xs text-gray-400">{c.enrolled_count} enrolled</p>
                          </div>
                          {c.avg_rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {Number(c.avg_rating).toFixed(1)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending verifications */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="font-display font-bold text-gray-900">Pending Verifications</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{pending.length} awaiting review</p>
                      </div>
                      <button onClick={() => setActiveTab("teachers")} className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:text-indigo-800">
                        View all <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {!pending.length ? (
                        <p className="p-6 text-center text-gray-400 text-sm">No pending verifications</p>
                      ) : pending.slice(0, 5).map((t: any) => (
                        <div key={t.teacher_id} className="p-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {t.full_name?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{t.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">{t.email}</p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => verifyTeacher.mutate({ id: t.teacher_id, status: "approved" })}
                              className="p-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => verifyTeacher.mutate({ id: t.teacher_id, status: "rejected" })}
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pending refunds preview */}
                {refunds.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-700 font-semibold">
                      {refunds.length} refund request{refunds.length > 1 ? "s" : ""} pending review
                    </p>
                    <button
                      onClick={() => setActiveTab("refunds")}
                      className="ml-auto text-xs font-bold text-amber-700 underline underline-offset-2"
                    >
                      Review now →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TEACHERS TAB ── */}
        {activeTab === "teachers" && (
          <div className="space-y-6">
            {/* Pending verifications */}
            {onboardingQueue.length > 0 && (
              <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden mb-6">
                <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                  <h2 className="font-display font-bold text-gray-900">Onboarding review</h2>
                  <p className="text-sm text-indigo-800">{onboardingQueue.length} application(s) submitted</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {onboardingQueue.map((t: any) => (
                    <div key={t.teacher_id} className="p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.full_name}</p>
                          <p className="text-xs text-gray-500">{t.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => reviewOnboarding.mutate({ teacherId: t.teacher_id, action: "approve" })}
                            disabled={reviewOnboarding.isPending}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg"
                          >
                            Approve onboarding
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const reason = window.prompt("Rejection reason?");
                              if (reason === null) return;
                              reviewOnboarding.mutate({ teacherId: t.teacher_id, action: "reject", reason });
                            }}
                            disabled={reviewOnboarding.isPending}
                            className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 grid sm:grid-cols-2 gap-2">
                        {t.legal_name && <span>Legal: {t.legal_name}</span>}
                        {t.highest_degree && <span>Degree: {t.highest_degree}</span>}
                        {t.years_teaching != null && <span>Experience: {t.years_teaching} yrs</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pending.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
                  <h2 className="font-display font-bold text-gray-900">Pending Verifications</h2>
                  <p className="text-sm text-amber-700">{pending.length} teacher{pending.length > 1 ? "s" : ""} awaiting identity verification</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {pending.map((t: any) => (
                    <div key={t.teacher_id} className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {t.full_name?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{t.full_name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Applied {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifyTeacher.mutate({ id: t.teacher_id, status: "approved" })}
                          disabled={verifyTeacher.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => verifyTeacher.mutate({ id: t.teacher_id, status: "rejected" })}
                          disabled={verifyTeacher.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <ShieldX className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All teachers table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-display font-bold text-gray-900">All Teachers</h2>
                <p className="text-sm text-gray-500">{teachers.length} registered teachers</p>
              </div>
              {teachersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                </div>
              ) : !teachers.length ? (
                <p className="p-8 text-center text-gray-400 text-sm">No teachers yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teacher</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Students</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending Payout</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {teachers.map((t: any) => (
                        <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                {t.full_name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{t.full_name}</p>
                                <p className="text-xs text-gray-400">{t.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="font-semibold text-gray-900">{t.total_students ?? 0}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {t.credibility_score > 0 ? (
                              <span className="flex items-center justify-center gap-1 text-amber-500 font-semibold">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {Number(t.credibility_score).toFixed(1)}
                              </span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className={`font-semibold ${Number(t.pending_payout) > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                              {Number(t.pending_payout) > 0 ? formatPrice(t.pending_payout) : "₹0"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {t.identity_verified
                                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">ID ✓</span>
                                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">ID —</span>
                              }
                              {t.expert_verified
                                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Expert ✓</span>
                                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Expert —</span>
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">All Courses</h2>
              <p className="text-sm text-gray-500">{courses.length} total courses</p>
            </div>
            {coursesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
              </div>
            ) : !courses.length ? (
              <p className="p-8 text-center text-gray-400 text-sm">No courses yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Moderation</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-900 max-w-xs truncate">{c.title}</p>
                          {c.category && <p className="text-xs text-gray-400">{c.category}</p>}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.status === "published"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-gray-600">
                              {c.moderation_status || "—"}
                            </span>
                            {(c.moderation_status === "pending" || !c.moderation_status) && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => moderateCourse.mutate({ id: c.id, status: "approved" })}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moderateCourse.mutate({ id: c.id, status: "rejected" })}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100"
                                >
                                  No
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-gray-900">{c.enrolled_count ?? 0}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                          {Number(c.price) === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(c.price)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => featureCourse.mutate({ id: c.id, featured: !c.is_featured })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.is_featured
                                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                            title={c.is_featured ? "Remove from featured" : "Mark as featured"}
                          >
                            <Star className={`h-4 w-4 ${c.is_featured ? "fill-amber-400" : ""}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── REFUNDS TAB ── */}
        {activeTab === "refunds" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">Refund Requests</h2>
              <p className="text-sm text-gray-500">{refunds.length} pending review</p>
            </div>
            {refundsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
              </div>
            ) : !refunds.length ? (
              <div className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No pending refunds</p>
                <p className="text-gray-400 text-sm mt-1">All refund requests have been resolved</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {refunds.map((r: any) => (
                  <div key={r.id} className="p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-semibold text-gray-900">{r.student_name}</p>
                          <p className="text-sm text-gray-500">Course: <span className="font-medium text-gray-700">{r.course_name}</span></p>
                          {r.reason && (
                            <p className="text-sm text-gray-500 mt-1">Reason: <span className="text-gray-700">{r.reason}</span></p>
                          )}
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <BarChart2 className="h-3.5 w-3.5" />
                              {Number(r.watch_percent ?? 0).toFixed(0)}% watched
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3.5 w-3.5" />
                              {r.requested_at ? new Date(r.requested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => approveRefund.mutate(r.id)}
                            disabled={approveRefund.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => rejectRefund.mutate(r.id)}
                            disabled={rejectRefund.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-gray-900">Payment History</h2>
              <p className="text-sm text-gray-500">{paymentsData?.total ?? 0} total transactions</p>
            </div>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
              </div>
            ) : !payments.length ? (
              <p className="p-8 text-center text-gray-400 text-sm">No payments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform Cut</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teacher Earning</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                            </div>
                            <span className="text-gray-700 capitalize">{(p.payment_type || "").replace(/_/g, " ")}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900">{formatPrice(p.total_amount)}</td>
                        <td className="px-4 py-3.5 text-right text-indigo-600 font-semibold">{formatPrice(p.platform_cut)}</td>
                        <td className="px-4 py-3.5 text-right text-emerald-600 font-semibold">{formatPrice(p.teacher_earning)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.status === "completed" ? "bg-green-50 text-green-700 border-green-100" :
                            p.status === "pending"   ? "bg-amber-50 text-amber-700 border-amber-100" :
                            p.status === "refunded"  ? "bg-blue-50 text-blue-700 border-blue-100" :
                            "bg-red-50 text-red-600 border-red-100"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
