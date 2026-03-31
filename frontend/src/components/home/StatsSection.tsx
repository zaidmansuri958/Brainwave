"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const stats = [
  { value: 50000,  suffix: "+", label: "Active students",      note: "Learning every day" },
  { value: 500,    suffix: "+", label: "Expert-led courses",   note: "Across all subjects" },
  { value: 98,     suffix: "%", label: "Completion rate",      note: "Industry-leading" },
  { value: 12000,  suffix: "+", label: "Certificates issued",  note: "Blockchain verified" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const step = Math.ceil(to / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= to) { setCount(to); clearInterval(timer); }
      else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  const display = count >= 1000 ? `${Math.round(count / 1000)}k` : count;
  return <span ref={ref}>{display}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="bg-[#FAFAF9]">
      {/* Top divider line */}
      <div className="section-line" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {stats.map((s, i) => (
            <div key={i} className="py-12 px-8 flex flex-col items-center text-center">
              <p className="font-display font-extrabold tracking-tight text-gray-900 mb-1.5 leading-none"
                 style={{ fontSize: "clamp(2.5rem, 4vw, 3.75rem)" }}>
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm font-semibold text-gray-700 mb-0.5">{s.label}</p>
              <p className="text-xs text-gray-400">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-line" />
    </section>
  );
}
