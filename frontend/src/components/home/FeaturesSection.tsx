"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Video, Award, BarChart2, BookOpen, Zap, Upload, Users } from "lucide-react";

/* Large hero features — shown in a 2-col row with more breathing room */
const heroFeatures = [
  {
    icon:        Upload,
    color:       "bg-indigo-600",
    iconColor:   "text-white",
    label:       "For Teachers",
    title:       "Turn any lecture into a full course — in minutes",
    description: "Upload a video recording. Our AI auto-generates structured chapters, timestamped summaries, practice quizzes, and a personal AI tutor for every student. No manual work.",
    pill:        "AI Course Builder",
    pillColor:   "bg-indigo-50 text-indigo-700 border-indigo-100",
    items:       ["Auto-generated chapters & summaries", "AI-created quizzes per lesson", "Student-facing AI tutor included"],
  },
  {
    icon:        Users,
    color:       "bg-violet-600",
    iconColor:   "text-white",
    label:       "For Students",
    title:       "A learning experience built around you",
    description: "Join live classes, ask your AI tutor anything at 2 AM, track your weak areas with smart analytics, and earn blockchain-verified certificates recruiters trust.",
    pill:        "Student Experience",
    pillColor:   "bg-violet-50 text-violet-700 border-violet-100",
    items:       ["Live sessions with expert teachers", "AI tutor available 24/7", "Blockchain-verified certificates"],
  },
];

/* Smaller supporting features */
const miniFeatures = [
  { icon: Brain,    color: "bg-indigo-50 text-indigo-600",  title: "Adaptive AI Tutor",   desc: "Explains concepts in multiple ways until the student truly gets it." },
  { icon: Video,    color: "bg-rose-50 text-rose-600",      title: "Live Sessions",        desc: "Real-time interactive classes with India's top educators." },
  { icon: Award,    color: "bg-amber-50 text-amber-600",    title: "Verified Certificates",desc: "Industry-recognised, backed by blockchain. One-click LinkedIn sharing." },
  { icon: BarChart2,color: "bg-emerald-50 text-emerald-600",title: "Learning Analytics",   desc: "Identify weak areas. Get targeted practice exactly where it's needed." },
];

export function FeaturesSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#FAFAF9] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}
            className="eyebrow mb-3"
          >Why Brainwave</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.06 }}
            className="font-display font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            One platform for every<br />part of the learning journey.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.12 }}
            className="text-[1.05rem] text-gray-500 leading-relaxed"
          >
            Not a tool. Not a marketplace. A complete ecosystem — purpose-built for teachers and students.
          </motion.p>
        </div>

        {/* Hero features — 2 col */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {heroFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.1 + i * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 p-8 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border ${f.pillColor}`}>
                    {f.pill}
                  </span>
                </div>
                <p className="eyebrow mb-2">{f.label}</p>
                <h3 className="font-display font-bold text-gray-900 text-xl leading-snug mb-3">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{f.description}</p>
                <ul className="space-y-2.5">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-indigo-600" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Mini features — 4 col */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {miniFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.28 + i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-gray-900 mb-1.5">{f.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
