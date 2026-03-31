"use client";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, Zap, Users, BookOpen, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const studentPlans = [
  {
    name:        "Free",
    price:       "₹0",
    period:      "forever",
    description: "Start learning at no cost, no card needed.",
    cta:         "Get started free",
    href:        "/register",
    highlight:   false,
    features: [
      { text: "50+ free courses",             included: true  },
      { text: "AI Tutor (10 queries/day)",     included: true  },
      { text: "Community forums",              included: true  },
      { text: "Basic progress tracking",       included: true  },
      { text: "Paid course access",            included: false },
      { text: "Live sessions",                 included: false },
      { text: "Blockchain certificates",       included: false },
      { text: "Unlimited AI Tutor",            included: false },
    ],
  },
  {
    name:        "Pro Student",
    price:       "₹799",
    period:      "per month",
    description: "The complete learning experience, unlocked.",
    cta:         "Start 7-day free trial",
    href:        "/register?plan=pro",
    highlight:   true,
    badge:       "Most Popular",
    features: [
      { text: "All 500+ courses",              included: true },
      { text: "Unlimited AI Tutor",            included: true },
      { text: "Live session attendance",       included: true },
      { text: "Advanced progress analytics",   included: true },
      { text: "Blockchain certificates",       included: true },
      { text: "Doubt session booking",         included: true },
      { text: "Offline video downloads",       included: true },
      { text: "Priority support",              included: true },
    ],
  },
];

const commissionTiers = [
  {
    label:      "Starter",
    students:   "Up to 500 students",
    rate:       "10%",
    rateLabel:  "platform commission",
    color:      "border-gray-200",
    iconColor:  "bg-gray-100 text-gray-600",
    textColor:  "text-gray-900",
    note:       "Default rate. No upfront cost.",
    features: [
      "AI course builder (unlimited)",
      "Live session hosting",
      "Student analytics dashboard",
      "Blockchain-verified certificates",
      "Instant payouts every 2 weeks",
      "1-on-1 doubt session tools",
    ],
  },
  {
    label:      "Growth",
    students:   "500 – 5,000 students",
    rate:       "9%",
    rateLabel:  "platform commission",
    color:      "border-indigo-500 ring-2 ring-indigo-500",
    iconColor:  "bg-indigo-100 text-indigo-600",
    textColor:  "text-gray-900",
    badge:      "Recommended",
    note:       "Negotiate directly with the platform team.",
    features: [
      "Everything in Starter",
      "Priority course review",
      "Custom certificate branding",
      "Advanced student segmentation",
      "Dedicated account manager",
      "Early access to new AI features",
    ],
  },
  {
    label:      "Scale",
    students:   "5,000+ students",
    rate:       "8%",
    rateLabel:  "platform commission",
    color:      "border-violet-500 ring-2 ring-violet-500",
    iconColor:  "bg-violet-100 text-violet-600",
    textColor:  "text-gray-900",
    badge:      "Best for large educators",
    note:       "Custom terms available for high-volume teachers.",
    features: [
      "Everything in Growth",
      "Lowest commission rate",
      "White-label certificates",
      "Custom course subdomain",
      "SLA support guarantee",
      "Revenue share analytics",
    ],
  },
];

const faqs = [
  {
    q: "How does teacher commission work?",
    a: "You keep the rest after Brainwave's platform fee. Default rate is 10% of each course sale. High-volume teachers (500+ students) can negotiate lower rates down to 8%. There are no upfront fees — you only pay when you earn.",
  },
  {
    q: "How do I get a lower commission rate?",
    a: "Contact our teacher partnerships team once you cross 500 enrolled students. We review your growth trajectory and audience size, then offer a custom rate. It's a simple conversation — no lock-in contracts.",
  },
  {
    q: "Is the student Free plan really free forever?",
    a: "Yes. Free never expires. You get 50+ courses and 10 AI tutor queries daily with no credit card required.",
  },
  {
    q: "When do teachers get paid?",
    a: "Payouts process every 2 weeks directly to your bank account via NEFT/IMPS. You can see a full earnings breakdown in your dashboard at any time.",
  },
  {
    q: "Can I set my own course price?",
    a: "Absolutely. You control pricing. Set a one-time price, a subscription, or offer your course free to select students. Brainwave only takes its commission on paid transactions.",
  },
  {
    q: "What happens if a student gets a refund?",
    a: "Refunds within 7 days of purchase are fully refunded. The commission on that transaction is also reversed — you only pay commission on completed, retained sales.",
  },
];

