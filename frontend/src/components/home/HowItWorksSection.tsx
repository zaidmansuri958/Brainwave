"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/ui/app-shell";

const flows = [
  {
    step: "01",
    title: "Discover with more context",
    body: "Category shortcuts, richer filters, proof-forward cards, and denser hero sections reduce friction above the fold.",
    icon: BookOpen,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    step: "02",
    title: "Engage inside guided product spaces",
    body: "Dashboards, player shells, notifications, and community spaces surface the next best action without long blank gaps.",
    icon: Sparkles,
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    step: "03",
    title: "Grow with stronger operational clarity",
    body: "Teacher studio and admin areas gain tighter grids, better hierarchy, and clearer status, payout, and moderation workflows.",
    icon: TrendingUp,
    tone: "bg-amber-50 text-amber-600",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bw-shell py-4 sm:py-6">
      <div className="bw-band">
        <SectionHeader
          eyebrow="Interaction Flow"
          title="Designed to reduce whitespace, increase clarity, and keep momentum high."
          description="Instead of isolated blocks, the new experience uses stacked narrative panels, contextual action rails, and denser 2-column compositions across the platform."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {flows.map((flow, index) => {
            const Icon = flow.icon;
            return (
              <motion.div
                key={flow.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="bw-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${flow.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="bw-chip">{flow.step}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-slate-950">{flow.title}</h3>
                <p className="bw-muted mt-3 text-sm leading-7">{flow.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
