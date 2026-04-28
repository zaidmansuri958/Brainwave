"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, Star } from "lucide-react";
import { AIBadge } from "@/components/ui/ai-badge";

export function HeroSection() {
  return (
    <section className="bw-shell relative py-10 sm:py-14 lg:min-h-[calc(100vh-120px)]">
      <div className="absolute inset-0 opacity-70">
        <div className="h-full w-full bg-dot-grid" />
      </div>
      <span className="bw-doodle left-[2%] top-[8%] text-4xl">+</span>
      <span className="bw-doodle right-[8%] top-[10%] text-5xl">*</span>
      <span className="bw-doodle bottom-[16%] left-[46%] text-3xl">~</span>

      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pt-4">
          <span className="eyebrow mb-5">AI LEARNING, REBUILT</span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-display text-[clamp(2.9rem,6vw,5rem)] uppercase leading-[0.92] text-slate-950"
          >
            Learn Smarter.
            <br />
            <span className="inline-block bg-[#ffe500] px-3 py-1">Grow Louder.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-5 max-w-[520px] text-lg leading-[1.6] text-slate-600"
          >
            A bold education platform for students and teachers with faster discovery, clearer progress, and AI support that feels part of the product instead of pasted on top.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/register" className="bw-action-primary">
              Start Learning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register?role=teacher" className="bw-action-secondary">
              <GraduationCap className="h-4 w-4" />
              Teach on Brainwave
            </Link>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="bw-sticker bg-[#8ed8ff]">COURSES</span>
            <span className="bw-sticker bg-[#7dde92]">AI TUTOR</span>
            <span className="bw-sticker bg-[#f7a8d8]">COMMUNITY</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <div className="bw-hero-panel p-5">
            <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[26px] border-2 border-black bg-[#ffe500] p-5 shadow-[4px_4px_0_#111111]">
                <div className="mb-4 flex items-center justify-between">
                  <AIBadge label="AI Tutor On" />
                  <span className="bw-chip bg-white">LIVE</span>
                </div>
                <div className="relative mx-auto flex aspect-square max-w-[260px] items-end justify-center overflow-hidden rounded-[24px] border-2 border-black bg-[#fffdf7]">
                  <div className="absolute left-3 top-3 h-10 w-10 rounded-full border-2 border-black bg-[#f7a8d8]" />
                  <div className="absolute right-4 top-6 h-6 w-6 rotate-12 border-2 border-black bg-[#8ed8ff]" />
                  <div className="absolute bottom-0 h-28 w-40 rounded-t-[999px] border-2 border-black border-b-0 bg-[#111111]" />
                  <div className="absolute bottom-16 h-24 w-24 rounded-full border-2 border-black bg-[#fffdf7]" />
                  <div className="absolute bottom-10 h-28 w-36 rounded-t-[26px] border-2 border-black bg-[#ff6b00]" />
                  <div className="absolute bottom-4 left-8 right-8 h-10 rounded-[12px] border-2 border-black bg-white" />
                  <div className="absolute bottom-6 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-black bg-[#111111]" />
                </div>
                <p className="mt-5 font-display text-2xl font-extrabold uppercase text-slate-950">Your next lesson starts here.</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  Playful, high-contrast, and direct. The new UI turns the whole platform into a stronger learning workspace.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="bw-card bg-[#8ed8ff] p-4">
                  <p className="bw-kicker text-black">Course Preview</p>
                  <p className="mt-2 font-display text-2xl font-extrabold uppercase text-slate-950">React Masterclass</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">by Priya Sharma</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-800">
                    <Star className="h-4 w-4 fill-[#111111] text-[#111111]" />
                    <span className="font-extrabold">4.9</span>
                    <span className="text-slate-700">(1,204 ratings)</span>
                  </div>
                </div>
                <div className="bw-card bg-white p-4">
                  <p className="bw-kicker">Social Proof</p>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border-2 border-black bg-[#fff4d6] p-3">
                    <p className="text-sm font-bold text-slate-700">Sarah just enrolled</p>
                    <span className="bw-chip bg-[#7dde92]">NEW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
