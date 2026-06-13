"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  IndianRupee, Loader2, ArrowUpRight, Landmark, TrendingUp, Banknote, Zap,
  Users, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, X, Send, FlaskConical,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-200",
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    processing:"bg-blue-50  text-blue-700  border-blue-200",
    failed:    "bg-red-50   text-red-700   border-red-200",
    refunded:  "bg-gray-100 text-gray-600  border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

const PAYOUT_STATUS_ICON: Record<string, any> = {
  completed: CheckCircle2,
  processing: Clock,
  pending: Clock,
  failed: XCircle,
};

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn:  () => adminApi.payments().then(r => r.data),
  });

  const { data: payoutData, isLoading: payoutsLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn:  () => adminApi.payouts().then(r => r.data),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-payments"] });
    qc.invalidateQueries({ queryKey: ["admin-payouts"] });
  };

  const processAll = useMutation({
    mutationFn: () => adminApi.processPayouts(),
    onSuccess: (res: any) => {
      invalidate();
      setConfirmOpen(false);
      const { count = 0, failed_count = 0 } = res.data || {};
      toast({
        title: `Payout rollout complete`,
        description: `${count} teacher(s) paid${failed_count ? `, ${failed_count} failed` : ""}.`,
        variant: failed_count ? "destructive" : undefined,
      });
    },
    onError: () => toast({ title: "Payout rollout failed", variant: "destructive" }),
  });

  const payOne = useMutation({
    mutationFn: (teacherId: string) => adminApi.processPayouts(teacherId),
    onSuccess: (res: any) => {
      invalidate();
      const ok = (res.data?.count ?? 0) > 0;
      toast({
        title: ok ? "Payout sent" : "Payout failed",
        description: ok ? undefined : (res.data?.failed?.[0]?.reason || "Could not process payout"),
        variant: ok ? undefined : "destructive",
      });
    },
    onError: () => toast({ title: "Payout failed", variant: "destructive" }),
  });

  const payments: any[] = data?.payments || [];
  const total     = payments.length;
  const completed = payments.filter(p => p.status === "completed").length;
  const totalVol  = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.total_amount || 0), 0);
  const platCut   = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.platform_cut || 0), 0);

  const mode: string = payoutData?.mode || "simulated";
  const eligible = payoutData?.eligible || { count: 0, total: 0, teachers: [] };
  const payouts: any[] = payoutData?.payouts || [];
  const minThreshold = payoutData?.min_threshold ?? 100;
  const busy = processAll.isPending || payOne.isPending;

  return (
    <DashboardLayout
      title="Payments & Payouts"
      subtitle="Monitor transactions and roll out teacher earnings"
      breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Payments" }]}
    >
      <div className="max-w-6xl py-6 space-y-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: IndianRupee, label: "Total Volume",    value: fmtRupee(totalVol), bg: "bg-blue-50",   color: "text-blue-600"   },
            { icon: Landmark,   label: "Platform Revenue", value: fmtRupee(platCut),  bg: "bg-violet-50", color: "text-violet-600" },
            { icon: TrendingUp, label: "Completed",        value: completed,           bg: "bg-green-50",  color: "text-green-600"  },
            { icon: Banknote,   label: "Total Records",    value: total,               bg: "bg-amber-50",  color: "text-amber-600"  },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-xl font-extrabold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Payout rollout panel ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Teacher Payout Rollout</p>
                <p className="text-xs text-violet-200 mt-0.5">Settle all pending balances ≥ {fmtRupee(minThreshold)} in one click</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
              mode === "live" ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40" : "bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40"
            }`}>
              {mode === "live" ? <Zap className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
              {mode === "live" ? "LIVE — real disbursement" : "SIMULATED — no real money"}
            </span>
          </div>

          <div className="p-5">
            {/* Eligible summary + action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{eligible.count}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Users className="h-3 w-3" /> eligible teacher{eligible.count !== 1 ? "s" : ""}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-violet-600">{fmtRupee(eligible.total)}</p>
                  <p className="text-xs text-gray-500">to disburse</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={busy || eligible.count === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-5 py-2.5 transition-colors disabled:opacity-40 shadow-sm shadow-violet-200 shrink-0"
              >
                {processAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {processAll.isPending ? "Processing…" : "Process All Payouts"}
              </button>
            </div>

            {/* Eligible teachers list */}
            {eligible.count > 0 && (
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                {eligible.teachers.map((t: any) => (
                  <div key={t.teacher_id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 shrink-0">
                      {t.name?.[0] || "T"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">{t.email}</p>
                    </div>
                    {mode === "live" && !t.bank_ready && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> No bank details
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-900 shrink-0">{fmtRupee(t.pending)}</span>
                    <button
                      onClick={() => payOne.mutate(t.teacher_id)}
                      disabled={busy}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-semibold px-3 py-1.5 transition-colors disabled:opacity-40"
                    >
                      {payOne.isPending && payOne.variables === t.teacher_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Pay
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!payoutsLoading && eligible.count === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No teachers currently have a pending balance ≥ {fmtRupee(minThreshold)}.</p>
            )}
          </div>
        </div>

        {/* ── Payout history ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Banknote className="h-4.5 w-4.5 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Payout History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Teacher</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payoutsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-7 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                  ))
                ) : payouts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No payouts yet</td></tr>
                ) : payouts.map((p: any) => {
                  const Icon = PAYOUT_STATUS_ICON[p.status] || Clock;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-700">{p.teacher_name}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtRupee(p.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1">
                          <Icon className={`h-3.5 w-3.5 ${
                            p.status === "completed" ? "text-green-600" :
                            p.status === "failed" ? "text-red-500" : "text-blue-500"
                          }`} />
                          <PaymentStatusBadge status={p.status} />
                        </span>
                        {p.status === "failed" && p.failure_reason && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[160px] mx-auto truncate" title={p.failure_reason}>{p.failure_reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.razorpay_payout_id || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.initiated_at ? formatDate(p.initiated_at) : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {p.status === "failed" ? (
                          <button
                            onClick={() => payOne.mutate(p.teacher_id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 hover:border-violet-300 hover:text-violet-700 text-xs font-semibold px-2.5 py-1 transition-colors disabled:opacity-40"
                          >
                            <RefreshCw className="h-3 w-3" /> Retry
                          </button>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Payments table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ArrowUpRight className="h-4.5 w-4.5 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Incoming Payments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5 text-left">Type</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5 text-right">Platform Cut</th>
                  <th className="px-4 py-3.5 text-right">Teacher Earning</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-7 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                    ))
                  : payments.length === 0
                  ? <tr><td colSpan={6} className="text-center py-16 text-gray-400">No payments yet</td></tr>
                  : payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-700 capitalize">{(p.payment_type || "—").replace(/_/g, " ")}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-900">{fmtRupee(p.total_amount || 0)}</td>
                        <td className="px-4 py-3.5 text-right text-red-600 font-semibold">{fmtRupee(p.platform_cut || 0)}</td>
                        <td className="px-4 py-3.5 text-right text-green-600 font-semibold">{fmtRupee(p.teacher_earning || 0)}</td>
                        <td className="px-4 py-3.5 text-center"><PaymentStatusBadge status={p.status} /></td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{formatDate(p.created_at)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {data?.total > payments.length && (
            <div className="px-5 py-3 border-t border-gray-100 text-center text-xs text-gray-400">
              Showing {payments.length} of {data.total} records
            </div>
          )}
        </div>
      </div>

      {/* ── Confirmation modal ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !processAll.isPending && setConfirmOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Confirm payout rollout</h3>
              <button onClick={() => setConfirmOpen(false)} disabled={processAll.isPending} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                You&apos;re about to disburse to <strong>{eligible.count}</strong> teacher{eligible.count !== 1 ? "s" : ""} for a total of{" "}
                <strong className="text-violet-700">{fmtRupee(eligible.total)}</strong>.
              </p>
              <div className={`rounded-xl p-3 text-sm flex items-start gap-2 ${
                mode === "live" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
              }`}>
                {mode === "live" ? <Zap className="h-4 w-4 mt-0.5 shrink-0" /> : <FlaskConical className="h-4 w-4 mt-0.5 shrink-0" />}
                <span>
                  {mode === "live"
                    ? "LIVE mode — real money will be transferred via RazorpayX to teachers' bank accounts."
                    : "SIMULATED mode — payouts will be recorded and marked completed, but no real money moves. Set RAZORPAYX_ACCOUNT_NUMBER to go live."}
                </span>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={processAll.isPending}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => processAll.mutate()}
                  disabled={processAll.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {processAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
