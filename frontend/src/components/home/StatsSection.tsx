"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Star, GraduationCap, Sparkles } from "lucide-react";

const stats = [
  { label: "Students", value: "12,000+", icon: Users },
  { label: "Courses", value: "800+", icon: BookOpen },
  { label: "Rating", value: "4.9★", icon: Star },
  { label: "Teachers", value: "200+", icon: GraduationCap },
  { label: "AI-Powered", value: "Yes", icon: Sparkles },
];

export function StatsSection() {
  return (
    <section className="border-y-4 border-black bg-[#fff4d6] py-5">
      <div className="bw-shell grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
              <div className="flex items-center gap-3 rounded-[20px] border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0_#111111]">
                <div className="rounded-[12px] border-2 border-black bg-[#ffe500] p-2 text-[#111111]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-sm font-extrabold uppercase text-ink-heading">{stat.value}</p>
                  <p className="text-xs font-bold uppercase text-ink-muted">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
