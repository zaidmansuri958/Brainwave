"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { DashboardLayout, SectionCard } from "@/components/layout/DashboardLayout";
import {
  Trophy, Target, TrendingUp, Clock, Award, Users, Crown,
  CheckCircle2, XCircle, MinusCircle, Loader2, ArrowRight, Medal,
  ChevronUp, ChevronDown, BarChart3, Zap,
} from "lucide-react";

/* ── Helpers ── */
function fmtTime(secs?: number | null) {
  if (!secs && secs !== 0) return "—";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ── Donut ring ── */
function ScoreRing({ percent }: { percent: number }) {
  const size = 160, stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, percent)) / 100);
  const color = percent >= 75 ? "#10b981" : percent >= 50 ? "#7c3aed" : percent >= 30 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#ede9fe" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-extrabold text-gray-900">{percent.toFixed(0)}<span className="text-xl">%</span></p>
        <p className="text-xs font-semibold text-gray-400 mt-0.5">Score</p>
      </div>
    </div>
  );
}

export default function MockTestResultsPage({ params }: { params: { paperId: string } }) {
  const { paperId } = params;
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt") || undefined;

  const { data: analytics, isLoading: aLoading, isError } = useQuery({
    queryKey: ["mock-analytics", paperId, attemptId],
    queryFn: () => mockTestsApi.analytics(paperId, attemptId).then((r) => r.data),
  });

  const { data: board, isLoading: bLoading } = useQuery({
    queryKey: ["mock-leaderboard", paperId],
    queryFn: () => mockTestsApi.leaderboard(paperId).then((r) => r.data),
  });

  if (aLoading || bLoading) {
    return (
      <DashboardLayout title="Performance Analysis" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Test Analysis" }]}>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm font-medium text-gray-400">Crunching your numbers…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !analytics) {
    return (
      <DashboardLayout title="Performance Analysis" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Test Analysis" }]}>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="font-semibold text-gray-700">No attempt found for this paper</p>
          <p className="mt-1 text-sm text-gray-400">Take the test first to see your analysis.</p>
          <Link href={`/mock-tests/take/${paperId}`} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Start Test <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalStudents = board?.total_students || 1;
  const myRank = board?.my_rank || 1;
  const aheadOf = board?.ahead_of ?? 0;
  const percentile = board?.percentile ?? 0;
  const topper = board?.topper;
  const distribution = board?.distribution || [];
  const maxBucket = Math.max(1, ...distribution.map((d: any) => d.count));
  const myBucketIdx = board?.max_marks > 0
    ? Math.min(9, Math.floor((analytics.total_score / board.max_marks) * 10))
    : 0;

  const timePct = analytics.time_taken_seconds && analytics.time_limit_minutes
    ? Math.min(100, (analytics.time_taken_seconds / (analytics.time_limit_minutes * 60)) * 100)
    : 0;

  const heroStats = [
    { label: "Net Score", value: `${analytics.total_score}`, sub: `of ${analytics.max_score}`, icon: Award, color: "from-violet-500 to-indigo-500" },
    { label: "Rank", value: `#${myRank}`, sub: `of ${totalStudents}`, icon: Trophy, color: "from-amber-500 to-orange-500" },
    { label: "Percentile", value: percentile.toFixed(1), sub: percentile >= 90 ? "Top performer" : "Keep going", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
    { label: "Accuracy", value: `${analytics.accuracy}%`, sub: `${analytics.correct_count}/${analytics.attempted} correct`, icon: Target, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <DashboardLayout
      title="Performance Analysis"
      subtitle={analytics.paper_title}
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Test Analysis" }]}
    >
      {/* ── Hero comparison banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] p-6 sm:p-8 mb-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          {/* Ring */}
          <div className="rounded-full bg-white p-3 shadow-xl shrink-0">
            <ScoreRing percent={analytics.score_percent} />
          </div>

          {/* Comparison text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200 mb-3">
              <Users className="h-3.5 w-3.5" /> {totalStudents} student{totalStudents !== 1 ? "s" : ""} attempted this paper
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              You&apos;re ahead of{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {aheadOf} student{aheadOf !== 1 ? "s" : ""}
              </span>
            </h2>
            <p className="mt-2 text-violet-200">
              Ranked <span className="font-bold text-white">{ordinal(myRank)}</span> out of {totalStudents} ·
              {" "}<span className="font-bold text-white">{percentile.toFixed(1)} percentile</span>
            </p>

            {/* Rank progress bar */}
            <div className="mt-4 max-w-md mx-auto lg:mx-0">
              <div className="flex justify-between text-[11px] text-violet-300 mb-1">
                <span>Last</span><span>You beat {percentile.toFixed(0)}% of peers</span><span>Top</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentile}%` }}
                  transition={{ delay: 0.3, duration: 0.9 }}
                />
              </div>
            </div>
          </div>

          {/* Topper card */}
          {topper && (
            <div className="shrink-0 rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm p-5 text-center min-w-[180px]">
              <Crown className="mx-auto mb-2 h-7 w-7 text-amber-300" />
              <p className="text-[11px] uppercase tracking-widest text-violet-300 font-semibold">Topper</p>
              <p className="mt-1 text-base font-bold text-white truncate">{topper.is_me ? "You! 🎉" : topper.student_name}</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-300">{topper.total_score}</p>
              <p className="text-[11px] text-violet-300">highest score</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Hero stat tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {heroStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{s.value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ══ Left column ══ */}
        <div className="xl:col-span-2 space-y-6">

          {/* Answer breakdown */}
          <SectionCard title="Answer Breakdown">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, label: "Correct", value: analytics.correct_count, color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: XCircle, label: "Wrong", value: analytics.wrong_count, color: "text-red-500", bg: "bg-red-50" },
                { icon: MinusCircle, label: "Skipped", value: analytics.skipped_count, color: "text-gray-500", bg: "bg-gray-50" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl ${s.bg} p-4 text-center`}>
                  <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {analytics.penalty_deducted > 0 && (
              <p className="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> {analytics.penalty_deducted} marks deducted from negative marking
              </p>
            )}
          </SectionCard>

          {/* Section-wise performance */}
          <SectionCard title="Section-wise Performance" subtitle="Your accuracy vs the cohort average">
            <div className="space-y-5">
              {analytics.sections.map((sec: any) => (
                <div key={sec.section_id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">{sec.title}</p>
                    <span className="text-xs text-gray-400">{sec.correct}/{sec.total_questions} correct</span>
                  </div>
                  {/* My accuracy bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-12 text-[11px] font-semibold text-violet-600 shrink-0">You</span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${sec.accuracy}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-bold text-violet-600 shrink-0">{sec.accuracy}%</span>
                  </div>
                  {/* Cohort avg bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[11px] font-medium text-gray-400 shrink-0">Avg</span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gray-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${sec.cohort_avg_accuracy}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold text-gray-400 shrink-0">{sec.cohort_avg_accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Score distribution */}
          <SectionCard title="Where You Stand" subtitle="Score distribution across all students">
            <div className="flex items-end gap-1.5 h-40">
              {distribution.map((d: any, i: number) => {
                const isMe = i === myBucketIdx;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    {isMe && (
                      <span className="text-[9px] font-bold text-violet-600 whitespace-nowrap">YOU</span>
                    )}
                    <motion.div
                      className={`w-full rounded-t-md ${isMe ? "bg-gradient-to-t from-violet-600 to-indigo-500" : "bg-gray-200"}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxBucket) * 100}%` }}
                      transition={{ delay: i * 0.04, duration: 0.5 }}
                      style={{ minHeight: d.count > 0 ? 6 : 0 }}
                      title={`${d.range}: ${d.count} students`}
                    />
                    <span className="text-[8px] text-gray-400 -rotate-45 origin-center whitespace-nowrap mt-1">{d.range}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* ══ Right column ══ */}
        <div className="space-y-6">

          {/* Strengths & weaknesses */}
          <SectionCard title="Strengths & Focus Areas">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ChevronUp className="h-3.5 w-3.5" /> Strengths
                </p>
                {analytics.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analytics.strengths.map((s: string) => (
                      <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{s}</span>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">Keep practicing to build strengths.</p>}
              </div>
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ChevronDown className="h-3.5 w-3.5" /> Focus Areas
                </p>
                {analytics.weaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analytics.weaknesses.map((s: string) => (
                      <span key={s} className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">{s}</span>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">No weak areas — great job!</p>}
              </div>
            </div>
          </SectionCard>

          {/* Time management */}
          <SectionCard title="Time Management">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900">{fmtTime(analytics.time_taken_seconds)}</p>
                <p className="text-xs text-gray-400">of {analytics.time_limit_minutes} min limit</p>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${timePct > 90 ? "bg-red-400" : timePct > 70 ? "bg-amber-400" : "bg-emerald-400"}`}
                initial={{ width: 0 }}
                animate={{ width: `${timePct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {timePct === 0 ? "Time not recorded for this attempt." :
               timePct > 90 ? "You used almost all your time — work on speed." :
               timePct < 50 ? "You finished with time to spare." :
               "Good pace — balanced time usage."}
            </p>
          </SectionCard>

          {/* Leaderboard */}
          <SectionCard
            title="Leaderboard"
            action={<span className="text-xs text-gray-400">Top {Math.min(50, (board?.leaderboard || []).length)}</span>}
          >
            <div className="space-y-1">
              {(board?.leaderboard || []).map((e: any) => (
                <div
                  key={e.student_id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${e.is_me ? "bg-violet-50 ring-1 ring-violet-200" : "hover:bg-gray-50"}`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                    e.rank === 1 ? "bg-amber-100 text-amber-600" :
                    e.rank === 2 ? "bg-gray-100 text-gray-500" :
                    e.rank === 3 ? "bg-orange-100 text-orange-600" :
                    "bg-gray-50 text-gray-400"
                  }`}>
                    {e.rank <= 3 ? <Medal className="h-3.5 w-3.5" /> : e.rank}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 overflow-hidden">
                    {e.student_avatar ? <img src={e.student_avatar} alt="" className="h-full w-full object-cover" /> : (e.student_name?.[0] || "S")}
                  </div>
                  <p className={`text-sm truncate flex-1 ${e.is_me ? "font-bold text-violet-900" : "font-medium text-gray-700"}`}>
                    {e.is_me ? "You" : e.student_name}
                  </p>
                  <span className="text-sm font-extrabold text-gray-900 shrink-0 tabular-nums">{e.total_score}</span>
                </div>
              ))}
              {(board?.leaderboard || []).length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">Be the first to top this paper!</p>
              )}
            </div>
          </SectionCard>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/mock-tests/take/${paperId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity"
            >
              <Zap className="h-4 w-4" /> Re-attempt Test
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
