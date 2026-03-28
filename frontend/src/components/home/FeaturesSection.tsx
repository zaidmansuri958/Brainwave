"use client";
import { motion } from "framer-motion";
import { Brain, MessageSquare, Award, Shield, Users, Video, Cpu, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI Course Builder",
    description:
      "Upload any recording. Our AI transcribes, structures chapters, writes summaries, and generates quizzes — automatically.",
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20",
    border: "hover:border-blue-500/20",
    glow: "from-blue-500/[0.06] to-transparent",
    size: "lg", // span 2 cols
  },
  {
    icon: MessageSquare,
    title: "Per-Course AI Tutor",
    description:
      "Every course ships with an AI chatbot trained on the course material. Students get instant, accurate answers 24/7.",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
    border: "hover:border-violet-500/20",
    glow: "from-violet-500/[0.06] to-transparent",
    size: "sm",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description:
      "Blockchain-anchored certificates on course completion. Anyone can verify authenticity with a single link.",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    border: "hover:border-amber-500/20",
    glow: "from-amber-500/[0.06] to-transparent",
    size: "sm",
  },
  {
    icon: Shield,
    title: "Dropout Prediction",
    description:
      "ML model scores every student's risk of dropping out based on watch rate, quiz scores, and activity. Teachers get alerts before it's too late.",
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
    border: "hover:border-emerald-500/20",
    glow: "from-emerald-500/[0.06] to-transparent",
    size: "sm",
  },
  {
    icon: Users,
    title: "Course Community",
    description:
      "Built-in discussion boards per course. Post doubts, get answers from teachers, peers, and AI — all in one place.",
    gradient: "from-cyan-500 to-sky-600",
    shadow: "shadow-cyan-500/20",
    border: "hover:border-cyan-500/20",
    glow: "from-cyan-500/[0.06] to-transparent",
    size: "sm",
  },
  {
    icon: Video,
    title: "Live Doubt Sessions",
    description:
      "Book 1-on-1 or group video calls with teachers. Integrated HD video — no Zoom, no third-party tools required.",
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20",
    border: "hover:border-rose-500/20",
    glow: "from-rose-500/[0.06] to-transparent",
    size: "lg",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export function FeaturesSection() {
  return (
    <section className="py-28 bg-[#080E1D] relative overflow-hidden">
      {/* Section accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-blue-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            What We Do
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Everything educators &amp; learners
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              have always needed
            </span>
          </h2>
          <p className="text-slate-400 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
            One platform. AI-powered from upload to certificate. Built for real teachers and ambitious students.
          </p>
        </motion.div>

        {/* Cards grid — bento-ish layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group relative rounded-2xl border border-white/[0.06] ${feature.border} bg-[#0C1526] overflow-hidden transition-all duration-300 hover:shadow-xl ${feature.shadow} p-7 cursor-default`}
              >
                {/* Gradient bg on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-400`}
                />

                {/* Icon */}
                <div
                  className={`relative z-10 h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadow}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-white font-bold text-lg mb-3 leading-snug">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="relative z-10 mt-5 flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                  <span
                    className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                  >
                    Learn more
                  </span>
                  <span className="text-slate-500">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
