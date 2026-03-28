"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Award, Check, Play } from "lucide-react";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] as any },
});

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#060B18]">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute rounded-full bg-blue-600/[0.18] blur-[120px]"
          style={{ width: 700, height: 700, top: "-15%", left: "-10%" }}
          animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-violet-600/[0.14] blur-[100px]"
          style={{ width: 500, height: 500, bottom: "-5%", right: "5%" }}
          animate={{ x: [0, -30, 0], y: [0, -35, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-cyan-500/[0.08] blur-[90px]"
          style={{ width: 350, height: 350, top: "45%", right: "25%" }}
          animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid dot pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: Text ── */}
          <div>
            {/* Badge */}
            <motion.div {...fadeUp(0.1)}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                India&apos;s AI-Powered Learning Platform
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.2)}
              className="text-5xl lg:text-[4rem] xl:text-[4.5rem] font-extrabold leading-[1.06] tracking-tight text-white mb-6"
            >
              Learn Smarter.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Teach Better.
              </span>
              <br />
              Grow Faster.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              {...fadeUp(0.35)}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg"
            >
              Upload a recording — our AI automatically generates chapters,
              quizzes, and summaries. Students get an AI tutor, live sessions,
              and blockchain-verified certificates.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.48)} className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/courses">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 35px rgba(79, 142, 247, 0.45)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-8 py-4 rounded-2xl font-semibold text-[0.95rem] shadow-xl shadow-blue-500/20"
                >
                  Start Learning Free
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </Link>
              <Link href="/register?role=teacher">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 border border-white/10 bg-white/[0.04] backdrop-blur-sm text-slate-200 px-8 py-4 rounded-2xl font-semibold text-[0.95rem] hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
                >
                  <Play className="h-4 w-4" />
                  Teach on Brainwave
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div {...fadeUp(0.6)} className="flex items-center gap-5">
              <div className="flex -space-x-2.5">
                {[
                  { bg: "from-blue-500 to-blue-600", label: "A" },
                  { bg: "from-violet-500 to-violet-600", label: "R" },
                  { bg: "from-cyan-500 to-cyan-600", label: "S" },
                  { bg: "from-emerald-500 to-emerald-600", label: "P" },
                  { bg: "from-amber-500 to-amber-600", label: "M" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full border-2 border-[#060B18] bg-gradient-to-br ${a.bg} flex items-center justify-center text-xs font-bold text-white select-none`}
                  >
                    {a.label}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-500 text-xs">
                  Trusted by{" "}
                  <span className="text-slate-200 font-semibold">50,000+</span> students
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Product Mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Glow behind */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]" />
            </div>

            {/* Main course card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-[340px] rounded-2xl border border-white/[0.08] bg-[#0C1526]/90 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">Machine Learning Fundamentals</p>
                  <p className="text-slate-500 text-xs">42 lessons • AI-generated</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">Course progress</span>
                  <span className="text-blue-400 font-semibold">68%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.6, delay: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Lessons */}
              {[
                { title: "Intro to Neural Networks", done: true },
                { title: "Backpropagation Explained", done: true },
                { title: "Building Your First Model", done: false },
              ].map((lesson, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-t border-white/[0.05]">
                  <div
                    className={`h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                      lesson.done ? "bg-blue-500" : "bg-white/[0.07] border border-white/10"
                    }`}
                  >
                    {lesson.done ? (
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    ) : (
                      <Play className="h-2.5 w-2.5 text-slate-500" />
                    )}
                  </div>
                  <span className={`text-xs ${lesson.done ? "text-slate-300" : "text-slate-500"}`}>
                    {lesson.title}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Floating AI Chat card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-4 top-4 w-56 rounded-2xl border border-white/[0.08] bg-[#0A1020]/95 backdrop-blur-xl p-4 shadow-xl z-20"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-white text-xs font-semibold">AI Tutor</span>
                <span className="ml-auto h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3 mb-3">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  "Backpropagation uses the chain rule to compute gradients layer by layer..."
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-600">
                  Ask anything...
                </div>
                <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Floating Certificate badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -left-6 bottom-8 rounded-2xl border border-yellow-500/20 bg-[#120E04]/90 backdrop-blur-xl p-4 shadow-xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Certificate Earned!</p>
                  <p className="text-yellow-400/60 text-[11px]">Blockchain verified ✓</p>
                </div>
              </div>
            </motion.div>

            {/* Live indicator */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -left-2 top-10 rounded-xl border border-red-500/20 bg-[#120008]/90 backdrop-blur-xl px-4 py-2.5 shadow-xl z-20"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-white text-xs font-medium">Live Session</span>
                <span className="text-slate-500 text-[11px]">• 23 students</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#060B18] to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600"
      >
        <span className="text-[11px] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-4 w-px bg-gradient-to-b from-slate-600 to-transparent"
        />
      </motion.div>
    </section>
  );
}
