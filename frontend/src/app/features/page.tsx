import { BarChart3, Brain, GraduationCap, Shield, Sparkles, Wallet } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell, ContentBand, InsightCard, SectionHeader } from "@/components/ui/app-shell";

const modules = [
  {
    title: "Create with AI structure",
    description: "Upload a lecture once and let Brainwave generate chapters, quizzes, summaries, thumbnails, and launch-ready materials.",
    icon: Sparkles,
    accentClass: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Teach from a real studio",
    description: "Manage curriculum, live sessions, doubt workflows, students, and promotions inside denser creator-first dashboards.",
    icon: GraduationCap,
    accentClass: "bg-amber-50 text-amber-600",
  },
  {
    title: "Learn with better momentum",
    description: "Resume the right lesson faster, access AI support natively, and stay oriented with clearer status and progress surfaces.",
    icon: Brain,
    accentClass: "bg-sky-50 text-sky-600",
  },
  {
    title: "Track what matters",
    description: "Teacher analytics, learner progress, risk alerts, and moderation queues now sit inside cleaner high-density panels.",
    icon: BarChart3,
    accentClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Earn with clarity",
    description: "Pricing, commissions, payouts, and course performance all feel more transparent, trustworthy, and easier to act on.",
    icon: Wallet,
    accentClass: "bg-rose-50 text-rose-600",
  },
  {
    title: "Trust every outcome",
    description: "Notifications, certificates, guarded states, and account flows use stronger visual cues without sacrificing accessibility.",
    icon: Shield,
    accentClass: "bg-violet-50 text-violet-600",
  },
];

export default function FeaturesPage() {
  return (
    <AppShell>
      <Navbar />
      <main className="bw-shell space-y-6 pb-6">
        <ContentBand muted className="overflow-hidden">
          <SectionHeader
            eyebrow="Platform Features"
            title="A premium education system across discovery, teaching, learning, and operations."
            description="The refreshed Brainwave UI is intentionally lighter, denser, and more interactive. Every page now works harder: less blank space, stronger hierarchy, richer proof, and clearer calls to action."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => (
                <InsightCard key={module.title} {...module} className="h-full" />
              ))}
            </div>
            <div className="bw-card bw-card-tint p-6">
              <p className="bw-kicker">What changed materially</p>
              <div className="mt-5 space-y-4">
                {[
                  "Heroes now combine proof, action, and visual structure instead of oversized empty space.",
                  "Course discovery uses richer cards, smarter filters, and clearer result headers.",
                  "Learner and teacher shells share a stronger surface system, but each keeps its own workflow identity.",
                  "Admin views move closer to an operations console with denser tables and status hierarchy.",
                ].map((item) => (
                  <div key={item} className="rounded-[1.3rem] bg-white/90 p-4 text-sm leading-7 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentBand>
      </main>
      <Footer />
    </AppShell>
  );
}
