"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { quizApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { XCircle, Trophy, Loader2 } from "lucide-react";
import { CourseQuizRunner } from "@/components/quiz/CourseQuizRunner";

export default function QuizPage({ params }: { params: { slug: string; quizId: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [attemptKey, setAttemptKey] = useState(0);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", params.quizId],
    queryFn: () => quizApi.get(params.quizId).then((r) => r.data),
  });

  const submitQuiz = useMutation({
    mutationFn: (payload: { answers: Record<string, string> }) => quizApi.submit(params.quizId, payload),
    onSuccess: (data) => {
      setResult(data.data);
      setSubmitted(true);
    },
  });

  if (isLoading) {
    return (
      <div className="bw-page min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6b00]" />
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];

  if (submitted && result) {
    const passed = result.passed;
    const pct = result.score_percent ?? result.percentage ?? 0;

    return (
      <div className="bw-page min-h-screen">
        <Navbar />
        <div className="bw-shell max-w-2xl px-4 py-12">
          <div className={`rounded-[30px] border-2 p-8 text-center shadow-[6px_6px_0_#111111] ${passed ? "border-black bg-[#dff8df]" : "border-black bg-[#ffd6d6]"}`}>
            <div className={`neo-icon-badge mx-auto mb-4 h-20 w-20 ${passed ? "bg-white text-[#246b31]" : "bg-white text-[#b93131]"}`}>
              {passed ? <Trophy className="h-10 w-10 text-amber-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold uppercase text-gray-900">
              {passed ? "Congratulations!" : "Better luck next time!"}
            </h2>
            <p className="mb-6 text-gray-600">
              {passed ? "You passed the quiz." : "You did not pass this time. Review the material and try again."}
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="neo-panel bg-white p-4">
                <p className="font-display text-3xl font-bold uppercase text-gray-900">{typeof pct === "number" ? pct.toFixed(1) : pct}%</p>
                <p className="mt-1 text-xs font-extrabold uppercase text-gray-500">Score</p>
              </div>
              <div className="neo-panel bg-white p-4">
                <p className="font-display text-3xl font-bold uppercase text-gray-900">{questions.length}</p>
                <p className="mt-1 text-xs font-extrabold uppercase text-gray-500">Questions</p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Link
                href={`/learn/${params.slug}`}
                className="neo-primary-btn px-6 py-3 text-sm"
              >
                Back to Course
              </Link>
              {!passed && (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setResult(null);
                    setAttemptKey((k) => k + 1);
                  }}
                  className="neo-secondary-btn px-6 py-3 text-sm"
                >
                  Retry Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bw-page min-h-screen">
      <Navbar />
      <CourseQuizRunner
        key={attemptKey}
        slug={params.slug}
        quiz={quiz}
        submitting={submitQuiz.isPending}
        onSubmitServer={(answers) => submitQuiz.mutate({ answers })}
      />
    </div>
  );
}
