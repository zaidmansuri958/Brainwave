"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

export function CTASection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#FAFAF9] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Full-width card — deep indigo, CRED-style */}
        <div className="relative bg-gray-950 rounded-3xl overflow-hidden px-8 py-16 lg:px-16 lg:py-20 text-center">

          {/* Subtle accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-600/[0.12] rounded-full blur-[100px]" />
          </div>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}
              className="text-[11px] font-bold tracking-[0.18em] uppercase text-indigo-400 mb-5"
            >
              Start today — it&apos;s free
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.08 }}
              className="font-display font-extrabold text-white tracking-[-0.025em] leading-[1.04] mb-5"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
            >
              Ready to teach more<br />and learn deeper?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.14 }}
              className="text-base text-gray-400 leading-relaxed mb-10"
            >
              Join 50,000+ students and 1,200+ teachers already on Brainwave. No credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            >
              <Link href="/register">
                <button className="group inline-flex items-center gap-2 bg-white text-gray-950 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg shadow-black/20">
                  Start learning free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/register?role=teacher">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-gray-300 border border-white/20 hover:border-white/40 hover:text-white active:scale-[0.98] transition-all">
                  <Upload className="w-4 h-4" />
                  Teach on Brainwave
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-6 flex-wrap"
            >
              {["No credit card", "Free forever tier", "Cancel anytime"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
