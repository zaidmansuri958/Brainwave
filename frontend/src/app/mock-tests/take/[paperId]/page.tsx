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
          <div className="mx-auto mb-6 flex justify-center">
            <div className="relative rounded-full border-8 border-black bg-white p-4 shadow-sm">
              <ProgressRing value={result.score_percent} size={140} strokeWidth={10} />
            </div>
          </div>
          <h1 className=" text-4xl  uppercase tracking-tight text-gray-900">Results</h1>
          <p className="mt-3 text-lg font-bold text-gray-600 uppercase tracking-widest">
            Score {result.total_score.toFixed(1)} / {result.max_score.toFixed(1)}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            <div className="rounded-[20px] border border-gray-200 bg-green-100 p-4 shadow-sm">
              <p className="text-xs  uppercase tracking-widest text-gray-800">Correct</p>
              <p className="mt-2 text-2xl  text-black tabular-nums">{Math.round(result.max_score * (result.score_percent / 100))}</p>
            </div>
            <div className="rounded-[20px] border border-gray-200 bg-yellow-300 p-4 shadow-sm">
              <p className="text-xs  uppercase tracking-widest text-gray-800">Accuracy</p>
              <p className="mt-2 text-2xl  text-black tabular-nums">{result.score_percent.toFixed(1)}%</p>
            </div>
          </div>
          <Link href="/dashboard" className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-black px-8 py-4 text-lg  uppercase tracking-widest text-white shadow-[6px_6px_0_#ffe500] transition-all hover:-translate-y-1 hover:bg-blue-100 hover:text-black hover:shadow-sm">
            Back to dashboard
          </Link>
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
    <div className="min-h-screen bg-white font-body">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <div className="sticky top-0 z-20 border-b-4 border-black bg-yellow-300 shadow-[0_4px_0_#111111]">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs  uppercase tracking-widest text-gray-800 mb-1">Exam mode</p>
            <h1 className=" text-2xl  uppercase text-gray-900">{paper.title}</h1>
          </div>
          <motion.div
            layout
            className={`inline-flex items-center gap-3 self-start rounded-full border border-gray-200 px-5 py-2 text-sm  uppercase tracking-widest shadow-sm transition-colors ${
              urgent
                ? "bg-orange-500 text-white"
                : "bg-white text-black"
            }`}
          >
            <Clock className={`h-5 w-5 shrink-0 ${urgent ? "animate-pulse" : ""}`} strokeWidth={3} />
            <span className="tabular-nums text-lg">{left !== null ? fmt(left) : "—"}</span>
            <div className="ml-2 h-2 w-20 overflow-hidden rounded-full border border-gray-200 bg-white">
              <motion.div
                className={urgent ? "h-full rounded-full bg-white" : "h-full rounded-full bg-blue-100"}
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[1fr_300px] relative z-10">
        <div className="space-y-10">
          {(paper.sections || []).map((sec: any, si: number) => (
            <motion.section
              key={sec.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.06, duration: 0.4 }}
              className="rounded-xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm"
            >
              <h2 className=" text-2xl  uppercase tracking-tight text-gray-900 mb-8 inline-block border-b-4 border-black pb-2">{sec.title}</h2>
              <div className="space-y-8">
                {(sec.questions || []).map((q: any, qi: number) => (
                  <div key={q.id} className="border-t-4 border-black/10 first:border-0 first:pt-0 pt-8 first:mt-0 mt-8">
                    <p className="text-lg text-gray-900 font-bold leading-relaxed mb-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-yellow-300 text-sm  mr-2 ">{qi + 1}</span> 
                      {q.question_text}
                    </p>
                    <div className="mt-4 space-y-3">
                      {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => (
                        <label
                          key={oi}
                          className="flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-800 transition-all hover:-translate-y-1 hover:shadow-sm"
                        >
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 transition-colors ${answers[q.id] === opt ? "bg-orange-500" : "bg-white"}`}>
                             {answers[q.id] === opt && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                          </div>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="hidden"
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                          />
                          {opt}
                        </label>
                      ))}
                      {(!q.options || !q.options.length) && (
                        <input
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:shadow-[6px_6px_0_#ff6b00]"
                          placeholder="Type your answer here..."
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
        <aside className="h-fit rounded-xl border border-gray-200 bg-amber-50 p-6 sm:p-8 shadow-sm lg:sticky lg:top-32">
          <p className="mb-6 text-sm  uppercase tracking-widest text-gray-800">Question Navigator</p>
          <div className="flex items-center gap-2 mb-6">
             <span className="text-xs font-bold uppercase text-gray-600"><span className="inline-block h-3 w-3 rounded-full border border-gray-200 bg-white mr-1" />Unanswered</span>
             <span className="text-xs font-bold uppercase text-gray-600"><span className="inline-block h-3 w-3 rounded-full border border-gray-200 bg-orange-500 mr-1" />Answered</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {flatQuestions.map((q: any, idx: number) => {
              const attempted = Boolean(answers[q.id]);
              return (
                <div key={q.id} className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-sm  transition-colors ${attempted ? "bg-orange-500 text-white " : "bg-white text-gray-500 hover:bg-slate-50"}`}>
                  {idx + 1}
                </div>
              );
            })}
          </div>
          <div className="mt-8 border-t-4 border-black pt-6">
            <p className="mb-4 text-xs  uppercase tracking-widest text-gray-800">Completed: {Object.keys(answers).length} / {flatQuestions.length}</p>
            <button type="button" disabled={submit.isPending} onClick={() => submit.mutate()} className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-blue-100 px-6 py-4 text-base  uppercase tracking-widest text-black shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              {submit.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" strokeWidth={3} />}
              Submit Test
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