const teacherStats = [
  { icon: Users,     value: "1,200+", label: "Active teachers" },
  { icon: TrendingUp,value: "₹2.4Cr", label: "Paid out last month" },
  { icon: BookOpen,  value: "8%",     label: "Lowest commission" },
  { icon: Shield,    value: "2 weeks", label: "Payout cycle" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="eyebrow mb-4">Pricing</p>
        <h1 className="font-display font-extrabold text-gray-900 tracking-tight leading-[1.06] mb-5"
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}>
          You earn. We earn<br />
          <span className="text-gradient-indigo">only when you do.</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
          No monthly fee for teachers. No hidden charges. Just a transparent commission model — starting at 10%, negotiable as you grow.
        </p>
      </section>

      {/* Audience Toggle Labels */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-8">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> For Teachers
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-semibold">
            <Users className="w-3.5 h-3.5" /> For Students
          </div>
        </div>
      </div>

      {/* ── TEACHER SECTION ── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-6">
        <div className="mb-8">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-1">Teacher Commission Tiers</h2>
          <p className="text-gray-500 text-sm">No upfront cost. Commission only applies to paid course transactions.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {commissionTiers.map((tier) => (
            <div
              key={tier.label}
              className={`bg-white rounded-2xl border ${tier.color} p-7 flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300`}
            >
              {tier.badge && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{tier.badge}</span>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl ${tier.iconColor} flex items-center justify-center mb-4`}>
                <TrendingUp className="w-5 h-5" />
              </div>

              <h3 className={`font-display font-bold text-xl mb-1 ${tier.textColor}`}>{tier.label}</h3>
              <p className="text-sm text-gray-500 mb-4">{tier.students}</p>

              <div className="mb-5">
                <span className="font-display font-extrabold text-4xl text-gray-900">{tier.rate}</span>
                <span className="text-sm text-gray-400 ml-1.5">{tier.rateLabel}</span>
              </div>

              <p className="text-xs text-gray-500 italic mb-5">{tier.note}</p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register?role=teacher"
                className="block text-center px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-button-indigo transition-colors"
              >
                Start teaching free
              </Link>
            </div>
          ))}
        </div>

        {/* Teacher Stats Strip */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-8 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {teacherStats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-col items-center text-center px-4">
                <Icon className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="font-display font-extrabold text-2xl text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STUDENT SECTION ── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-1">Student Plans</h2>
          <p className="text-gray-500 text-sm">Start free. Upgrade when you want the full experience.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          {studentPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ${
                plan.highlight
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-600"
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{plan.badge}</span>
                </div>
              )}

              <h2 className={`font-display font-bold text-xl mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h2>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-indigo-200" : "text-gray-500"}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className={`font-display font-extrabold text-4xl ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>
                  /{plan.period}
                </span>
              </div>

              <Link
                href={plan.href}
                className={`block text-center px-6 py-3 rounded-xl font-semibold text-sm mb-7 transition-colors ${
                  plan.highlight
                    ? "bg-white text-indigo-700 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-button-indigo"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-indigo-200" : "text-indigo-600"}`} strokeWidth={2.5} />
                    ) : (
                      <X className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-white/30" : "text-gray-300"}`} />
                    )}
                    <span className={`text-sm ${
                      f.included
                        ? plan.highlight ? "text-white" : "text-gray-700"
                        : plan.highlight ? "text-white/40" : "text-gray-400"
                    }`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Are you a teacher CTA */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-16">
        <div className="bg-gray-950 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-indigo-600/10 rounded-full blur-[80px]" />
          </div>
          <p className="eyebrow text-indigo-400 mb-3 relative z-10">For educators</p>
          <h2 className="font-display font-extrabold text-white text-3xl lg:text-4xl mb-4 relative z-10">
            Bring your lectures online.<br />Keep 90% of what you earn.
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto relative z-10">
            No setup fee. No monthly subscription. You pay Brainwave only when your students pay you.
          </p>
          <Link
            href="/register?role=teacher"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors shadow-button-indigo relative z-10"
          >
            Start teaching free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
