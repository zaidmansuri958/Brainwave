"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { Loader2, Clock, Send, Trophy, CheckCircle2, XCircle, MinusCircle, AlertTriangle, BarChart3, Home, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { ProgressRing } from "@/components/ui/progress-ring";

/* ── Timer formatter ── */
const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export default function MockTestTakePage({ params }: { params: { paperId: string } }) {
  const { paperId } = params;
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [left, setLeft] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [result, setResult] = useState<{
    attempt_id?: string;
    score_percent: number;
    total_score: number;
    max_score: number;
    correct_count: number;
    wrong_count: number;
    skipped_count: number;
    penalty_deducted: number;
  } | null>(null);
  const autoSubmittedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  answersRef.current = answers;
  const leftRef = useRef<number | null>(null);
  leftRef.current = left;

  const { data: paper, isLoading } = useQuery({
    queryKey: ["paper-take", paperId],
    queryFn: () => mockTestsApi.paperTake(paperId).then((r) => r.data),
  });

  const totalSecs = useMemo(() => (paper?.time_limit_minutes || 60) * 60, [paper]);

  const submit = useMutation({
    mutationFn: () => {
      const elapsed = Math.max(0, totalSecs - (leftRef.current ?? totalSecs));
      return mockTestsApi.submitAttempt(paperId, answersRef.current, elapsed);
    },
    onSuccess: (r) => { setResult(r.data); toast({ title: "Test submitted!" }); },
    onError: (e) => toast({ title: "Submit failed", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  useEffect(() => { autoSubmittedRef.current = false; }, [paperId]);

  useEffect(() => {
    if (!paper || result) return;
    setLeft(totalSecs);
    const t = setInterval(() => {
      setLeft((x) => {
        if (x === null || x <= 1) { clearInterval(t); return 0; }
        return x - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paper, totalSecs, result]);

  useEffect(() => {
    if (left !== 0 || result || !paper || submit.isPending || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    submit.mutate();
  }, [left, result, paper, submit]);

  useEffect(() => {
    if (result) return;
    const fn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [result]);

  /* ── Loading ── */
  if (isLoading || !paper) {
    return (
      <div className="min-h-screen bg-[#f8f7ff] flex flex-col items-center justify-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
        <p className="text-sm font-semibold text-gray-500">Loading your exam…</p>
      </div>
    );
  }

  /* ── Result screen ── */
  if (result) {
    const grade =
      result.score_percent >= 90 ? { label: "Outstanding!", color: "text-emerald-600", bg: "bg-emerald-50" } :
      result.score_percent >= 75 ? { label: "Excellent!",   color: "text-blue-600",    bg: "bg-blue-50"    } :
      result.score_percent >= 60 ? { label: "Good",         color: "text-violet-600",  bg: "bg-violet-50"  } :
      result.score_percent >= 40 ? { label: "Average",      color: "text-amber-600",   bg: "bg-amber-50"   } :
                                   { label: "Needs Work",   color: "text-red-600",     bg: "bg-red-50"     };

    return (
      <div className="min-h-screen bg-[#f8f7ff]">
        {/* Result hero */}
        <div className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/20 px-4 py-1.5 text-xs font-semibold text-violet-200 mb-6">
                <Trophy className="h-3.5 w-3.5" /> Test Completed
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{paper.title}</h1>
              <p className="text-violet-300 text-sm">Here's how you performed</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 -mt-8 pb-16 space-y-6">
          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-8 flex flex-col sm:flex-row items-center gap-8">
              {/* Ring */}
              <div className="relative shrink-0">
                <div className="rounded-full p-2 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-inner">
                  <ProgressRing value={result.score_percent} size={150} strokeWidth={12} />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-gray-900">{result.score_percent.toFixed(0)}%</span>
                  <span className={`text-xs font-bold mt-0.5 ${grade.color}`}>{grade.label}</span>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">Net Score</p>
                <p className="text-5xl font-extrabold text-gray-900 tabular-nums">
                  {result.total_score.toFixed(0)}
                  <span className="text-2xl font-normal text-gray-400"> / {result.max_score.toFixed(0)}</span>
                </p>
                <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${grade.bg} ${grade.color}`}>
                  {grade.label}
                </div>
                <div className="mt-4 h-2 w-full max-w-xs mx-auto sm:mx-0 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score_percent}%` }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stat tiles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { icon: CheckCircle2, label: "Correct",          value: result.correct_count,              color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { icon: XCircle,      label: "Wrong",            value: result.wrong_count,                color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100"     },
              { icon: MinusCircle,  label: "Skipped",          value: result.skipped_count,              color: "text-gray-500",    bg: "bg-gray-50",    border: "border-gray-100"    },
              { icon: AlertTriangle,label: "Penalty Deducted", value: `−${result.penalty_deducted.toFixed(1)}`, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className={`rounded-2xl border ${s.border} ${s.bg} p-5 text-center`}
              >
                <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                <p className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Marking scheme reminder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-violet-100 bg-white p-5"
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Marking Scheme Applied</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700">+{paper.marks_per_question} per correct</span>
              {paper.negative_marks > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold text-red-600">−{paper.negative_marks} per wrong</span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-500">0 for skipped</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={`/mock-tests/results/${paperId}${result.attempt_id ? `?attempt=${result.attempt_id}` : ""}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-bold text-white shadow hover:opacity-90 transition-opacity"
            >
              <BarChart3 className="h-4 w-4" /> View Detailed Analysis
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-base font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              <Home className="h-4 w-4" /> Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Exam view ── */
  const sections = paper.sections || [];
  const flatQuestions = sections.flatMap((s: any) => s.questions || []);
  const answered = Object.keys(answers).length;
  const timerPct = left !== null && totalSecs > 0 ? (left / totalSecs) * 100 : 100;
  const urgent = left !== null && left < 300;
  const critical = left !== null && left < 60;

  // Build global question index per section
  let globalIdx = 0;
  const sectionOffsets: number[] = [];
  for (const sec of sections) {
    sectionOffsets.push(globalIdx);
    globalIdx += (sec.questions || []).length;
  }

  return (
    <div className="min-h-screen bg-[#f8f7ff]">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#1e1b4b] to-[#4c1d95] shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">

            {/* Left: title + scheme */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="hidden sm:inline text-[11px] font-semibold text-violet-300 uppercase tracking-widest">Exam Mode</span>
                <span className="hidden sm:inline text-violet-500">·</span>
                <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-widest truncate">{paper.title}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                  +{paper.marks_per_question} Correct
                </span>
                {paper.negative_marks > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-400/30 px-2 py-0.5 text-[11px] font-bold text-red-300">
                    −{paper.negative_marks} Wrong
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[11px] font-bold text-white/60">
                  0 Skipped
                </span>
              </div>
            </div>

            {/* Center: timer */}
            <div className={`flex flex-col items-center shrink-0 ${critical ? "animate-pulse" : ""}`}>
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                critical ? "bg-red-500 text-white" :
                urgent   ? "bg-orange-400/20 border border-orange-400/40 text-orange-200" :
                           "bg-white/10 border border-white/20 text-white"
              }`}>
                <Clock className={`h-4 w-4 shrink-0 ${urgent ? "animate-pulse" : ""}`} />
                <span className="tabular-nums text-xl font-extrabold tracking-wider">
                  {left !== null ? fmt(left) : "--:--:--"}
                </span>
              </div>
              {/* Timer bar */}
              <div className="mt-1.5 h-1 w-32 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${critical ? "bg-red-400" : urgent ? "bg-orange-400" : "bg-violet-400"}`}
                  initial={false}
                  animate={{ width: `${timerPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Right: progress + submit */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] text-violet-300 font-semibold">{answered} / {flatQuestions.length} answered</span>
                <div className="mt-1 h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-all duration-300"
                    style={{ width: `${flatQuestions.length > 0 ? (answered / flatQuestions.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={submit.isPending}
                onClick={() => submit.mutate()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow hover:bg-violet-50 transition-colors disabled:opacity-60"
              >
                {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Submit Test</span>
              </button>
            </div>
          </div>

          {/* Section tabs */}
          {sections.length > 1 && (
            <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-none">
              {sections.map((sec: any, si: number) => {
                const secQs: any[] = sec.questions || [];
                const secAnswered = secQs.filter((q: any) => answers[q.id]).length;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(si)}
                    className={`shrink-0 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeSection === si
                        ? "bg-white text-violet-700"
                        : "text-violet-200 hover:bg-white/10"
                    }`}
                  >
                    {sec.title}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeSection === si ? "bg-violet-100 text-violet-600" : "bg-white/20 text-white"
                    }`}>
                      {secAnswered}/{secQs.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* Questions panel */}
        <div className="space-y-6">
          {sections.map((sec: any, si: number) => {
            const secQs: any[] = sec.questions || [];
            if (sections.length > 1 && si !== activeSection) return null;
            return (
              <motion.div
                key={sec.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white text-xs font-bold shrink-0">
                    {si + 1}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{sec.title}</h2>
                    <p className="text-xs text-gray-400">{secQs.length} questions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {secQs.map((q: any, qi: number) => {
                    const globalNum = sectionOffsets[si] + qi + 1;
                    const selected = answers[q.id];
                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qi * 0.03 }}
                        className={`bg-white rounded-2xl border-2 shadow-sm transition-colors ${
                          selected ? "border-violet-200" : "border-gray-100"
                        }`}
                      >
                        {/* Question header */}
                        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-50">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                            selected ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            {globalNum}
                          </span>
                          <p className="text-gray-900 font-medium leading-relaxed text-[15px]">{q.question_text}</p>
                          <span className="shrink-0 ml-auto rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                            +{q.marks || paper.marks_per_question}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="px-5 py-4 space-y-2.5">
                          {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => {
                            const isSelected = selected === opt;
                            return (
                              <label
                                key={oi}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all hover:border-violet-300 hover:bg-violet-50/50 ${
                                  isSelected
                                    ? "border-violet-500 bg-violet-50 shadow-sm"
                                    : "border-gray-100 bg-white"
                                }`}
                              >
                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold transition-colors ${
                                  isSelected
                                    ? "bg-violet-600 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                  {OPTION_LABELS[oi]}
                                </div>
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  className="hidden"
                                  checked={isSelected}
                                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                                />
                                <span className={`text-sm font-medium ${isSelected ? "text-violet-900" : "text-gray-700"}`}>
                                  {opt}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-violet-500 ml-auto shrink-0" />
                                )}
                              </label>
                            );
                          })}

                          {/* Text input for non-MCQ */}
                          {(!q.options || !q.options.length) && (
                            <input
                              className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
                              placeholder="Type your answer here…"
                              value={answers[q.id] || ""}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                            />
                          )}
                        </div>

                        {/* Clear answer */}
                        {selected && (
                          <div className="px-5 pb-3">
                            <button
                              type="button"
                              onClick={() => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n; })}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                            >
                              Clear answer
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Navigator sidebar ── */}
        <aside className="h-fit lg:sticky lg:top-[120px] space-y-4">

          {/* Progress card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Question Navigator</p>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <span className="h-3 w-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
                Unanswered
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <span className="h-3 w-3 rounded-sm bg-violet-600 inline-block" />
                Answered
              </span>
            </div>

            {/* Question grid — per section */}
            {sections.map((sec: any, si: number) => {
              const secQs: any[] = sec.questions || [];
              const offset = sectionOffsets[si];
              return (
                <div key={sec.id} className="mb-4">
                  {sections.length > 1 && (
                    <button
                      onClick={() => setActiveSection(si)}
                      className={`w-full text-left text-[11px] font-bold mb-2 px-1 ${
                        activeSection === si ? "text-violet-600" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {sec.title}
                    </button>
                  )}
                  <div className="grid grid-cols-5 gap-1.5">
                    {secQs.map((q: any, qi: number) => {
                      const num = offset + qi + 1;
                      const isAnswered = Boolean(answers[q.id]);
                      return (
                        <button
                          key={q.id}
                          onClick={() => { setActiveSection(si); }}
                          className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            isAnswered
                              ? "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
                              : "bg-gray-50 border border-gray-100 text-gray-500 hover:border-violet-200 hover:text-violet-600"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progress</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Answered", value: answered,                              color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Skipped",  value: flatQuestions.length - answered,       color: "text-gray-500",   bg: "bg-gray-50"   },
                { label: "Total",    value: flatQuestions.length,                  color: "text-gray-900",   bg: "bg-gray-50"   },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl ${s.bg} p-2`}>
                  <p className={`text-xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${flatQuestions.length > 0 ? (answered / flatQuestions.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-400 font-medium">
              {flatQuestions.length > 0 ? Math.round((answered / flatQuestions.length) * 100) : 0}% complete
            </p>

            <button
              type="button"
              disabled={submit.isPending}
              onClick={() => submit.mutate()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Test
            </button>

            {/* Marking scheme reminder */}
            <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marking Scheme</p>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-600">+{paper.marks_per_question} correct</span>
                {paper.negative_marks > 0 && <span className="text-red-500">−{paper.negative_marks} wrong</span>}
                <span className="text-gray-400">0 skipped</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
