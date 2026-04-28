"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell, ContentBand, DenseDataTable, MetricCard, SectionHeader, StatusBadge } from "@/components/ui/app-shell";

type Tab = "overview" | "teachers" | "courses" | "refunds" | "payments";

const TABS: Tab[] = ["overview", "teachers", "courses", "refunds", "payments"];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => adminApi.stats().then((response) => response.data) });
  const { data: teachersData } = useQuery({ queryKey: ["admin-teachers"], queryFn: () => adminApi.teachers().then((response) => response.data), enabled: activeTab === "teachers" || activeTab === "overview" });
  const { data: pendingData } = useQuery({ queryKey: ["pending-teachers"], queryFn: () => adminApi.pendingTeachers().then((response) => response.data) });
  const { data: coursesData } = useQuery({ queryKey: ["admin-courses"], queryFn: () => adminApi.courses().then((response) => response.data), enabled: activeTab === "courses" || activeTab === "overview" });
  const { data: refundsData } = useQuery({ queryKey: ["admin-refunds"], queryFn: () => adminApi.refunds().then((response) => response.data), enabled: activeTab === "refunds" || activeTab === "overview" });
  const { data: paymentsData } = useQuery({ queryKey: ["admin-payments"], queryFn: () => adminApi.payments({ limit: 50 }).then((response) => response.data), enabled: activeTab === "payments" });

  const verifyTeacher = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.verifyTeacher(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const teachers = teachersData?.teachers || [];
  const pending = pendingData?.pending || [];
  const courses = coursesData?.courses || [];
  const refunds = refundsData?.refunds || [];
  const payments = paymentsData?.payments || [];

  return (
    <AppShell>
      <Navbar />
      <main className="bw-shell space-y-6 pb-6">
        <ContentBand muted>
          <SectionHeader
            eyebrow="Operations Console"
            title="Admin now reads like a real ops dashboard."
            description="The redesigned admin experience uses a stronger summary strip, denser review panels, clearer statuses, and tables that carry more operational signal."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Users" value={stats?.total_users ?? "—"} detail="all accounts" />
            <MetricCard label="Courses" value={stats?.total_courses ?? "—"} detail="published + draft inventory" />
            <MetricCard label="Revenue" value={stats?.total_revenue != null ? formatPrice(stats.total_revenue) : "—"} detail="gross platform volume" />
            <MetricCard label="Pending review" value={pending.length} detail="teacher verification queue" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 rounded-full bg-white/70 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                  activeTab === tab ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </ContentBand>

        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <ContentBand>
              <SectionHeader eyebrow="Verification Queue" title="Pending teachers" />
              <div className="mt-6 space-y-3">
                {pending.length > 0 ? (
                  pending.slice(0, 5).map((teacher: any) => (
                    <div key={teacher.teacher_id} className="bw-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-bold text-slate-950">{teacher.full_name}</p>
                          <p className="text-sm text-slate-500">{teacher.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => verifyTeacher.mutate({ id: teacher.teacher_id, status: "approved" })} className="bw-action-primary !rounded-full !px-4 !py-2">Approve</button>
                          <button type="button" onClick={() => verifyTeacher.mutate({ id: teacher.teacher_id, status: "rejected" })} className="bw-action-secondary !rounded-full !px-4 !py-2">Reject</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bw-card p-5 text-sm text-slate-600">No teacher reviews are pending right now.</div>
                )}
              </div>
            </ContentBand>

            <ContentBand>
              <SectionHeader eyebrow="Refunds" title="Requests requiring decisions" />
              <div className="mt-6 space-y-3">
                {refunds.length > 0 ? (
                  refunds.slice(0, 4).map((refund: any) => (
                    <div key={refund.id} className="bw-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-bold text-slate-950">{refund.student_name}</p>
                          <p className="text-sm text-slate-500">{refund.course_name}</p>
                        </div>
                        <StatusBadge tone="warning">{Number(refund.watch_percent ?? 0).toFixed(0)}% watched</StatusBadge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bw-card p-5 text-sm text-slate-600">No pending refund requests.</div>
                )}
              </div>
            </ContentBand>
          </div>
        ) : null}

        {activeTab === "teachers" ? (
          <ContentBand>
            <SectionHeader eyebrow="Teachers" title="Teacher roster" />
            <div className="mt-6">
              <DenseDataTable
                columns={["Teacher", "Students", "Pending payout", "Status"]}
                rows={teachers.map((teacher: any) => [
                  <div key={`${teacher.id}-teacher`}>
                    <p className="font-semibold text-slate-950">{teacher.full_name}</p>
                    <p className="text-xs text-slate-400">{teacher.email}</p>
                  </div>,
                  <span key={`${teacher.id}-students`} className="font-semibold">{teacher.total_students ?? 0}</span>,
                  <span key={`${teacher.id}-payout`} className="font-semibold">{formatPrice(teacher.pending_payout || 0)}</span>,
                  <div key={`${teacher.id}-status`} className="flex gap-2">
                    <StatusBadge tone={teacher.identity_verified ? "success" : "neutral"}>ID</StatusBadge>
                    <StatusBadge tone={teacher.expert_verified ? "info" : "neutral"}>Expert</StatusBadge>
                  </div>,
                ])}
              />
            </div>
          </ContentBand>
        ) : null}

        {activeTab === "courses" ? (
          <ContentBand>
            <SectionHeader eyebrow="Courses" title="Course moderation and feature control" />
            <div className="mt-6">
              <DenseDataTable
                columns={["Course", "Status", "Moderation", "Price"]}
                rows={courses.map((course: any) => [
                  <div key={`${course.id}-title`}>
                    <p className="font-semibold text-slate-950">{course.title}</p>
                    <p className="text-xs text-slate-400">{course.category || "Uncategorised"}</p>
                  </div>,
                  <StatusBadge key={`${course.id}-status`} tone={course.status === "published" ? "success" : "warning"}>{course.status}</StatusBadge>,
                  <StatusBadge key={`${course.id}-moderation`} tone={course.moderation_status === "approved" ? "success" : course.moderation_status === "rejected" ? "danger" : "warning"}>{course.moderation_status || "pending"}</StatusBadge>,
                  <span key={`${course.id}-price`} className="font-semibold">{Number(course.price) === 0 ? "Free" : formatPrice(course.price)}</span>,
                ])}
              />
            </div>
          </ContentBand>
        ) : null}

        {activeTab === "refunds" ? (
          <ContentBand>
            <SectionHeader eyebrow="Refunds" title="Pending refund requests" />
            <div className="mt-6">
              <DenseDataTable
                columns={["Student", "Course", "Reason", "Watch %"]}
                rows={refunds.map((refund: any) => [
                  <span key={`${refund.id}-student`} className="font-semibold">{refund.student_name}</span>,
                  <span key={`${refund.id}-course`}>{refund.course_name}</span>,
                  <span key={`${refund.id}-reason`}>{refund.reason || "Not specified"}</span>,
                  <span key={`${refund.id}-watch`} className="font-semibold">{Number(refund.watch_percent ?? 0).toFixed(0)}%</span>,
                ])}
              />
            </div>
          </ContentBand>
        ) : null}

        {activeTab === "payments" ? (
          <ContentBand>
            <SectionHeader eyebrow="Payments" title="Recent transactions" />
            <div className="mt-6">
              <DenseDataTable
                columns={["Type", "Total", "Platform", "Teacher", "Status"]}
                rows={payments.map((payment: any) => [
                  <span key={`${payment.id}-type`} className="font-semibold capitalize">{(payment.payment_type || "").replace(/_/g, " ")}</span>,
                  <span key={`${payment.id}-total`} className="font-semibold">{formatPrice(payment.total_amount)}</span>,
                  <span key={`${payment.id}-platform`} className="font-semibold">{formatPrice(payment.platform_cut)}</span>,
                  <span key={`${payment.id}-teacher`} className="font-semibold">{formatPrice(payment.teacher_earning)}</span>,
                  <StatusBadge key={`${payment.id}-status`} tone={payment.status === "completed" ? "success" : payment.status === "pending" ? "warning" : payment.status === "refunded" ? "info" : "danger"}>{payment.status}</StatusBadge>,
                ])}
              />
            </div>
          </ContentBand>
        ) : null}
      </main>
    </AppShell>
  );
}
