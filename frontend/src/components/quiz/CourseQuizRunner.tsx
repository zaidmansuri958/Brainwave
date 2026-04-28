"use client";

import { useEffect, useMemo } from "react";
import { QuizProvider, useQuiz, useActions } from "react-quiz-kit";
import type { QuizData } from "react-quiz-kit";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

function optionText(opt: unknown): string {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object" && "text" in opt) return String((opt as { text?: string }).text || "");
  return String(opt ?? "");
}

export function buildQuizData(
  title: string,
  questions: Array<{
    id: string;
    question_text: string;
    question_type?: string;
    options?: unknown[];
  }>
): QuizData {
  return {
    title,
    questions: questions.map((q) => {
      const opts = (q.options || []).map((o) => optionText(o)).filter(Boolean);
      return {
        id: q.id,
        text: q.question_text,
        type: q.question_type === "true_false" ? "true-false" : "multiple-choice",
        options: opts.length ? opts : ["True", "False"],
        correctAnswer: "",
      };
    }),
  };
}

function InnerQuiz({
  slug,
  onSubmitServer,
  submitting,
}: {
  slug: string;
  onSubmitServer: (answers: Record<string, string>) => void;
  submitting: boolean;
}) {
  const title = useQuiz((s) => s.quizData.title);
  const idx = useQuiz((s) => s.currentQuestionIndex);
  const questions = useQuiz((s) => s.quizData.questions);
  const responses = useQuiz((s) => s.userResponses);
  const { startQuiz, answerQuestion, nextQuestion, prevQuestion, finishQuiz } = useActions();

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const total = questions.length;
  const current = questions[idx - 1];
  const answeredForCurrent = current ? responses.find((r) => r.questionId === current.id) : undefined;

  const handlePick = (opt: string) => {
    if (!current) return;
    answerQuestion({ questionId: current.id, selectedAnswer: opt });
  };

  const buildPayload = () => {
    const answers: Record<string, string> = {};
    for (const r of responses) answers[r.questionId] = String(r.selectedAnswer ?? "");
    return answers;
  };

  const handleSubmit = () => {
    finishQuiz();
    onSubmitServer(buildPayload());
  };

  const progress = total > 0 ? (idx / total) * 100 : 0;

  if (!current || total === 0) return null;

  return (
    <div className="bw-shell max-w-2xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-4">
        <Link href={`/learn/${slug}`} className="neo-secondary-btn mt-1 h-10 w-10 shrink-0 rounded-[14px] px-0 py-0 text-slate-700" aria-label="Back to course">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-lg font-bold uppercase text-gray-900">{title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">Question {idx} of {total} • {responses.length} answered</p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-black bg-white">
            <motion.div
              className="h-full rounded-full bg-[#ffe500]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
            />
          </div>
        </div>
      </motion.div>

      <div className="neo-panel p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="mb-6 text-lg font-semibold leading-snug text-gray-900">{current.text}</h2>
            <div className="space-y-3">
              {(current.options || []).map((opt) => {
                const selected = answeredForCurrent?.selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handlePick(opt)}
                    className={`w-full rounded-[16px] border-2 p-4 text-left text-sm transition-all duration-200 sm:text-base ${
                      selected
                        ? "border-black bg-[#ffe500] text-black shadow-[3px_3px_0_#111111]"
                        : "border-black bg-white text-gray-700 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-[#fff4d6] hover:shadow-[3px_3px_0_#111111] active:scale-[0.995]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex gap-3 pt-2">
          {idx > 1 ? (
            <button type="button" onClick={() => prevQuestion()} className="neo-secondary-btn px-4 py-2.5 text-sm">
              Previous
            </button>
          ) : null}
          {idx < total ? (
            <button
              type="button"
              onClick={() => nextQuestion()}
              disabled={!answeredForCurrent}
              className="neo-primary-btn ml-auto px-6 py-2.5 text-sm disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
            >
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting || !answeredForCurrent} className="neo-dark-btn ml-auto px-6 py-2.5 text-sm disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit quiz
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const done = responses.some((r) => r.questionId === q.id);
          return (
            <button
              key={q.id}
              type="button"
              className={`min-w-[2.25rem] rounded-[12px] border-2 px-2.5 py-2 text-xs font-extrabold transition-all duration-200 ${
                i + 1 === idx
                  ? "border-black bg-[#ffe500] text-black shadow-[3px_3px_0_#111111] scale-105"
                  : done
                    ? "border-black bg-[#8ed8ff] text-slate-900"
                    : "border-black bg-white text-gray-600 hover:bg-[#fff4d6]"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CourseQuizRunner({
  slug,
  quiz,
  onSubmitServer,
  submitting,
}: {
  slug: string;
  quiz: { title: string; questions: Array<{ id: string; question_text: string; question_type?: string; options?: unknown[] }> };
  onSubmitServer: (answers: Record<string, string>) => void;
  submitting: boolean;
}) {
  const quizData = useMemo(() => buildQuizData(quiz.title || "Quiz", quiz.questions || []), [quiz]);

  if (!quizData.questions.length) return null;

  return (
    <QuizProvider quizData={quizData}>
      <InnerQuiz slug={slug} onSubmitServer={onSubmitServer} submitting={submitting} />
    </QuizProvider>
  );
}
