"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 50000, suffix: "+", label: "Active Students", sub: "Learning every day" },
  { value: 500, suffix: "+", label: "Courses Available", sub: "Across all categories" },
  { value: 200, suffix: "+", label: "Expert Teachers", sub: "Verified instructors" },
  { value: 98, suffix: "%", label: "Satisfaction Rate", sub: "From student reviews" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count >= 1000 ? (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k" : count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-12 bg-[#060B18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{
            background: "linear-gradient(135deg, rgba(15,26,50,0.9) 0%, rgba(10,18,38,0.9) 100%)",
          }}
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-violet-500/[0.04]" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative px-8 py-10 text-center ${
                  i < stats.length - 1
                    ? "border-r border-white/[0.05]"
                    : ""
                } ${i < 2 ? "border-b lg:border-b-0 border-white/[0.05]" : ""}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2 leading-none tracking-tight">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white font-semibold text-sm mb-1">{stat.label}</p>
                <p className="text-slate-600 text-xs">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
