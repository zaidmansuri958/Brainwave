"use client";

import { motion } from "framer-motion";
import { BarChart3, Brain, GraduationCap, Shield, Sparkles, Video } from "lucide-react";

const coreModules = [
  {
    title: "Create",
    description: "Teacher uploads become polished learning products with AI-generated structure, summaries, quizzes, and thumbnails.",
    icon: Sparkles,
    accentClass: "bg-[#ebebff] text-[#1a1aff]",
  },
  {
    title: "Teach",
    description: "Live sessions, doubt workflows, curriculum tools, and command-center dashboards bring stronger creator control.",
    icon: GraduationCap,
    accentClass: "bg-[#ebebff] text-[#1a1aff]",
  },
  {
    title: "Learn",
    description: "Students get less clutter and more guidance: resume points, practice shortcuts, AI support, and clear progress.",
    icon: Brain,
    accentClass: "bg-[#ebebff] text-[#1a1aff]",
  },
  {
    title: "Track",
    description: "Analytics, risk signals, payouts, and completion visibility now sit inside denser, more legible panels.",
    icon: BarChart3,
    accentClass: "bg-[#ebebff] text-[#1a1aff]",
  },
  {
    title: "Earn",
    description: "Pricing, payouts, promotions, and trust mechanics feel more premium and transparent for both teachers and students.",
    icon: Shield,
    accentClass: "bg-[#ebebff] text-[#1a1aff]",
  },
  {
    title: "Connect",
    description: "Community, live classes, AI tutor entry points, and notifications become first-class, clearly surfaced experiences.",
    icon: Video,
    accentClass: "bg-[#ebebff] text-[#1a1aff]",
  },
];

export function FeaturesSection() {
  return (
    <section className="bw-shell py-10">
      <div className="mb-6 text-center">
        <p className="bw-kicker">Feature Stack</p>
        <h2 className="mt-2 font-display text-4xl uppercase text-ink-heading">Built for standout learning outcomes</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {coreModules.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.div key={module.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.05 }} className={index === 2 ? "rounded-[24px] border-2 border-black bg-[#111111] p-6 text-white shadow-[5px_5px_0_#111111]" : "bw-card p-6"}>
              <div className={`inline-flex rounded-[14px] border-2 border-black p-3 ${index === 2 ? "bg-[#ffe500] text-black" : module.accentClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className={`mt-4 font-display text-xl font-semibold uppercase ${index === 2 ? "text-white" : "text-ink-heading"}`}>{module.title}</h3>
              <p className={`mt-2 text-sm leading-7 ${index === 2 ? "text-white/80" : "text-ink-body"}`}>{module.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
