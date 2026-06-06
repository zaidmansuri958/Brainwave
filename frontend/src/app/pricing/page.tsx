"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Wallet, ShieldCheck, BadgeIndianRupee, Calculator } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const tiers = [
  { name: "Starter", rate: "10%", keep: "90%", desc: "For educators launching their first course.", highlight: false },
  { name: "Growth", rate: "9%", keep: "91%", desc: "For teachers with growing momentum.", highlight: true },
  { name: "Scale", rate: "8%", keep: "92%", desc: "For high-volume educators.", highlight: false },
];

const faqs = [
  { q: "How does teacher commission work?", a: "Brainwave only earns when a teacher earns. Commission is applied to completed transactions and decreases as the teacher scales." },
  { q: "When do payouts happen?", a: "Payouts are processed on a two-week cycle with clear pending/earned breakdowns inside your teacher dashboard." },
  { q: "What happens with refunds?", a: "Refunded purchases reverse the corresponding platform cut. Admin view surfaces this clearly with watch percentage and reason." },
];

export default function PricingPage() {
  const [sales, setSales] = useState(100000);
  const cut = Math.round(sales * 0.1);
  const keep = sales - cut;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-100 section-padding">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="section-eyebrow">Teacher Pricing</span>
          <h1 className="section-title">Simple, transparent commissions</h1>
          <p className="section-subtitle mx-auto mt-4">
            We only earn when you earn. No subscription fees, no setup costs.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            {tiers.map((t) => (
              <div key={t.name} className={`card p-6 text-center ${t.highlight ? "border-blue-500 border-2 ring-2 ring-blue-100" : ""}`}>
                {t.highlight && <span className="inline-block text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full mb-3">Most Popular</span>}
                <p className="text-sm font-semibold text-gray-500">{t.name}</p>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">{t.keep}</p>
                <p className="text-sm text-gray-400 mb-1">you keep</p>
                <p className="text-xs text-gray-500 mt-3">{t.desc}</p>
                <p className="text-xs text-gray-400 mt-3">Platform fee: {t.rate}</p>
              </div>
            ))}
          </div>

          {/* Payout Calculator */}
          <div className="card p-8 max-w-2xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Payout Calculator</h3>
                <p className="text-sm text-gray-400">Adjust to see what you keep</p>
              </div>
            </div>
            <input type="range" min={25000} max={500000} step={25000} value={sales}
              onChange={(e) => setSales(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 mb-6" />
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Gross Sales</p>
                <p className="text-lg font-bold text-gray-900">₹{sales.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-xs text-red-400 mb-1">Platform Fee</p>
                <p className="text-lg font-bold text-red-600">₹{cut.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4 text-center">
                <p className="text-xs text-green-600 mb-1">You Keep</p>
                <p className="text-lg font-bold text-green-700">₹{keep.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/register?role=teacher" className="btn btn-lg btn-primary w-full justify-center">
                Start teaching free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-16">
            {[
              { icon: Wallet, title: "Two-week payouts", desc: "Pending and earned clearly visible in your dashboard." },
              { icon: ShieldCheck, title: "Transparent refunds", desc: "Refund state, watch %, and admin actions all visible." },
              { icon: BadgeIndianRupee, title: "No hidden fees", desc: "You see exactly what you keep — always." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 flex gap-4 items-start">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Frequently asked</h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="card p-5">
                  <p className="text-sm font-semibold text-gray-900">{f.q}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
