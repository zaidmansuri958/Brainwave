"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Upload, Check, Play, Sparkles, BarChart2, Award } from "lucide-react";

const exams = ["JEE Advanced", "NEET", "CA Foundation", "UPSC", "GATE", "MBA CAT"];

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const lessons = [
  { title: "Backpropagation Explained",  done: true  },
  { title: "Building Your First Model",   done: true  },
  { title: "Overfitting & Regularisation",done: false },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-[#FAFAF9] overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Accent blooms */}
      <div className="absolute -top-32 right-0 w-[700px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(99,102,241,0.09) 0%, transparent 65%)" }} />
      <div className="absolute bottom-0 -left-24 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 70%, rgba(124,58,237,0.07) 0%, transparent 65%)" }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── LEFT ── */}
          <div>
            {/* Badge */}
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-[11px] font-bold tracking-wide text-gray-600 mb-8 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-dot-pulse" />
                AI-powered · Live classes · Verified certificates
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.07)}
              className="font-display font-extrabold text-gray-950 leading-[1.02] tracking-[-0.03em] mb-6"
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 5rem)" }}
            >
              The classroom
              <br />
              for India&apos;s
              <br />
              <span style={{
                background: "linear-gradient(125deg, #4338CA 0%, #7C3AED 60%, #6366F1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                next million.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              {...fadeUp(0.15)}
              className="text-gray-500 leading-relaxed mb-10 max-w-[480px]"
              style={{ fontSize: "clamp(1rem, 1.7vw, 1.15rem)" }}
            >
              Teachers upload their lectures — our AI builds the full course: chapters, quizzes, summaries and a personal tutor for every student. No setup required.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="/register">
                <button className="group inline-flex items-center gap-2.5 bg-gray-950 text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-[#1a1f35] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                  Start for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/register?role=teacher">
                <button className="inline-flex items-center gap-2.5 bg-white text-gray-700 px-7 py-3.5 rounded-xl font-bold text-sm border border-gray-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/60 active:scale-[0.98] transition-all">
                  <Upload className="w-4 h-4" />
                  Teach on Brainwave
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["#4F46E5","#7C3AED","#DB2777","#D97706","#059669"].map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#FAFAF9] flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: c }}>
                      {["A","R","S","P","M"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-gray-900">50,000+</span> learners across India
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-gray-200" />

              <div className="flex items-center gap-5 text-xs text-gray-500">
                {[{ v:"500+",l:"Courses"},{v:"1,200+",l:"Teachers"},{v:"98%",l:"Completion"}].map(({v,l})=>(
                  <div key={l}>
                    <span className="block font-bold text-gray-900 text-sm">{v}</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Exam tags */}
            <motion.div {...fadeUp(0.37)}>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-3">Courses for</p>
              <div className="flex flex-wrap gap-2">
                {exams.map((e) => (
                  <span key={e} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-500 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-colors cursor-default">
                    {e}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT — genuine product preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            {/* Main course card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)" }}
            >
              {/* Course header */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 pt-6 pb-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-200">Machine Learning</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 bg-white/15 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Live now
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-white text-xl leading-snug">
                  Deep Learning<br />Fundamentals
                </h3>
                <p className="text-indigo-200 text-xs mt-1.5">Dr. Amit Kumar · 42 lessons</p>
              </div>

              {/* Progress */}
              <div className="px-6 -mt-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                    <span className="font-semibold">Your progress</span>
                    <span className="font-bold text-indigo-600">68%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.6, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="px-6 pt-4 pb-4">
                {lessons.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${l.done ? "bg-indigo-600" : "border-2 border-gray-200 bg-white"}`}>
                      {l.done
                        ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        : <Play className="w-2.5 h-2.5 text-gray-300 fill-gray-300" />}
                    </div>
                    <span className={`text-xs leading-snug ${l.done ? "text-gray-400 line-through decoration-gray-300" : "text-gray-800 font-semibold"}`}>
                      {l.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Tutor strip */}
              <div className="mx-4 mb-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">AI Tutor</span>
                </div>
                <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                  "Backpropagation computes gradients layer by layer using the chain rule — think of it as tracing credit backwards through each neuron."
                </p>
              </div>
            </motion.div>

            {/* Floating: Teacher earnings */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute -left-12 top-16 bg-white rounded-2xl border border-gray-100 px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">This month</span>
              </div>
              <p className="font-display font-extrabold text-xl text-gray-900">₹84,200</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">+18% from last month</p>
            </motion.div>

            {/* Floating: Certificate */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -right-8 bottom-16 bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Certificate earned</p>
                <p className="text-[10px] text-gray-400">Blockchain verified</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
