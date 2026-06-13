"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import {
  ArrowLeft, ArrowRight, Clock, Loader2, Play, ClipboardList,
  CheckCircle2, AlertCircle, Zap, Shield, BookOpen, Brain,
  BarChart3, Star, Home, ChevronRight, Target, Sparkles,
  Timer, Lock, TrendingUp, Award, Users, ThumbsUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, getRazorpayFailureMessage } from "@/lib/apiError";
import { Navbar } from "@/components/layout/Navbar";
import { MockReviewsSection } from "@/components/mock-tests/MockReviewsSection";

interface Paper {
  id: string;
  title: string;
  time_limit_minutes: number;
  total_marks: number | null;
  marks_per_question: number;
  negative_marks: number;
}

/* ── Helpers ── */
function fmtMins(m: number) {
  if (m < 60) return `${m} Min`;
  const h = Math.floor(m / 60), rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

const STAR = "★";

export default function MockPackagePublicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["mock-pkg", slug],
    queryFn: () => mockTestsApi.bySlug(slug).then((r) => r.data),
  });

  const { data: mine } = useQuery({
    queryKey: ["my-mock-packages"],
    queryFn: () => mockTestsApi.myPackages().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const { data: stats } = useQuery({
    queryKey: ["mock-stats", slug],
    queryFn: () => mockTestsApi.packageStats(slug).then((r) => r.data),
  });

  const owned = (mine?.packages || []).some(
    (x: { package_id: string }) => x.package_id === pkg?.id
  );

  const buy = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        router.push(`/login?redirect=/catalog/mock-tests/${slug}`);
        return;
      }
      let done = false;
      const { data: order } = await mockTestsApi.purchaseInitiate(pkg!.id);
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment window.");
      openRazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amountPaise: Math.round(Number(order.amount) * 100),
        currency: order.currency || "INR",
        orderId: order.razorpay_order_id,
        description: pkg?.title,
        prefill: { name: user?.full_name, email: user?.email },
        onDismiss: () => {
          if (!done) toast({ title: "Payment cancelled", description: "You can try again when ready." });
        },
        onFailure: (resp) =>
          toast({ title: "Payment failed", description: getRazorpayFailureMessage(resp), variant: "destructive" }),
        onSuccess: async (response) => {
          done = true;
          await mockTestsApi.purchaseConfirm({
            package_id: pkg!.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ["my-mock-packages"] });
          qc.invalidateQueries({ queryKey: ["mock-pkg", slug] });
          toast({ title: "Purchase complete! Start your tests below." });
        },
      });
    },
    onError: (e) =>
      toast({
        title: "Couldn't start checkout",
        description: getApiErrorMessage(e, "Check your connection and try again."),
        variant: "destructive",
      }),
  });

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm text-gray-400 font-medium">Loading package…</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!pkg) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900">Package not found</p>
          <p className="mt-2 text-sm text-gray-500">This package may have been removed.</p>
          <Link href="/catalog/mock-tests" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const papers: Paper[] = pkg.papers || [];
  const totalMins = papers.reduce((s: number, p: Paper) => s + p.time_limit_minutes, 0);
  const maxMarks = papers[0]?.total_marks ?? null;
  const mpq = papers[0]?.marks_per_question ?? 4;
  const neg = papers[0]?.negative_marks ?? 1;

  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <Navbar />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-violet-600 transition-colors flex items-center gap-1">
            <Home className="h-3 w-3" /> Home
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <Link href="/catalog/mock-tests" className="hover:text-violet-600 transition-colors">Mock Tests</Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{pkg.title}</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-center">

            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200 backdrop-blur mb-5">
                <ClipboardList className="h-3 w-3" /> MOCK TEST PACKAGE
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                {pkg.title}
              </h1>

              {pkg.description && (
                <p className="mt-4 text-base text-violet-200 leading-relaxed max-w-xl">
                  {pkg.description}
                </p>
              )}

              {/* Social proof row — real data */}
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-300" />
                  <span className="text-sm font-semibold text-white">
                    {stats?.enrolled_count ?? 0} <span className="text-violet-300 font-normal">Student{stats?.enrolled_count === 1 ? "" : "s"} Enrolled</span>
                  </span>
                </div>
                {stats && stats.review_count > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">{"★".repeat(Math.round(stats.avg_rating)) || "★"}</span>
                    <span className="text-sm font-semibold text-white">
                      {stats.avg_rating.toFixed(1)} <span className="text-violet-300 font-normal">Rating ({stats.review_count})</span>
                    </span>
                  </div>
                )}
                {stats && stats.test_takers > 0 && (
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-violet-300" />
                    <span className="text-sm font-semibold text-white">
                      {stats.test_takers} <span className="text-violet-300 font-normal">Test Taker{stats.test_takers === 1 ? "" : "s"}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Feature badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { icon: Shield,    label: "Expert Designed" },
                  { icon: Brain,     label: "AI-Powered Analysis" },
                  { icon: Target,    label: "Latest Exam Pattern" },
                ].map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                    <b.icon className="h-3 w-3" />
                    {b.label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right — floating stat cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { label: "Full Tests",     value: String(papers.length),        sub: "In this pack",     color: "from-violet-500 to-indigo-500", icon: ClipboardList },
                { label: "Total Duration", value: fmtMins(totalMins),           sub: "Exam time",        color: "from-blue-500 to-cyan-500",     icon: Timer },
                { label: "Max Score",      value: maxMarks ? String(maxMarks) : "—", sub: "Per paper",   color: "from-emerald-500 to-teal-500",  icon: Award },
                { label: "Validity",       value: "Lifetime",                   sub: "Access",           color: "from-orange-500 to-amber-500",  icon: Lock },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}>
                    <s.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <p className="text-xs text-violet-300 font-medium">{s.label}</p>
                  <p className="text-2xl font-extrabold text-white mt-0.5">{s.value}</p>
                  <p className="text-xs text-violet-300 mt-0.5">{s.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

        {/* ══ Left column ══ */}
        <div className="space-y-8">

          {/* Papers */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold text-gray-900">Papers in this package</h2>
            </div>

            {papers.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No papers added yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {papers.map((p: Paper, i: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="px-6 py-5 hover:bg-violet-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Number badge */}
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-extrabold text-violet-600">
                          {i + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-base">{p.title}</p>
                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Latest</span>
                          </div>

                          {/* Meta row */}
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {fmtMins(p.time_limit_minutes)}
                            </span>
                            {p.total_marks && (
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                                {p.total_marks} Marks
                              </span>
                            )}
                            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Medium</span>
                          </div>

                          {/* Marking scheme */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                              +{p.marks_per_question} Correct
                            </span>
                            {p.negative_marks > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                                -{p.negative_marks} Wrong
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                              0 Skipped
                            </span>
                          </div>

                          {/* Footer */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
                            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Validity: Lifetime Access</span>
                            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Attempts: Unlimited</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      {owned ? (
                        <Link
                          href={`/mock-tests/take/${p.id}`}
                          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          Start
                        </Link>
                      ) : (
                        <span className="shrink-0 flex items-center text-gray-300">
                          <ChevronRight className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* What you get */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold text-gray-900">What you get</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Brain,       title: "AI Performance Analysis",    desc: "Get detailed topic-wise analysis and smart recommendations." },
                { icon: BarChart3,   title: "Rank & Percentile Prediction", desc: "Know your expected rank and percentile instantly after the test." },
                { icon: BookOpen,    title: "Detailed Solutions",          desc: "Step-by-step solutions with concepts to help you learn better." },
                { icon: Zap,         title: "Adaptive Practice",           desc: "AI suggests what to practice next based on your performance." },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="rounded-xl border border-gray-100 bg-gradient-to-b from-violet-50/50 to-white p-4 text-center"
                >
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                    <f.icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{f.title}</p>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Live package stats */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-bold text-gray-900">How aspirants are performing</h2>
              </div>
              {stats && stats.test_takers > 0 && (
                <span className="text-xs font-semibold text-gray-400">Live data</span>
              )}
            </div>

            {stats && stats.test_takers > 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-[#f5f3ff] to-white p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Test Takers",    value: String(stats.test_takers),               sub: "Have attempted",  color: "text-violet-600" },
                    { label: "Total Attempts", value: String(stats.total_attempts),            sub: "And counting",    color: "text-blue-600"   },
                    { label: "Average Score",  value: `${stats.avg_score_percent}%`,           sub: "Across students", color: "text-amber-600"  },
                    { label: "Highest Score",  value: `${stats.highest_score_percent}%`,       sub: "Top performer",   color: "text-emerald-600"},
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-400 text-center">
                  After each test you get a full analysis — your rank, percentile, section-wise accuracy, and how you compare against everyone else.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gradient-to-br from-[#f5f3ff] to-white p-8 text-center">
                <BarChart3 className="h-10 w-10 text-violet-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Be the first to set the benchmark</p>
                <p className="mt-1 text-xs text-gray-400 max-w-md mx-auto">
                  No one has attempted this package yet. After you take a test, you&apos;ll get a full analysis —
                  rank, percentile, section-wise accuracy, and a live comparison against everyone who attempts it.
                </p>
              </div>
            )}
          </section>

          {/* Bottom feature strip */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Target,   title: "Real Exam Experience",  desc: "Interface similar to actual exam portal" },
              { icon: BookOpen, title: "Latest Exam Pattern",   desc: "Updated as per official guidelines" },
              { icon: Award,    title: "Expertly Curated",      desc: "Created by toppers and domain experts" },
              { icon: Shield,   title: "24/7 Support",          desc: "We're here to help you succeed" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center shadow-sm">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <f.icon className="h-5 w-5 text-violet-600" />
                </div>
                <p className="text-xs font-bold text-gray-900">{f.title}</p>
                <p className="mt-1 text-[11px] text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </section>
        </div>

        {/* ══ Right sticky column ══ */}
        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-6 space-y-4">

          {/* Price card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-700">{pkg.title}</p>
              <p className="mt-2 text-4xl font-extrabold text-gray-900 tabular-nums">{formatPrice(pkg.price)}</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Features list */}
              <ul className="space-y-2.5">
                {[
                  `${papers.length} Full-length Mock Test${papers.length !== 1 ? "s" : ""}`,
                  "AI Performance Analysis",
                  "Detailed Solutions",
                  "Rank & Percentile Prediction",
                  "Topic-wise Strength & Weakness",
                  "Mobile & Desktop Access",
                  "Lifetime Validity",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-500" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {owned ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> You own this package
                  </p>
                  {papers.map((p: Paper) => (
                    <Link
                      key={p.id}
                      href={`/mock-tests/take/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 transition-colors"
                    >
                      <span className="truncate">{p.title}</span>
                      <Play className="h-4 w-4 shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => buy.mutate()}
                  disabled={buy.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-base font-bold text-white shadow hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60"
                >
                  {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Start Practicing <ArrowRight className="h-4 w-4" /></>}
                </button>
              )}

              {!owned && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3 w-3" /> Secure Checkout
                </div>
              )}

              {/* Coupon */}
              {!owned && (
                <div className="border-t border-gray-50 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Have a coupon code?
                    </span>
                    <button className="font-semibold text-violet-600 hover:underline text-xs">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews card — real data */}
          <MockReviewsSection packageId={pkg.id} owned={owned} />

          <Link
            href="/catalog/mock-tests"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Browse more mock tests
          </Link>
        </aside>
      </div>

      {/* ── Bottom CTA Banner ── */}
      <section className="mt-6 bg-gradient-to-r from-[#1e1b4b] to-[#4c1d95]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/30">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">Ready to ace your exam?</p>
              <p className="text-sm text-violet-300">Join thousands of aspirants and take the next step towards your dream.</p>
            </div>
          </div>
          {owned ? (
            <Link
              href={papers[0] ? `/mock-tests/take/${papers[0].id}` : "/catalog/mock-tests"}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-bold text-violet-700 shadow hover:bg-violet-50 transition-colors"
            >
              Start Your Mock Test <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => buy.mutate()}
              disabled={buy.isPending}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-bold text-violet-700 shadow hover:bg-violet-50 transition-colors disabled:opacity-60"
            >
              {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Start Your Mock Test <ArrowRight className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
