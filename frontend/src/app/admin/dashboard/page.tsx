"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { DashboardLayout, MetricCard, SectionCard, Badge } from "@/components/layout/DashboardLayout";
import { Users, BookOpen, DollarSign, ShieldCheck, TrendingUp, CheckCircle, XCircle, ChevronRight, ExternalLink, Star } from "lucide-react";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "teachers" | "courses" | "refunds">("overview");

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => adminApi.stats().then((r) => r.data) });
  const { data: pendingData } = useQuery({ queryKey: ["pending-teachers"], queryFn: () => adminApi.pendingTeachers().then((r) => r.data) });
  const { data: teachersData } = useQuery({ queryKey: ["admin-teachers"], queryFn: () => adminApi.teachers().then((r) => r.data), enabled: activeTab === "teachers" });
  const { data: coursesData } = useQuery({ queryKey: ["admin-courses"], queryFn: () => adminApi.courses().then((r) => r.data), enabled: activeTab === "courses" });
  const { data: refundsData } = useQuery({ queryKey: ["admin-refunds"], queryFn: () => adminApi.refunds().then((r) => r.data), enabled: activeTab === "refunds" });

  const pending = pendingData?.pending || [];
  const teachers = teachersData?.teachers || [];
  const courses = coursesData?.courses || [];
  const refunds = refundsData?.refunds || [];

  const reviewOnboarding = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      adminApi.reviewOnboarding(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setRejectTarget(null);
      setRejectReason("");
    },
  });

  const moderateCourse = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      adminApi.moderateCourse(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const approveRefund = useMutation({
    mutationFn: (id: string) => adminApi.approveRefund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-refunds"] }),
  });

  const rejectRefund = useMutation({
    mutationFn: (id: string) => adminApi.rejectRefund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-refunds"] }),
  });

  const featureCourse = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => adminApi.featureCourse(id, featured),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "teachers", label: `Teachers ${pending.length > 0 ? `(${pending.length} pending)` : ""}` },
    { key: "courses", label: "Courses" },
    { key: "refunds", label: "Refunds" },
  ] as const;

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Platform operations overview"
      breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Users"    value={stats?.total_users ?? "—"}    icon={Users}     color="blue" />
        <MetricCard label="Active Courses" value={stats?.total_courses ?? "—"}  icon={BookOpen}  color="purple" />
        <MetricCard label="Platform Revenue" value={stats?.total_revenue != null ? formatPrice(stats.total_revenue) : "—"} icon={DollarSign} color="green" />
        <MetricCard label="Pending Reviews" value={pending.length}              icon={ShieldCheck} color="orange" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === t.key
                ? "bg-white text-blue-600 shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Pending Teacher Reviews */}
          <SectionCard title="Pending Teacher Verifications" subtitle={`${pending.length} applications awaiting review`}>
            {rejectTarget && (
              <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm font-semibold text-gray-800 mb-2">Rejection Reason</p>
                <textarea
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                  rows={2}
                  placeholder="Explain what needs to be corrected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ fontFamily: "var(--font-sans)" }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    disabled={!rejectReason.trim() || reviewOnboarding.isPending}
                    onClick={() => reviewOnboarding.mutate({ id: rejectTarget, action: "reject", reason: rejectReason.trim() })}
                    className="flex-1 text-sm font-semibold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Confirm Rejection
                  </button>
                  <button type="button" onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                    className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {pending.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="h-10 w-10 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.slice(0, 5).map((t: any) => (
                  <div key={t.teacher_id} className="rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                          {(t.full_name || "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.full_name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                      <Badge variant="warning">Submitted</Badge>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      {t.legal_name && <div><span className="text-gray-400">Legal:</span> <span className="text-gray-700 font-medium">{t.legal_name}</span></div>}
                      {t.highest_degree && <div><span className="text-gray-400">Degree:</span> <span className="text-gray-700 font-medium">{t.highest_degree}</span></div>}
                      {t.years_teaching != null && <div><span className="text-gray-400">Exp:</span> <span className="text-gray-700 font-medium">{t.years_teaching}y</span></div>}
                    </div>

                    {/* Documents */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {t.degree_proof_url && <a href={t.degree_proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100"><ExternalLink className="h-3 w-3" /> Degree</a>}
                      {t.aadhaar_doc_url  && <a href={t.aadhaar_doc_url}  target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100"><ExternalLink className="h-3 w-3" /> Aadhaar</a>}
                      {t.pan_doc_url      && <a href={t.pan_doc_url}      target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100"><ExternalLink className="h-3 w-3" /> PAN</a>}
                    </div>

                    <div className="flex gap-2">
                      <button type="button"
                        disabled={reviewOnboarding.isPending}
                        onClick={() => reviewOnboarding.mutate({ id: t.teacher_id, action: "approve" })}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button type="button"
                        onClick={() => { setRejectTarget(t.teacher_id); setRejectReason(""); }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Platform Stats */}
          <div className="space-y-4">
            <SectionCard title="Platform Summary">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Students", value: stats?.total_students, color: "bg-blue-50 text-blue-700" },
                  { label: "Teachers", value: stats?.total_teachers, color: "bg-purple-50 text-purple-700" },
                  { label: "Courses", value: stats?.total_courses, color: "bg-green-50 text-green-700" },
                  { label: "Enrollments", value: stats?.total_enrollments, color: "bg-orange-50 text-orange-700" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl p-4 ${color}`}>
                    <p className="text-2xl font-bold">{value ?? "—"}</p>
                    <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Revenue</span>
                  <span className="text-sm font-bold text-green-600">{stats?.total_revenue != null ? formatPrice(stats.total_revenue) : "—"}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">Platform Revenue</span>
                  <span className="text-sm font-bold text-blue-600">{stats?.platform_revenue != null ? formatPrice(stats.platform_revenue) : "—"}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Top Courses">
              {(stats?.top_courses || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No data</p>
              ) : (
                <div className="space-y-2">
                  {(stats?.top_courses || []).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                        <p className="text-xs text-gray-400">{c.enrolled_count} students</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-gray-600">{Number(c.avg_rating).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* Teachers tab */}
      {activeTab === "teachers" && (
        <SectionCard title="All Teachers">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Students</th>
                <th>Pending Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t: any) => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                        {(t.full_name || "?")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t.full_name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium text-gray-700">{t.total_students ?? 0}</td>
                  <td className="font-medium text-orange-600">{formatPrice(t.pending_payout || 0)}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <Badge variant={t.identity_verified ? "success" : "neutral"}>ID {t.identity_verified ? "✓" : "—"}</Badge>
                      <Badge variant={t.expert_verified ? "success" : "neutral"}>Expert {t.expert_verified ? "✓" : "—"}</Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {/* Courses tab */}
      {activeTab === "courses" && (
        <SectionCard title="Course Moderation">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Moderation</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-semibold text-gray-800 text-sm max-w-[240px] truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.category || "—"}</p>
                  </td>
                  <td>
                    <Badge variant={c.status === "published" ? "success" : c.status === "draft" ? "neutral" : "warning"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={c.moderation_status === "approved" ? "success" : c.moderation_status === "rejected" ? "danger" : "warning"}>
                      {c.moderation_status || "pending"}
                    </Badge>
                  </td>
                  <td className="font-medium text-gray-700">{formatPrice(c.price || 0)}</td>
                  <td>
                    <div className="flex gap-2">
                      {c.moderation_status !== "approved" && (
                        <button type="button"
                          disabled={moderateCourse.isPending}
                          onClick={() => moderateCourse.mutate({ id: c.id, status: "approved" })}
                          className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50"
                        >Approve</button>
                      )}
                      <button type="button"
                        disabled={featureCourse.isPending}
                        onClick={() => featureCourse.mutate({ id: c.id, featured: !c.is_featured })}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${c.is_featured ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                      >
                        {c.is_featured ? "★ Featured" : "Feature"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {/* Refunds tab */}
      {activeTab === "refunds" && (
        <SectionCard title="Refund Requests">
          {refunds.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle className="h-10 w-10 text-green-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No pending refund requests</p>
            </div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Watch %</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((r: any) => (
                  <tr key={r.id}>
                    <td className="font-semibold text-gray-800 text-sm">{r.student_name || "—"}</td>
                    <td className="text-sm text-gray-600 max-w-[180px] truncate">{r.course_name || "—"}</td>
                    <td>
                      <Badge variant={Number(r.watch_percent) > 60 ? "danger" : Number(r.watch_percent) > 30 ? "warning" : "success"}>
                        {Number(r.watch_percent || 0).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="text-xs text-gray-500 max-w-[150px] truncate">{r.reason || "—"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button type="button"
                          disabled={approveRefund.isPending}
                          onClick={() => approveRefund.mutate(r.id)}
                          className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50"
                        >Approve</button>
                        <button type="button"
                          disabled={rejectRefund.isPending}
                          onClick={() => rejectRefund.mutate(r.id)}
                          className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}
    </DashboardLayout>
  );
}
