"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-28 bg-[#060B18] relative overflow-hidden">
      {/* Radial background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(79, 142, 247, 0.07), transparent)",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-violet-600/[0.07] blur-[100px]"
          style={{ top: "30%", left: "10%" }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-600/[0.07] blur-[100px]"
          style={{ top: "20%", right: "10%" }}
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Join 50,000+ learners today
          </div>

          {/* Headline */}
          <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-7">
            Your next
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              breakthrough
            </span>
            <br />
            starts here.
          </h2>

          <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-lg mx-auto">
            Whether you&apos;re learning something new or sharing your expertise — Brainwave
            gives you AI superpowers to go further, faster.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register">
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 0 50px rgba(79, 142, 247, 0.45)",
                }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </Link>
            <Link href="/courses">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white/[0.07] hover:border-white/15 transition-all duration-200"
              >
                <GraduationCap className="h-5 w-5" />
                Browse Courses
              </motion.button>
            </Link>
          </div>

          <p className="text-slate-600 text-sm">
            Free to start · No credit card required · Cancel anytime
          </p>
        </motion.div>

        {/* Decorative bottom glow line */}
        <div className="mt-20 flex items-center justify-center gap-4 opacity-20">
          <div className="flex-1 max-w-32 h-px bg-gradient-to-r from-transparent to-blue-500" />
          <GraduationCap className="h-5 w-5 text-blue-400" />
          <div className="flex-1 max-w-32 h-px bg-gradient-to-l from-transparent to-violet-500" />
        </div>
      </div>
    </section>
  );
}
