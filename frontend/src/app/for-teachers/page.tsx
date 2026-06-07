"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Upload, Cpu, Users, DollarSign,
  Video, BarChart3, Award, CheckCircle2,
  Play, TrendingUp, Zap, FileText, UserCheck, CreditCard,
  Sparkles, Check, ArrowRightCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";

// ── Data ───────────────────────────────────────────────────────────────────────
const steps = [
  {
    step: "01", icon: Upload,
    title: "Upload your content",
    desc: "Upload videos, PDFs, PPTs or notes in any format.",
  },
  {
    step: "02", icon: Cpu,
    title: "AI builds your course",
    desc: "Our AI generates chapters, lessons, quizzes, and summaries.",
  },
  {
    step: "03", icon: Users,
    title: "Students enroll",
    desc: "Publish your course and students enroll & pay you directly.",
  },
  {
    step: "04", icon: DollarSign,
    title: "Earn and grow",
    desc: "Track earnings, student progress, and grow your brand.",
  },
];

const features = [
  { icon: Video,      title: "Live Classes",         desc: "Host live sessions with HD video, screen sharing & chat." },
  { icon: Zap,        title: "AI Quiz Generator",    desc: "Generate smart quizzes, assignments & assessments in seconds." },
  { icon: BarChart3,  title: "Analytics Dashboard",  desc: "Track enrollments, revenue, completion rates & student performance." },
  { icon: Award,      title: "Certificates",         desc: "Auto-issue beautiful certificates to boost learner trust." },
  { icon: UserCheck,  title: "Student Management",   desc: "Manage students, view progress & engage with ease." },
  { icon: CreditCard, title: "Payouts & Reports",    desc: "Get paid securely and track detailed reports in real-time." },
];

const avatarColors = ["bg-violet-400", "bg-pink-400", "bg-amber-400", "bg-emerald-400"];

