"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookOpen, Star, StarOff, CheckCircle2, XCircle, Loader2, Search, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function fmtRupee(n: number) {
  return n === 0 ? "Free" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status, type }: { status: string; type?: string }) {
  const map: Record<string, string> = {
    published: "bg-green-50 text-green-700 border-green-200",
    draft:     "bg-amber-50 text-amber-700 border-amber-200",
    approved:  "bg-green-50 text-green-700 border-green-200",
    rejected:  "bg-red-50   text-red-700   border-red-200",
    pending:   "bg-blue-50  text-blue-700  border-blue-200",
    completed: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {type ? `${type}: ` : ""}{status}
    </span>
  );
}

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn:  () => adminApi.courses().then(r => r.data),
  });

  const moderation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      adminApi.moderateCourse(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Moderation updated" });
    },
    onError: () => toast({ title: "Action failed", variant: "destructive" }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      adminApi.featureCourse(id, featured),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course updated" });
    },
  });

  const courses: any[] = (data?.courses || []).filter((c: any) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Courses"
      subtitle="Review, moderate, and feature courses across the platform"
      breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Courses" }]}
    >
      <div className="max-w-6xl py-6">

        {/* Stats + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-3">
            {[
              { label: "Total",     value: data?.courses?.length ?? 0,                                              color: "text-gray-900"  },
              { label: "Published", value: data?.courses?.filter((c: any) => c.status === "published").length ?? 0, color: "text-green-600" },
              { label: "Featured",  value: data?.courses?.filter((c: any) => c.is_featured).length ?? 0,            color: "text-violet-600"},
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 text-center min-w-[72px]">
                <p className={`text-xl font-extrabold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 sm:w-64">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
              className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5 text-left">Course</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Moderation</th>
                  <th className="px-4 py-3.5 text-right">Enrolled</th>
                  <th className="px-4 py-3.5 text-right">Price</th>
                  <th className="px-4 py-3.5 text-left">Created</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                    ))
                  : courses.length === 0
                  ? <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No courses found</td></tr>
                  : courses.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 shrink-0">
                              <BookOpen className="h-4 w-4 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 max-w-[220px] truncate">{c.title}</p>
                              {c.is_featured && (
                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-4 text-center"><StatusBadge status={c.moderation_status || "pending"} /></td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-700">
                          <span className="flex items-center justify-end gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {(c.enrolled_count || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-700">{fmtRupee(c.price || 0)}</td>
                        <td className="px-4 py-4 text-xs text-gray-400">{formatDate(c.created_at)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {c.moderation_status !== "approved" && (
                              <button onClick={() => moderation.mutate({ id: c.id, status: "approved" as const })}
                                disabled={moderation.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1.5 transition-colors border border-green-200">
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </button>
                            )}
                            {c.moderation_status !== "rejected" && (
                              <button onClick={() => moderation.mutate({ id: c.id, status: "rejected" as const })}
                                disabled={moderation.isPending}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-1.5 transition-colors border border-red-200">
                                <XCircle className="h-3 w-3" /> Reject
                              </button>
                            )}
                            <button onClick={() => featureMutation.mutate({ id: c.id, featured: !c.is_featured })}
                              disabled={featureMutation.isPending}
                              className={`inline-flex items-center gap-1 rounded-lg text-[11px] font-bold px-2.5 py-1.5 transition-colors border ${c.is_featured ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200" : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"}`}>
                              {c.is_featured ? <><StarOff className="h-3 w-3" /> Unfeature</> : <><Star className="h-3 w-3" /> Feature</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
