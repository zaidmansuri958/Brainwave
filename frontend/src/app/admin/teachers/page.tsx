"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  GraduationCap, CheckCircle2, XCircle, Clock, Star,
  Users, Loader2, Search, ChevronDown, BadgeCheck, AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function OnboardingBadge({ status }: { status?: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    approved:  { cls: "bg-green-50 text-green-700 border-green-200",  label: "Approved"  },
    submitted: { cls: "bg-blue-50  text-blue-700  border-blue-200",   label: "Pending"   },
    rejected:  { cls: "bg-red-50   text-red-700   border-red-200",    label: "Rejected"  },
    pending:   { cls: "bg-amber-50 text-amber-700 border-amber-200",  label: "Incomplete"},
  };
  const cfg = map[status ?? "pending"] ?? map.pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminTeachersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "pending">("all");

  const { data: allData,     isLoading: allLoading     } = useQuery({ queryKey: ["admin-teachers"],         queryFn: () => adminApi.teachers().then(r => r.data)                });
  const { data: pendingData, isLoading: pendingLoading } = useQuery({ queryKey: ["admin-teachers-pending"], queryFn: () => adminApi.pendingTeachers().then(r => r.data)         });

  const onboard = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      adminApi.reviewOnboarding(id, action, reason),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ["admin-teachers"] });
      qc.invalidateQueries({ queryKey: ["admin-teachers-pending"] });
      toast({ title: action === "approve" ? "Teacher approved ✓" : "Teacher rejected" });
    },
    onError: () => toast({ title: "Action failed", variant: "destructive" }),
  });

  const teachers: any[] = (allData?.teachers || []).filter((t: any) =>
    !search || t.full_name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );
  const pending: any[] = pendingData?.pending || [];

  return (
    <DashboardLayout
      title="Teachers"
      subtitle="Manage teacher accounts, onboarding approvals and verification"
      breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Teachers" }]}
    >
      <div className="max-w-6xl py-6">

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "pending"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white shadow-sm text-violet-700" : "text-gray-500 hover:text-gray-700"}`}>
                {t === "all" ? `All Teachers (${allData?.teachers?.length ?? 0})` : `Pending Approval (${pending.length})`}
              </button>
            ))}
          </div>
          {tab === "all" && (
            <div className="flex items-center gap-2 flex-1 sm:max-w-xs bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent" />
            </div>
          )}
        </div>

        {/* ── All Teachers ── */}
        {tab === "all" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3.5 text-left">Teacher</th>
                    <th className="px-4 py-3.5 text-left">Status</th>
                    <th className="px-4 py-3.5 text-right">Students</th>
                    <th className="px-4 py-3.5 text-right">Credibility</th>
                    <th className="px-4 py-3.5 text-right">Pending Payout</th>
                    <th className="px-4 py-3.5 text-left">Joined</th>
                    <th className="px-4 py-3.5 text-right">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                      ))
                    : teachers.length === 0
                    ? <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No teachers found</td></tr>
                    : teachers.map((t: any) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 shrink-0">
                                <span className="text-sm font-bold text-violet-600">{t.full_name?.charAt(0)?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{t.full_name}</p>
                                <p className="text-xs text-gray-400">{t.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4"><OnboardingBadge status={t.onboarding_status} /></td>
                          <td className="px-4 py-4 text-right font-semibold text-gray-700">{(t.total_students || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-right">
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {Number(t.credibility_score || 0).toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-gray-700">{fmtRupee(t.pending_payout || 0)}</td>
                          <td className="px-4 py-4 text-xs text-gray-400">{formatDate(t.created_at)}</td>
                          <td className="px-4 py-4 text-right">
                            {t.identity_verified
                              ? <BadgeCheck className="h-5 w-5 text-green-500 ml-auto" />
                              : <AlertTriangle className="h-5 w-5 text-amber-400 ml-auto" />}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pending Approval ── */}
        {tab === "pending" && (
          <div className="space-y-4">
            {pendingLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
            ) : pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                <p className="text-base font-bold text-gray-900 mb-1">All caught up!</p>
                <p className="text-sm text-gray-500">No pending teacher applications.</p>
              </div>
            ) : pending.map((t: any) => (
              <div key={t.teacher_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 shrink-0">
                        <span className="text-sm font-bold text-violet-600">{t.full_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{t.full_name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                      <OnboardingBadge status={t.onboarding_status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: "Legal Name",    value: t.legal_name        || "—" },
                        { label: "Experience",    value: t.years_teaching ? `${t.years_teaching} yrs` : "—" },
                        { label: "Degree",        value: t.highest_degree    || "—" },
                        { label: "Applied",       value: formatDate(t.created_at) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-gray-400 mb-0.5">{label}</p>
                          <p className="font-semibold text-gray-700 truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2.5 shrink-0">
                    <button
                      onClick={() => onboard.mutate({ id: t.teacher_id, action: "approve" as const })}
                      disabled={onboard.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => { const r = prompt("Reason for rejection (optional):"); onboard.mutate({ id: t.teacher_id, action: "reject" as const, reason: r ?? undefined }); }}
                      disabled={onboard.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
