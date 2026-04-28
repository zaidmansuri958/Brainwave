"use client";

import Link from "next/link";
import { ArrowRight, Banknote, BarChart3, Sparkles, Upload, Video, Wallet } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell, ContentBand, InsightCard, SectionHeader } from "@/components/ui/app-shell";

const steps = [
  { title: "Record once", description: "Upload lectures, notes, or recordings from any setup.", icon: Upload, accentClass: "bg-indigo-50 text-indigo-600" },
  { title: "AI builds the structure", description: "Generate curriculum, thumbnails, quizzes, summaries, and launch-ready content.", icon: Sparkles, accentClass: "bg-sky-50 text-sky-600" },
  { title: "Teach with confidence", description: "Run live sessions, engage the community, and manage students in one studio.", icon: Video, accentClass: "bg-amber-50 text-amber-600" },
  { title: "Track and grow revenue", description: "Use analytics, promotions, and transparent payouts to scale sustainably.", icon: BarChart3, accentClass: "bg-emerald-50 text-emerald-600" },
];

export default function ForTeachersPage() {
  return (
    <AppShell>
      <Navbar />
      <main className="bw-shell space-y-6 pb-6">
        <ContentBand muted>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="eyebrow mb-4">For Educators & Coaches</span>
              <h1 className="font-display text-[clamp(2.5rem,5.4vw,4.8rem)] font-extrabold leading-[1.02] text-slate-950">
                Your offline expertise,
                <br />
                <span className="text-gradient-indigo">turned into a premium digital classroom.</span>
              </h1>
              <p className="bw-muted mt-5 max-w-2xl text-base leading-8">
                The redesigned teacher experience feels like a creator studio, not a plain admin tool. Launch faster, guide students
                better, and understand revenue, content, and learner progress without fighting the interface.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register?role=teacher" className="bw-action-primary">
                  Start teaching free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="bw-action-secondary">
                  <Wallet className="h-4 w-4" />
                  View commission model
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bw-card p-5">
                <p className="bw-kicker">Teacher Studio Snapshot</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] bg-[#f8f2eb] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Launch speed</p>
                    <p className="mt-2 font-display text-3xl font-extrabold text-slate-950">2 min</p>
                    <p className="mt-1 text-xs text-slate-500">Lecture to structured course</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">Your keep rate</p>
                    <p className="mt-2 font-display text-3xl font-extrabold text-indigo-950">Up to 92%</p>
                    <p className="mt-1 text-xs text-indigo-800">Transparent, teacher-friendly pricing</p>
                  </div>
                </div>
              </div>
              <div className="bw-card-soft p-5">
                <p className="bw-kicker">Workflow</p>
                <div className="mt-4 space-y-3">
                  {["Upload lecture assets", "AI generates structure", "Review + publish", "Sell, teach, and get paid"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-[1.2rem] bg-white px-4 py-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{index + 1}</span>
                      <p className="text-sm font-medium text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ContentBand>

        <ContentBand>
          <SectionHeader
            eyebrow="Studio Benefits"
            title="Built for serious educators"
            description="Less white space, stronger grouping, and clearer calls to action give teachers a more operational, premium working environment."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <InsightCard key={step.title} {...step} className="h-full" />
            ))}
          </div>
        </ContentBand>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ContentBand className="h-full">
            <SectionHeader eyebrow="Economics" title="Teacher revenue should feel transparent." description="The pricing experience now speaks in plain outcomes: what you keep, when you get paid, and where growth unlocks better rates." />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { value: "10%", label: "Starter commission" },
                { value: "9%", label: "Growth tier" },
                { value: "8%", label: "Scale tier" },
              ].map((item) => (
                <div key={item.label} className="bw-card p-4 text-center">
                  <p className="font-display text-3xl font-extrabold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </ContentBand>

          <ContentBand muted className="h-full">
            <SectionHeader eyebrow="Trust Signals" title="Operational clarity for real teaching businesses." />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="bw-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Banknote className="h-5 w-5" />
                </div>
                <p className="mt-4 font-display text-xl font-bold text-slate-950">Predictable payouts</p>
                <p className="bw-muted mt-2 text-sm leading-7">Earnings, pending payouts, tier progress, and commission logic are now easier to understand at a glance.</p>
              </div>
              <div className="bw-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="mt-4 font-display text-xl font-bold text-slate-950">Actionable analytics</p>
                <p className="bw-muted mt-2 text-sm leading-7">Use performance data, student signals, and content insights without sifting through sparse, generic tables.</p>
              </div>
            </div>
          </ContentBand>
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}
