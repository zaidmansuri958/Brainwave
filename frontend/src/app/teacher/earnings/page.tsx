"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight, Banknote, CreditCard, Landmark, Wallet,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2,
  IndianRupee,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { teacherApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// Always show ₹ symbol even for zero — "Free" makes no sense in earnings context
function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ── helpers ────────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

function MetricCard({
  icon: Icon, label, value, hint, iconBg, iconColor, loading,
}: {
  icon: React.ElementType; label: string; value: string;
  hint: string; iconBg: string; iconColor: string; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-28 mb-1" />
          <Skeleton className="h-4 w-20 mt-2" />
        </>
      ) : (
        <>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
          <p className="text-xs text-gray-400 mt-1">{hint}</p>
        </>
      )}
    </div>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    failed:    "bg-red-50   text-red-700   border-red-200",
    cancelled: "bg-gray-100 text-gray-600  border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${map[status] ?? map.cancelled}`}>
      {status}
    </span>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────
export default function TeacherEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-earnings"],
    queryFn:  () => teacherApi.earnings().then(r => r.data),
  });

  const transactions: any[] = data?.transactions || [];
  const payouts:      any[] = data?.payouts      || [];

  const metrics = [
    {
      icon: Wallet,   label: "Gross Sales",     value: fmtRupee(data?.total_earned_alltime || 0),
      hint: "All successful course purchases",  iconBg: "bg-blue-50",   iconColor: "text-blue-600",
    },
    {
      icon: Landmark, label: "Platform Cut",    value: fmtRupee(data?.platform_cut_alltime || 0),
      hint: "Fees retained by Brainwave",       iconBg: "bg-amber-50",  iconColor: "text-amber-600",
    },
    {
      icon: Banknote, label: "Net Earned",      value: fmtRupee(data?.net_earned_alltime   || 0),
      hint: "Your lifetime realized earnings",  iconBg: "bg-green-50",  iconColor: "text-green-600",
    },
    {
      icon: CreditCard, label: "Pending Payout", value: fmtRupee(data?.pending_payout      || 0),
      hint: "Queued for next payout cycle",     iconBg: "bg-violet-50", iconColor: "text-violet-600",
    },
  ];

  return (
    <DashboardLayout
      title="Earnings & Payouts"
      subtitle="Track your lifetime revenue, platform fees, and payout history"
      breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Earnings" }]}
    >
      <div className="max-w-5xl py-6">

        {/* ── Metric cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map(m => (
            <MetricCard key={m.label} {...m} loading={isLoading} />
          ))}
        </div>

        {/* ── Two-column content ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Revenue timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Revenue Timeline</h2>
                <p className="text-[11px] text-gray-400">Latest sales flowing into your account</p>
              </div>
              {!isLoading && transactions.length > 0 && (
                <span className="ml-auto text-[11px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                  {transactions.length} records
                </span>
              )}
            </div>

            <div className="p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mb-3">
                    <IndianRupee className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No transactions yet</p>
                  <p className="text-xs text-gray-400">Sales will appear here once students enroll</p>
                </div>
              ) : (
                transactions.map((item: any, i: number) => (
                  <div key={`${item.date}-${i}`}
                    className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-violet-50/30 hover:border-violet-100 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 shrink-0 mt-0.5">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                        {(item.payment_type || "sale").replace(/_/g, " ")}
                      </p>
                      <p className="text-base font-extrabold text-gray-900">
                        {fmtRupee(item.your_earning || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Gross {fmtRupee(item.gross || 0)}
                        <span className="mx-1.5 text-gray-300">·</span>
                        Fee {fmtRupee(item.platform_cut || 0)}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-400 shrink-0 pt-1">{formatDate(item.date)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payouts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
                <Banknote className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Payout History</h2>
                <p className="text-[11px] text-gray-400">Settled amounts from your balance</p>
              </div>
              {!isLoading && payouts.length > 0 && (
                <span className="ml-auto text-[11px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                  {payouts.length} payouts
                </span>
              )}
            </div>

            <div className="p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
              ) : payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mb-3">
                    <Landmark className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No payouts yet</p>
                  <p className="text-xs text-gray-400">Payouts are processed on a two-week cycle</p>
                </div>
              ) : (
                payouts.map((item: any) => (
                  <div key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-violet-50/30 hover:border-violet-100 transition-colors">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                      item.status === "completed" ? "bg-green-100"
                      : item.status === "pending"  ? "bg-amber-100"
                      : "bg-gray-100"
                    }`}>
                      {item.status === "completed"
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : item.status === "pending"
                        ? <Clock className="h-4 w-4 text-amber-600" />
                        : <AlertCircle className="h-4 w-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-extrabold text-gray-900">
                        {fmtRupee(item.amount || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Initiated {formatDate(item.initiated_at)}
                      </p>
                    </div>
                    <PayoutStatusBadge status={item.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── How payouts work ─────────────────────────────────────────── */}
        <div className="mt-6 bg-violet-50 rounded-2xl border border-violet-100 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 shrink-0">
              <CreditCard className="h-4.5 w-4.5 h-[18px] w-[18px] text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-violet-900 mb-1">How payouts work</p>
              <p className="text-xs text-violet-700 leading-relaxed">
                Earnings accumulate in your pending balance and are disbursed to your bank account when the
                platform processes a payout (you can also <strong>request a payout</strong> once you&apos;ve added your bank details).
                The platform retains its commission before settlement — what you see as &quot;Net Earned&quot; is yours.
                Refunded purchases reverse the corresponding platform cut.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