export default function ForTeachersPage() {
  const { isAuthenticated, user } = useAuthStore();

  // If already logged in as teacher → go to dashboard, else → register
  const teacherCTA = isAuthenticated()
    ? user?.role === "teacher" ? "/teacher/dashboard" : "/teacher/dashboard"
    : "/register?role=teacher";

  const teacherCTALabel = isAuthenticated() ? "Go to Dashboard" : "Start teaching now";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/40 pt-12 pb-0 lg:pt-16">
        {/* bg blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-100/40 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl pb-12 lg:pb-20"
            >
              <p className="text-xs font-bold text-violet-600 tracking-widest uppercase mb-4">
                For Educators
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
                Turn your expertise into{" "}
                <span className="text-violet-600">a thriving online course</span>
              </h1>
              <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-md">
                Create, manage, and sell high-quality courses with the power of AI.
                Teach smarter. Earn more. Impact millions.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href={teacherCTA}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
                >
                  {teacherCTALabel} <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                    <Play className="h-3 w-3 text-gray-600 fill-gray-600" />
                  </div>
                  View how it works
                </button>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                {["No setup fees", "Keep 100% of your earnings", "Go live in under an hour"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right — teacher image + floating cards */}
            <div className="relative hidden lg:flex items-end justify-center h-[540px]">

              {/* Teacher image */}
              <div className="relative z-10 h-full flex items-end">
                <Image
                  src="/images/teacher.png"
                  alt="Teacher using Brainwave"
                  width={440}
                  height={500}
                  className="object-contain object-bottom h-full w-auto"
                  priority
                />
              </div>

              {/* ── Floating UI cards ── */}

              {/* AI Course Builder — top left */}
              <div className="absolute top-8 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-52 z-20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Cpu className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">AI Course Builder</span>
                </div>
                {["Upload Content", "Generate Structure", "AI Quiz Generator", "Add Thumbnail", "Publish Course"].map((step) => (
                  <div key={step} className="flex items-center gap-2 mb-1.5">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" strokeWidth={3} />
                    <span className="text-[10px] text-gray-600">{step}</span>
                  </div>
                ))}
              </div>

              {/* Revenue — top center */}
              <div className="absolute top-6 left-1/2 -translate-x-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-44 z-20">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Revenue This Month</p>
                <p className="text-xl font-extrabold text-gray-900">$12,450</p>
                <div className="flex items-center gap-1 mt-1 mb-3">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] text-green-600 font-semibold">+34% vs last month</span>
                </div>
                {/* mini chart */}
                <svg viewBox="0 0 80 24" className="w-full h-6">
                  <polyline points="0,20 15,14 30,16 45,8 60,10 80,4" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Students — top right */}
              <div className="absolute top-4 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-40 z-20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-[10px] text-gray-400 font-medium">Students</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900">12,482</p>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">↑ 250 today</p>
                <div className="flex items-center gap-1 mt-2">
                  {avatarColors.map((c, i) => (
                    <div key={i} className={`h-5 w-5 rounded-full ${c} border-2 border-white -ml-1 first:ml-0`} />
                  ))}
                  <span className="text-[9px] text-gray-400 ml-1">+2.5k</span>
                </div>
              </div>

              {/* AI Quiz Generator — bottom left */}
              <div className="absolute bottom-28 left-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-44 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">AI Quiz Generator</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">25</p>
                <p className="text-[10px] text-gray-400">Questions Generated</p>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-1.5 flex-1 rounded-full bg-violet-200" />)}
                  <div className="h-1.5 w-3 rounded-full bg-violet-500 animate-pulse" />
                </div>
              </div>

              {/* Live Session — middle right */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-44 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                    <Video className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">Live Session</span>
                  <span className="ml-auto text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">LIVE</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">247</p>
                <p className="text-[10px] text-gray-400 mb-2">Attendees</p>
                <svg viewBox="0 0 80 20" className="w-full h-4">
                  <polyline points="0,16 20,10 35,12 50,6 65,8 80,3" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Certificates — bottom right */}
              <div className="absolute bottom-24 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-44 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">Certificates Issued</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">1,248</p>
                <p className="text-[10px] text-gray-400">This Month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold text-violet-600 tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              From upload to earning in hours
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0 lg:text-center">
                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-7 left-[calc(50%+32px)] right-0 items-center justify-center">
                    <ArrowRightCircle className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                {/* Icon */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="lg:mt-5">
                  <p className="text-xs font-bold text-gray-400 tracking-widest mb-1">{step}</p>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold text-violet-600 tracking-widest uppercase mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything a teacher needs
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 mb-4">
                  <Icon className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 px-8 py-12 lg:px-14">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-purple-400/10 blur-2xl pointer-events-none" />
            {/* Stars */}
            {[[8,8],[16,4],[6,16],[20,12]].map(([x, y], i) => (
              <Sparkles key={i} className="absolute text-white/20 h-4 w-4" style={{ left: `${x}%`, top: `${y * 4}%` }} />
            ))}

            <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 items-center">

              {/* Left — graduation cap illustration */}
              <div className="hidden lg:flex items-end justify-center h-28 w-28 shrink-0">
                <div className="relative">
                  <div className="text-7xl select-none">🎓</div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl select-none">📚</div>
                </div>
              </div>

              {/* Middle — text */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                  Ready to share your knowledge<br />with the world?
                </h2>
                <p className="text-violet-200 text-sm mb-6">
                  Join 20K+ educators already building their online empire.
                </p>
                <Link
                  href={teacherCTA}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 hover:bg-white hover:text-violet-700 text-white px-6 py-3 text-sm font-bold transition-all"
                >
                  {isAuthenticated() ? "Go to Teacher Dashboard" : "Create your free teacher account"} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Right — avatar stack + count */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex -space-x-2">
                  {["bg-pink-400","bg-amber-400","bg-emerald-400","bg-blue-400","bg-violet-400"].map((c, i) => (
                    <div key={i} className={`h-10 w-10 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xl font-extrabold text-white">20K+</p>
                  <p className="text-xs text-violet-200">Educators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
