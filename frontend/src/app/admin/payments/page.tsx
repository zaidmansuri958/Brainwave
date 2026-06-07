"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IndianRupee, Loader2, ArrowUpRight, Landmark, TrendingUp, Banknote, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-200",
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    failed:    "bg-red-50   text-red-700   border-red-200",
    refunded:  "bg-gray-100 text-gray-600  border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn:  () => adminApi.payments().then(r => r.data),
  });

  const processPayout = useMutation({
    mutationFn: () => adminApi.processPayouts(),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({ title: `Payouts processed for ${res.data?.count ?? 0} teacher(s)` });
    },
    onError: () => toast({ title: "Payout failed", variant: "destructive" }),
  });

  const payments: any[] = data?.payments || [];
  const total     = payments.length;
  const completed = payments.filter(p => p.status === "completed").length;
  const totalVol  = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.total_amount || 0), 0);
  const platCut   = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.platform_cut || 0), 0);

  return (
    <DashboardLayout
      title="Payments"
      subtitle="Monitor all transactions and trigger teacher payouts"
      breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Payments" }]}
    >
      <div className="max-w-6xl py-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Payout trigger */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-bold text-violet-900">Process Teacher Payouts</p>
            <p className="text-xs text-violet-600 mt-0.5">Settle all pending teacher balances ≥ ₹100 in one click.</p>
          </div>
          <button
            onClick={() => processPayout.mutate()}
            disabled={processPayout.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-5 py-2.5 transition-colors disabled:opacity-50 shadow-sm shadow-violet-200 shrink-0"
          >
            {processPayout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {processPayout.isPending ? "Processing…" : "Process All Payouts"}
          </button>
        </div>

        {/* Payments table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
    </DashboardLayout>
  );
}
