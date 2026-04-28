"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { Loader2, Clock, Send, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { ProgressRing } from "@/components/ui/progress-ring";

export default function MockTestTakePage({ params }: { params: { paperId: string } }) {
  const { paperId } = params;
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [left, setLeft] = useState<number | null>(null);
  const [result, setResult] = useState<{ score_percent: number; total_score: number; max_score: number } | null>(null);
  const autoSubmittedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  answersRef.current = answers;

  const { data: paper, isLoading } = useQuery({
    queryKey: ["paper-take", paperId],
    queryFn: () => mockTestsApi.paperTake(paperId).then((r) => r.data),
  });

  const submit = useMutation({
    mutationFn: () => mockTestsApi.submitAttempt(paperId, answersRef.current),
    onSuccess: (r) => {
      setResult(r.data);
      toast({ title: "Submitted" });
    },
    onError: (e) =>
      toast({
        title: "Submit failed",
        description: getApiErrorMessage(e),
        variant: "destructive",
      }),
  });

  useEffect(() => {
    autoSubmittedRef.current = false;
  }, [paperId]);

  const secs = useMemo(() => (paper?.time_limit_minutes || 60) * 60, [paper]);

  useEffect(() => {
    if (!paper || result) return;
    setLeft(secs);
    const t = setInterval(() => {
      setLeft((x) => {
        if (x === null || x <= 1) {
          clearInterval(t);
          return 0;
        }
        return x - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paper, secs, result]);

  useEffect(() => {
    if (left !== 0 || result || !paper || submit.isPending || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    submit.mutate();
  }, [left, result, paper, submit]);

  useEffect(() => {
    if (result) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [result]);

  if (isLoading || !paper) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-xl px-4 py-16 text-center"
        >
          <div className="mx-auto mb-6">
            <ProgressRing value={result.score_percent} size={140} strokeWidth={10} />
          </div>
          <h1 className="font-display text-3xl text-ink-heading">Results</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Score {result.total_score.toFixed(1)} / {result.max_score.toFixed(1)}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-lg border border-[#e2e5ec] p-3"><p className="text-xs text-ink-muted">Correct</p><p className="text-lg font-semibold text-green-700">{Math.round(result.max_score * (result.score_percent / 100))}</p></div>
            <div className="rounded-lg border border-[#e2e5ec] p-3"><p className="text-xs text-ink-muted">Accuracy</p><p className="text-lg font-semibold text-ink-heading">{result.score_percent.toFixed(1)}%</p></div>
          </div>
          <Link href="/dashboard" className="bw-action-primary mt-10 inline-flex px-8">Back to dashboard</Link>
        </motion.div>
      </div>
    );
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const totalSecs = (paper.time_limit_minutes || 60) * 60;
  const pct = left !== null && totalSecs > 0 ? Math.min(100, (left / totalSecs) * 100) : 100;
  const urgent = left !== null && left < 300;

  const flatQuestions = (paper.sections || []).flatMap((s: any) => s.questions || []);
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 border-b border-[#e2e5ec] bg-white">
        <div className="bw-shell flex items-center justify-between py-3">
          <div>
            <p className="text-xs text-ink-muted">Exam mode</p>
            <h1 className="font-semibold text-ink-heading">{paper.title}</h1>
          </div>
          <motion.div
            layout
            className={`inline-flex items-center gap-2 self-start rounded-md border px-4 py-2.5 text-sm font-bold tabular-nums transition-colors ${
              urgent
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-amber-200/80 bg-amber-50 text-amber-900"
            }`}
          >
            <Clock className={`h-4 w-4 shrink-0 ${urgent ? "animate-pulse" : ""}`} />
            <span>{left !== null ? fmt(left) : "—"}</span>
            <div className="ml-1 h-1.5 w-16 overflow-hidden rounded-full bg-white/60">
              <motion.div
                className={urgent ? "h-full rounded-full bg-rose-500" : "h-full rounded-full bg-amber-400"}
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </motion.div>
          <p className="text-sm text-ink-muted">Question {Object.keys(answers).length} of {flatQuestions.length}</p>
        </div>
      </div>
      <div className="bw-shell grid gap-6 py-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-8">
          {(paper.sections || []).map((sec: any, si: number) => (
            <motion.section
              key={sec.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.06, duration: 0.4 }}
              className="rounded-xl border border-[#e2e5ec] bg-white p-5 sm:p-6 shadow-card"
            >
              <h2 className="font-display font-semibold text-gray-900 mb-4">{sec.title}</h2>
              <div className="space-y-5">
                {(sec.questions || []).map((q: any, qi: number) => (
                  <div key={q.id} className="border-t border-gray-100 first:border-0 first:pt-0 pt-5 first:mt-0 mt-5">
                    <p className="text-sm text-gray-800 font-medium">
                      {qi + 1}. {q.question_text}
                    </p>
                    <div className="mt-2 space-y-2">
                      {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => (
                        <label
                          key={oi}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-50/80"
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                          />
                          {opt}
                        </label>
                      ))}
                      {(!q.options || !q.options.length) && (
                        <input
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm transition-shadow focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Your answer"
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
        <aside className="h-fit rounded-xl border border-[#e2e5ec] bg-[#f7f8fa] p-4">
          <p className="mb-3 text-sm font-semibold text-ink-heading">Question Navigator</p>
          <div className="grid grid-cols-4 gap-2">
            {flatQuestions.map((q: any, idx: number) => {
              const attempted = Boolean(answers[q.id]);
              return (
                <div key={q.id} className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${attempted ? "bg-brand-primary text-white" : "border border-[#e2e5ec] bg-white text-ink-muted"}`}>
                  {idx + 1}
                </div>
              );
            })}
          </div>
          <button type="button" disabled={submit.isPending} onClick={() => submit.mutate()} className="bw-action-primary mt-6 w-full">
            {submit.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            Submit Test
          </button>
        </aside>
      </div>
    </div>
  );
}
