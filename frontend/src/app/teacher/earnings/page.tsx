"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Banknote, CreditCard, Landmark, Wallet } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { teacherApi } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import { MetricCard, PanelCard, PanelHero, PanelPage, SectionHeader } from "@/components/panels/PanelPrimitives";

export default function TeacherEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-earnings"],
    queryFn: () => teacherApi.earnings().then((r) => r.data),
  });

  const transactions = data?.transactions || [];
  const payouts = data?.payouts || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <PanelPage>
        <PanelHero
          eyebrow="Faculty Panel"
          title="Earnings and payouts."
          description="One place to track lifetime revenue, current payout balance, and how platform economics are flowing across your products."
          chips={[
            `${transactions.length} recent transactions`,
            `${payouts.length} payout records`,
          ]}
        />

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Wallet} label="Gross Sales" value={formatPrice(data?.total_earned_alltime || 0)} hint="All successful course purchases" tone="blue" />
          <MetricCard icon={Landmark} label="Platform Cut" value={formatPrice(data?.platform_cut_alltime || 0)} hint="Fees retained by the platform" tone="amber" />
          <MetricCard icon={Banknote} label="Net Earned" value={formatPrice(data?.net_earned_alltime || 0)} hint="Your lifetime realized earnings" tone="green" />
          <MetricCard icon={CreditCard} label="Pending Payout" value={formatPrice(data?.pending_payout || 0)} hint="Queued for the next payout cycle" tone="violet" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <PanelCard>
            <SectionHeader title="Revenue timeline" description="The latest sales flowing into your account." />
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-[1.25rem] bg-slate-100" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white/70 px-5 py-10 text-center text-sm text-slate-500">
                No completed transactions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((item: any, index: number) => (
                  <div key={`${item.date}-${index}`} className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{(item.payment_type || "sale").replace(/_/g, " ")}</p>
                        <p className="mt-2 text-lg font-black text-slate-950">{formatPrice(item.your_earning || 0)}</p>
                        <p className="mt-1 text-sm text-slate-500">Gross {formatPrice(item.gross || 0)} • Platform fee {formatPrice(item.platform_cut || 0)}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-xs font-medium text-slate-400">{formatDate(item.date)}</p>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <SectionHeader title="Payouts" description="What has already moved from pending balance into settlement." />
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-[1.25rem] bg-slate-100" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white/70 px-5 py-10 text-center text-sm text-slate-500">
                No payout records yet.
              </p>
            ) : (
              <div className="space-y-3">
                {payouts.map((item: any) => (
                  <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-slate-950">{formatPrice(item.amount || 0)}</p>
                        <p className="mt-1 text-sm capitalize text-slate-500">{item.status}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-4 text-xs font-medium text-slate-400">Initiated {formatDate(item.initiated_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        </section>
      </PanelPage>
      <Footer />
    </div>
  );
}
