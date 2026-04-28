"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeIndianRupee, Calculator, ShieldCheck, Wallet } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/stores/authStore";
import { AppShell, ContentBand, SectionHeader } from "@/components/ui/app-shell";

const tiers = [
  { name: "Starter", rate: "10%", keep: "90%", description: "For educators launching their first cohort." },
  { name: "Growth", rate: "9%", keep: "91%", description: "For teachers with growing momentum and recurring launches." },
  { name: "Scale", rate: "8%", keep: "92%", description: "For high-volume educators with strong repeat demand." },
];

const faqs = [
  {
    q: "How does teacher commission work?",
    a: "Brainwave only earns when a teacher earns. Commission is applied to completed transactions and decreases as the teacher scales.",
  },
  {
    q: "When do payouts happen?",
    a: "Payouts are processed on a two-week cycle, with clearer pending and earned breakdowns inside the teacher dashboard.",
  },
  {
    q: "What happens with refunds?",
    a: "Refund logic stays transparent: refunded purchases reverse the corresponding platform cut, and the redesigned admin view surfaces this more clearly.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, isTeacher } = useAuthStore();
  const [sampleSales, setSampleSales] = useState(100000);

  useEffect(() => {
    if (isAuthenticated() && !isTeacher()) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isTeacher, router]);

  return (
    <AppShell>
      <Navbar />
      <main className="bw-shell space-y-6 pb-10">
        <ContentBand muted>
          <SectionHeader
            eyebrow="Teacher Pricing"
            title="Transparent platform pricing built for teacher trust."
            description="Clear commission tiers, interactive payout math, and operational transparency for investor-grade positioning."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 md:grid-cols-3">
              {tiers.map((tier) => (
                <div key={tier.name} className="bw-card p-5">
                  <p className="bw-kicker">{tier.name}</p>
                  <p className="mt-4 font-display text-4xl font-extrabold text-ink-heading">{tier.keep}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">you keep</p>
                  <p className="mt-4 text-sm text-slate-500">{tier.description}</p>
                  <div className="mt-5 rounded-[1.2rem] bg-[#f7f8fa] px-4 py-3 text-sm font-semibold text-ink-body">
                    Platform commission: {tier.rate}
                  </div>
                </div>
              ))}
            </div>

            <div className="bw-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebebff] text-brand-primary">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-ink-heading">Payout example</p>
                  <p className="text-sm text-slate-500">Adjust the revenue estimate to see what a teacher keeps.</p>
                </div>
              </div>
              <div className="mt-6">
                <input
                  type="range"
                  min={25000}
                  max={500000}
                  step={25000}
                  value={sampleSales}
                  onChange={(event) => setSampleSales(Number(event.target.value))}
                  className="w-full accent-[#1a1aff]"
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] bg-[#f7f8fa] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Gross sales</p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-slate-950">₹{sampleSales.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-[1.2rem] bg-rose-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">Platform cut</p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-rose-900">₹{Math.round(sampleSales * 0.1).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-[1.2rem] bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Teacher keeps</p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-emerald-900">₹{Math.round(sampleSales * 0.9).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/register?role=teacher" className="bw-action-primary">
                  Start teaching free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/for-teachers" className="bw-action-secondary">
                  Learn how the studio works
                </Link>
              </div>
            </div>
          </div>
        </ContentBand>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ContentBand className="h-full">
            <SectionHeader eyebrow="Trust" title="Pricing is backed by payout and refund clarity." />
            <div className="mt-6 space-y-3">
              {[
                { icon: Wallet, title: "Two-week payout rhythm", body: "Teachers can now see pending and earned payouts more clearly inside denser studio panels." },
                { icon: ShieldCheck, title: "Refund handling with visibility", body: "Admin operations now show refund state, watch percentage, and next actions in a much clearer review flow." },
                { icon: BadgeIndianRupee, title: "No hidden monthly fees", body: "The pricing page foregrounds what teachers keep and avoids generic empty marketing sections." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bw-card flex gap-4 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-950">{item.title}</p>
                      <p className="bw-muted mt-2 text-sm leading-7">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentBand>

          <ContentBand muted className="h-full">
            <SectionHeader eyebrow="FAQs" title="Common pricing questions" />
            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="bw-card p-5">
                  <p className="font-display text-lg font-bold text-slate-950">{faq.q}</p>
                  <p className="bw-muted mt-2 text-sm leading-7">{faq.a}</p>
                </div>
              ))}
            </div>
          </ContentBand>
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}
