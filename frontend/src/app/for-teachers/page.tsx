"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Upload, Sparkles, Video, Users, DollarSign, Shield,
  ArrowRight, Check, BarChart2, BookOpen, Zap,
} from "lucide-react";

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const STEPS = [
  {
    icon: Upload,
    title: "Upload your lectures",
    body: "Drop in your videos, PDFs, or audio recordings — even a phone recording works perfectly.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Sparkles,
    title: "AI builds the course",
    body: "Our AI transcribes, creates chapters, writes quizzes, generates summaries and a thumbnail — in minutes.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Users,
    title: "Students subscribe",
    body: "Set your price. Students enroll and get instant access to your full course plus a personal AI tutor.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: DollarSign,
    title: "You get paid",
    body: "Earnings hit your account every two weeks. You keep up to 92% — one of the lowest commissions in EdTech.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const FEATURES = [
  { icon: Sparkles,   label: "AI course builder",         body: "Transcription, chapters, quizzes, thumbnail — all automated." },
  { icon: Video,      label: "Live sessions",              body: "Host live classes with Jitsi. Students register in one click."  },
  { icon: BarChart2,  label: "Earnings dashboard",        body: "Track revenue, commission tier, and upcoming payouts clearly." },
  { icon: Shield,     label: "Blockchain certificates",   body: "Students earn verifiable certificates on course completion."    },
  { icon: BookOpen,   label: "AI tutor per course",       body: "Every course ships with a 24/7 AI tutor trained on your content." },
  { icon: Users,      label: "Doubt & Q&A sessions",      body: "Structured Q&A sessions keep students engaged and progressing." },
];

const COMMISSION = [
  { tier: "Starter",  range: "< 500 students",   rate: "10%", keep: "90%", highlight: false },
  { tier: "Growth",   range: "500–5,000 students", rate: "9%",  keep: "91%", highlight: true  },
  { tier: "Scale",    range: "5,000+ students",   rate: "8%",  keep: "92%", highlight: false },
];

export default function ForTeachersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ background: "#FCF8F1" }} className="pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.span
            {...up(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-indigo-600 mb-6"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
          >
            <Zap className="w-3 h-3 fill-indigo-500" />
            For Educators &amp; Coaches
          </motion.span>

          <motion.h1
            {...up(0.07)}
            className="font-display font-extrabold text-gray-950 tracking-tight leading-[1.03] mb-6"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)" }}
          >
            Your offline lectures,<br />
            <span style={{ background: "linear-gradient(120deg,#4f46e5,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              fully digital in minutes.
            </span>
          </motion.h1>

          <motion.p {...up(0.14)} className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Upload your recordings. Brainwave's AI builds the complete course — chapters, quizzes,
            summaries, thumbnail, and a personal AI tutor for every student.
            You just teach. We handle everything else.
          </motion.p>

          <motion.div {...up(0.21)} className="flex flex-wrap gap-4 justify-center mb-6">
            <Link href="/register?role=teacher">
              <span
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white cursor-pointer transition-transform active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 6px 22px rgba(99,102,241,0.35)" }}
              >
                Start teaching free
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <Link href="/pricing">
              <span className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-base text-gray-700 cursor-pointer border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-700 transition-all">
                See commission rates
              </span>
            </Link>
          </motion.div>

          <motion.p {...up(0.27)} className="text-sm text-gray-400">
            No setup fee. No monthly charge. Pay only when you earn.
          </motion.p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div {...up(0)} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3">How it works</p>
            <h2 className="font-display font-extrabold text-3xl text-gray-950">From recording to revenue in 4 steps</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} {...up(i * 0.08)}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">Step {i + 1}</span>
                  <h3 className="font-display font-bold text-gray-900 mt-1 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commission tiers ── */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div {...up(0)} className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3">Commission model</p>
            <h2 className="font-display font-extrabold text-3xl text-gray-950 mb-3">Keep more as you grow</h2>
            <p className="text-gray-400">Commission drops automatically as your student base grows. No negotiation needed.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {COMMISSION.map((c, i) => (
              <motion.div key={c.tier} {...up(i * 0.08)}>
                <div
                  className={`rounded-2xl p-6 border text-center h-full ${
                    c.highlight
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-100 bg-[#FAFAF9]"
                  }`}
                >
                  {c.highlight && (
                    <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full mb-4">
                      Most popular
                    </span>
                  )}
                  <p className="font-display font-extrabold text-4xl text-gray-950 mb-1">{c.keep}</p>
                  <p className="text-sm font-semibold text-gray-500 mb-4">you keep</p>
                  <div className="text-xs text-gray-400 mb-1">Platform commission: <span className="font-bold text-gray-700">{c.rate}</span></div>
                  <div className="text-xs text-gray-400">{c.range}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...up(0.3)} className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-amber-700">!</span>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              High-volume teachers (5,000+ students) can negotiate further.
              Contact us — we've gone as low as <strong>6%</strong> for top creators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div {...up(0)} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-3">Everything you get</p>
            <h2 className="font-display font-extrabold text-3xl text-gray-950">Built for serious educators</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label} {...up(i * 0.06)}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 h-full hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-gray-900 mb-1">{f.label}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div {...up(0)}>
            <div
              className="rounded-3xl p-10"
              style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)" }}
            >
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">
                Ready to go digital?
              </h2>
              <p className="text-indigo-200 text-base mb-8 leading-relaxed">
                Join 1,200+ teachers already earning on Brainwave. Set up your first course today — free, no card required.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/register?role=teacher">
                  <span className="inline-flex items-center gap-2.5 bg-white text-indigo-700 px-7 py-3.5 rounded-full font-bold text-sm cursor-pointer hover:bg-indigo-50 transition-colors">
                    Create teacher account <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="/pricing">
                  <span className="inline-flex items-center gap-2.5 border border-white/30 text-white px-7 py-3.5 rounded-full font-bold text-sm cursor-pointer hover:bg-white/10 transition-colors">
                    View pricing
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
