"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  RefreshCw, CheckCircle2, XCircle, Loader2,
  BookOpen, User, Clock, AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminRefundsPage() {
  const qc = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn:  () => adminApi.refunds().then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveRefund(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-refunds"] });
      toast({ title: "Refund approved ✓" });
    },
    onError: () => toast({ title: "Action failed", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectRefund(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-refunds"] });
      setRejectingId(null);
      setRejectReason("");
      toast({ title: "Refund rejected" });
    },
    onError: () => toast({ title: "Action failed", variant: "destructive" }),
  });

  const refunds: any[] = data?.refunds || [];

  return (
    <DashboardLayout
      title="Refund Requests"
      subtitle="Review and action pending student refund requests"
      breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Refunds" }]}
    >
      <div className="max-w-4xl py-6">

        {/* Count badge */}
        {refunds.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 text-sm font-semibold text-red-700 mb-6">
            <AlertCircle className="h-4 w-4" />
            {refunds.length} pending refund{refunds.length !== 1 ? "s" : ""} require action
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
        ) : refunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-base font-bold text-gray-900 mb-1">No pending refunds</p>
            <p className="text-sm text-gray-500">All refund requests have been handled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <User className="h-4 w-4 text-gray-400" />
                        {r.student_name}
                      </div>
                      <span className="text-gray-300">·</span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-[200px]">{r.course_name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-0.5">Reason</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize">{(r.reason || "—").replace(/_/g, " ")}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-0.5">Watch Progress</p>
                        <p className="text-sm font-semibold text-gray-800">{Number(r.watch_percent || 0).toFixed(1)}%</p>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${r.watch_percent || 0}%` }} />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[11px] text-gray-400 mb-0.5">Requested</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-800">{formatDate(r.requested_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reject reason input */}
                    {rejectingId === r.id && (
                      <div className="mt-3">
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          rows={2}
                          placeholder="Reason for rejection (required)"
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
                        />
                        <div className="flex gap-2.5 mt-2">
                          <button
                            onClick={() => rejectMutation.mutate({ id: r.id, reason: rejectReason })}
                            disabled={!rejectReason.trim() || rejectMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 disabled:opacity-50 transition-colors"
                          >
                            {rejectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                            Confirm Reject
                          </button>
                          <button onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {rejectingId !== r.id && (
                    <div className="flex gap-2.5 shrink-0">
                      <button
                        onClick={() => approveMutation.mutate(r.id)}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2.5 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
