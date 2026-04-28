"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-transparent py-24 lg:py-32">
      <div className="bw-shell">
        <div className="relative overflow-hidden rounded-[34px] border-2 border-black bg-[#111111] px-8 py-16 text-center shadow-[8px_8px_0_#111111] lg:px-16 lg:py-20">
          <div className="absolute -left-4 top-6 h-12 w-12 rotate-12 border-2 border-black bg-[#f7a8d8]" />
          <div className="absolute -right-3 bottom-12 h-16 w-16 rounded-full border-2 border-black bg-[#8ed8ff]" />
          <div className="absolute left-[12%] top-[16%] text-4xl font-black text-[#ffe500]">*</div>

          <div className="relative z-10 mx-auto max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
              className="mb-5 inline-flex rounded-full border-2 border-black bg-[#ffe500] px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black"
            >
              Start today. It&apos;s free.
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mb-5 font-display text-white"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.04, textTransform: "uppercase" }}
            >
              Ready to learn bigger
              <br />
              and teach bolder?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="mb-10 text-base leading-relaxed text-[#f3ead6]"
            >
              Join 50,000+ students and 1,200+ teachers already on Brainwave. No credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link href="/register">
                <button className="group inline-flex items-center gap-2 rounded-[16px] border-2 border-black bg-[#ffe500] px-8 py-3.5 text-sm font-black uppercase text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-[#ff6b00] hover:text-white">
                  Start learning free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/register?role=teacher">
                <button className="inline-flex items-center gap-2 rounded-[16px] border-2 border-white bg-white px-8 py-3.5 text-sm font-black uppercase text-black shadow-[4px_4px_0_#ffe500] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px]">
                  <Upload className="h-4 w-4" />
                  Teach on Brainwave
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              {["No credit card", "Free forever tier", "Cancel anytime"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#fff4d6]">
                  <span className="h-2 w-2 rounded-full border border-white bg-[#ffe500]" />
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
