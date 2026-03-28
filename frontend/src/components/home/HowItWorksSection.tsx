"use client";
import { motion, useInView } from "framer-motion";
import { Upload, Cpu, BookOpen, GraduationCap } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Content",
    description:
      "Record yourself teaching and upload video, PDF, or slides. No editing experience required — raw recordings work perfectly.",
    gradient: "from-blue-500 to-indigo-600",
    glowColor: "rgba(99,102,241,0.35)",
    accentColor: "#6366f1",
    borderGlow: "group-hover:border-blue-500/50",
    tag: "For Teachers",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Builds the Course",
    description:
      "Our AI pipeline transcribes content, organizes chapters, writes lesson summaries, generates quizzes, and creates thumbnails.",
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139,92,246,0.35)",
    accentColor: "#8b5cf6",
    borderGlow: "group-hover:border-violet-500/50",
    tag: "Automated",
    tagColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Students Learn",
    description:
      "Students enroll and get full access to video lessons, AI tutor chatbot, live doubt sessions, and the course community.",
    gradient: "from-cyan-500 to-teal-600",
    glowColor: "rgba(6,182,212,0.35)",
    accentColor: "#06b6d4",
    borderGlow: "group-hover:border-cyan-500/50",
    tag: "For Students",
    tagColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  },
  {
    number: "04",
    icon: GraduationCap,
    title: "Earn Certificates",
    description:
      "Complete lessons and pass assessments. A blockchain-verifiable certificate is issued instantly — shareable with a single link.",
    gradient: "from-emerald-500 to-green-600",
    glowColor: "rgba(16,185,129,0.35)",
    accentColor: "#10b981",
    borderGlow: "group-hover:border-emerald-500/50",
    tag: "Verified",
    tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative z-10"
    >
      {/* Card */}
      <div
        className={`relative rounded-2xl border border-white/[0.06] bg-[#080F20] p-6 h-full transition-all duration-500 ${step.borderGlow} hover:bg-[#0A1228]`}
        style={{
          boxShadow: "0 0 0 0 transparent",
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${step.accentColor}, transparent)` }}
        />

        {/* Number watermark */}
        <div
          className="absolute top-4 right-5 text-6xl font-black opacity-[0.04] select-none pointer-events-none leading-none"
          style={{ color: step.accentColor }}
        >
          {step.number}
        </div>

        {/* Tag */}
        <span className={`inline-flex items-center text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full border mb-5 ${step.tagColor}`}>
          {step.tag}
        </span>

        {/* Icon */}
        <div className="mb-5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center`}
            style={{ boxShadow: `0 8px 32px ${step.glowColor}` }}
          >
            <Icon className="h-7 w-7 text-white" strokeWidth={1.75} />
            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          </motion.div>
        </div>

        {/* Content */}
        <h3 className="text-white font-bold text-base mb-2.5 leading-snug">{step.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${step.accentColor}40, transparent)` }}
        />
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <section className="py-32 bg-[#060B18] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.07] mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-400 text-xs font-semibold tracking-[0.18em] uppercase">
              How It Works
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            From raw recording to{" "}
            <br className="hidden sm:block" />
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                students learning
              </span>
            </span>
          </h2>
          <p className="text-slate-400 text-lg mt-5 max-w-lg mx-auto leading-relaxed">
            We handle the complex parts. You just teach.
          </p>
        </motion.div>

        {/* Steps grid + connector line wrapper */}
        <div className="relative isolate">
          {/* Connector line (desktop) — z-0 so cards (z-10) sit on top */}
          <div className="hidden lg:block absolute inset-x-0 pointer-events-none" style={{ top: "96px", zIndex: 0 }}>
            {/* Stretch line from center of col-1 icon to center of col-4 icon */}
            <div className="mx-auto" style={{ paddingLeft: "calc(12.5% + 28px)", paddingRight: "calc(12.5% + 28px)" }}>
              <div className="relative h-[2px] w-full rounded-full bg-gradient-to-r from-blue-500/40 via-violet-500/40 via-cyan-500/40 to-emerald-500/40">
                {/* Animated light sweep */}
                <motion.div
                  className="absolute inset-y-0 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ left: ["-10%", "110%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />
                {/* Glowing dots at each step center */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 h-3 w-3 rounded-full border-2 border-[#080F20] -translate-y-1/2"
                    style={{
                      left: `${[0, 33.33, 66.66, 100][i]}%`,
                      transform: "translateX(-50%) translateY(-50%)",
                      backgroundColor: ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"][i],
                      boxShadow: `0 0 12px 3px ${["rgba(99,102,241,0.8)", "rgba(139,92,246,0.8)", "rgba(6,182,212,0.8)", "rgba(16,185,129,0.8)"][i]}`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cards — each is z-10 via StepCard's motion.div */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/[0.07] bg-white/[0.02]">
            <span className="text-slate-400 text-sm">Ready to start?</span>
            <a
              href="/register?role=teacher"
              className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-violet-300 transition-all flex items-center gap-1.5"
            >
              Create your first course free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
