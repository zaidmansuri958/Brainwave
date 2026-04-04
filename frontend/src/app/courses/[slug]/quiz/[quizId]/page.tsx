"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { quizApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { CheckCircle, XCircle, Trophy, Loader2 } from "lucide-react";
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
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
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
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className={`rounded-3xl p-8 text-center border ${passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className={`inline-flex p-4 rounded-full mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}>
              {passed ? <Trophy className="h-10 w-10 text-amber-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {passed ? "Congratulations!" : "Better luck next time!"}
            </h2>
            <p className="text-gray-500 mb-6">
              {passed ? "You passed the quiz." : "You did not pass this time. Review the material and try again."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{typeof pct === "number" ? pct.toFixed(1) : pct}%</p>
                <p className="text-xs text-gray-500 mt-1">Score</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{questions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Questions</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href={`/learn/${params.slug}`}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm"
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
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
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
    <div className="min-h-screen bg-[#FAFAF9]">
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
