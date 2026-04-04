"use client";

import { useEffect, useMemo } from "react";
import { QuizProvider, useQuiz, useActions } from "react-quiz-kit";
import type { QuizData } from "react-quiz-kit";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

function optionText(opt: unknown, index: number): string {
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
      const opts = (q.options || []).map((o, i) => optionText(o, i)).filter(Boolean);
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
    for (const r of responses) {
      answers[r.questionId] = String(r.selectedAnswer ?? "");
    }
    return answers;
  };

  const handleSubmit = () => {
    finishQuiz();
    const answers = buildPayload();
    if (current && answeredForCurrent) {
      answers[current.id] = String(answeredForCurrent.selectedAnswer ?? "");
    }
    onSubmitServer(answers);
  };

  const goNext = () => {
    if (idx < total) nextQuestion();
  };

  const progress = total > 0 ? (idx / total) * 100 : 0;

  if (!current || total === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start gap-4"
      >
        <Link
          href={`/learn/${slug}`}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 hover:shadow-card"
          aria-label="Back to course"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display font-bold text-lg text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Question {idx} of {total} · {responses.length} answered
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
            />
          </div>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-gray-100/90 bg-white p-6 sm:p-8 shadow-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-gray-900 font-semibold text-lg mb-6 leading-snug">{current.text}</h2>
            <div className="space-y-3">
              {(current.options || []).map((opt) => {
                const selected = answeredForCurrent?.selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handlePick(opt)}
                    className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all duration-200 ${
                      selected
                        ? "border-indigo-500 bg-indigo-50/90 text-indigo-950 shadow-sm ring-1 ring-indigo-500/20"
                        : "border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-gray-50/80 hover:shadow-sm active:scale-[0.995]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8 pt-2">
          {idx > 1 && (
            <button
              type="button"
              onClick={() => prevQuestion()}
              className="text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 active:scale-[0.98]"
            >
              Previous
            </button>
          )}
          {idx < total ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!answeredForCurrent}
              className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-button-indigo transition-all hover:bg-indigo-700 hover:shadow-button-hover disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none active:scale-[0.98]"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !answeredForCurrent}
              className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98]"
            >
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
              className={`min-w-[2.25rem] rounded-xl py-2 px-2.5 text-xs font-semibold transition-all duration-200 ${
                i + 1 === idx
                  ? "bg-indigo-600 text-white shadow-button-indigo scale-105"
                  : done
                    ? "bg-indigo-100 text-indigo-800 border border-indigo-200/80"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
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
