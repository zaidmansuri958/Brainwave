"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Calculator, Wallet, ShieldCheck, EyeOff,
  Rocket, TrendingUp, Crown, ChevronDown, Info,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const tiers = [
  {
    name: "Starter",
    icon: Rocket,
    keep: "90%",
    rate: 10,
    desc: "For educators just starting their first course.",
    highlight: false,
  },
  {
    name: "Growth",
    icon: TrendingUp,
    keep: "91%",
    rate: 9,
    desc: "For tutors with growing course sales.",
    highlight: true,
  },
  {
    name: "Scale",
    icon: Crown,
    keep: "92%",
    rate: 8,
    desc: "For high-volume educators and institutions.",
    highlight: false,
  },
];

const trustPoints = [
  {
    icon: Wallet,
    title: "Two-week payouts",
    desc: "Payouts processed every 14 days directly to your dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent refunds",
    desc: "Refunds (sales, watch time, etc.) are handled fairly and transparently.",
  },
  {
    icon: EyeOff,
    title: "No hidden fees",
    desc: "You see exactly what you keep — always.",
  },
];

const faqs = [
  {
    q: "How does teacher commission work?",
    a: "Brainwave only earns on the teacher's sales. Commission is applied to completed transactions and decreases as the teacher scales.",
  },
  {
    q: "When do payouts happen?",
    a: "Payouts are processed on a two-week cycle with clear pending/earned breakdowns inside your teacher dashboard.",
  },
  {
    q: "What happens with refunds?",
    a: "Refunded purchases reverse the corresponding platform cut. Admin view surfaces this clearly with totals, percentages and reason.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const [sales, setSales] = useState(100000);
  const platformRate = 0.10;
  const cut = Math.round(sales * platformRate);
  const keep = sales - cut;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/60 to-white pt-16 pb-12">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-[8%] text-6xl select-none opacity-60">🧮</div>
          <div className="absolute top-4 right-[8%] text-6xl select-none opacity-60">🪙</div>
          <div className="absolute top-16 left-[5%] text-2xl select-none opacity-40">✦</div>
          <div className="absolute top-6 right-[14%] text-2xl select-none opacity-40">✦</div>
          <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-violet-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-bold text-violet-600 tracking-widest uppercase mb-4">
            Teacher Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            Simple, transparent commissions
          </h1>
          <p className="text-base text-gray-500 max-w-md mx-auto">
            We only earn when you earn. No subscription fees, no setup costs.
          </p>
        </div>
      </section>

      {/* ── Pricing tiers ───────────────────────────────────────────────────── */}
      <section className="py-8 pb-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {tiers.map(({ name, icon: Icon, keep: keepPct, rate, desc, highlight }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-6 text-center transition-shadow ${
                  highlight
                    ? "border-2 border-violet-500 bg-white shadow-xl shadow-violet-100"
                    : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${highlight ? "bg-violet-100" : "bg-gray-100"}`}>
                  <Icon className={`h-5 w-5 ${highlight ? "text-violet-600" : "text-gray-500"}`} />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{name}</p>
                <p className={`text-5xl font-extrabold tracking-tight ${highlight ? "text-violet-600" : "text-gray-900"}`}>
                  {keepPct}
                </p>
                <p className="text-sm text-gray-400 mb-3">You keep</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{desc}</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className={`text-xs font-semibold ${highlight ? "text-violet-500" : "text-gray-400"}`}>
                    Platform fee: {rate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payout Calculator ───────────────────────────────────────────────── */}
      <section className="py-6 pb-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Calculator className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">Payout Calculator</p>
                  <p className="text-xs text-gray-400">Adjust to see what you will keep</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-gray-900">
                  ₹{sales.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-400">Course Sale</p>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min={10000}
                max={500000}
                step={10000}
                value={sales}
                onChange={(e) => setSales(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
                style={{
                  background: `linear-gradient(to right, #7c3aed ${(sales - 10000) / (500000 - 10000) * 100}%, #e5e7eb ${(sales - 10000) / (500000 - 10000) * 100}%)`,
                }}
              />
            </div>

            {/* Result boxes */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center">
                <p className="text-[11px] font-semibold text-red-500 mb-1">Platform Fee (10%)</p>
                <p className="text-xl font-extrabold text-red-600">
                  ₹{cut.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-center">
                <p className="text-[11px] font-semibold text-green-600 mb-1">You Keep (90%)</p>
                <p className="text-xl font-extrabold text-green-700">
                  ₹{keep.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-[11px] font-semibold text-gray-500">Your Payout</p>
                  <Info className="h-3 w-3 text-gray-400" />
                </div>
                <p className="text-xl font-extrabold text-gray-900">
                  ₹{keep.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/register?role=teacher"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm py-3.5 transition-colors shadow-md shadow-violet-200"
            >
              Start teaching free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust points ────────────────────────────────────────────────────── */}
      <section className="py-4 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {trustPoints.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 shrink-0">
                  <Icon className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-4 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
