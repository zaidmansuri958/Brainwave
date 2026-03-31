"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Search, GraduationCap } from "lucide-react";

const steps = [
  {
    n:    "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in 30 seconds. No credit card required. Get instant access to free courses and your AI tutor.",
  },
  {
    n:    "02",
    icon: Search,
    title: "Pick your subject",
    description:
      "Browse 500+ expert-led courses. Use AI-powered recommendations to find exactly what matches your goal.",
  },
  {
    n:    "03",
    icon: GraduationCap,
    title: "Learn and earn",
    description:
      "Study at your own pace with live sessions, an AI tutor, and smart quizzes. Earn a verified certificate on completion.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#FAFAF9] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="eyebrow mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="font-display font-extrabold text-gray-900 tracking-tight leading-[1.08]"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Up and running in
            <br />
            <span className="text-gradient-indigo">three steps.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Connector line — only between cards, not after the last */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-px -translate-y-1/2 bg-gradient-to-r from-indigo-200 to-transparent pointer-events-none" />
                )}

                {/* Step icon circle */}
                <div className="relative w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-button-indigo group-hover:shadow-button-hover group-hover:-translate-y-1 transition-all duration-300">
                  <Icon className="w-7 h-7 text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm">
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
