"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { quizApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Trophy, ArrowLeft, Loader2 } from "lucide-react";

export default function QuizPage({ params }: { params: { slug: string; quizId: string } }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", params.quizId],
    queryFn: () => quizApi.get(params.quizId).then((r) => r.data),
  });

  const submitQuiz = useMutation({
    mutationFn: (data: { answers: Record<string, number> }) =>
      quizApi.submit(params.quizId, data),
    onSuccess: (data) => {
      setResult(data.data);
      setSubmitted(true);
    },
  });

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < (quiz?.questions?.length || 0)) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) return;
    }
    submitQuiz.mutate({ answers });
  };

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
  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  // Results View
  if (submitted && result) {
    const passed = result.passed;
    const score = result.score;
    const percentage = result.percentage;

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
              {passed ? "You passed the quiz." : "You didn't pass this time. Review the material and try again."}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{score}</p>
                <p className="text-xs text-gray-500 mt-1">Score</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
                <p className="text-xs text-gray-500 mt-1">Percentage</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{result.correct_count}/{questions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Correct</p>
              </div>
            </div>

            {/* Question Review */}
            {result.question_results && (
              <div className="text-left space-y-4 mb-8">
                <h3 className="text-gray-900 font-semibold text-lg">Review</h3>
                {result.question_results.map((qr: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border ${qr.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {qr.correct ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      <p className="text-sm text-gray-900 font-medium">{qr.question}</p>
                    </div>
                    {!qr.correct && (
                      <div className="ml-6 text-sm">
                        <p className="text-red-600">Your answer: {qr.selected_answer}</p>
                        <p className="text-green-700">Correct: {qr.correct_answer}</p>
                        {qr.explanation && (
                          <p className="text-gray-500 mt-1 text-xs">{qr.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link
                href={`/learn/${params.slug}`}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm"
              >
                Back to Course
              </Link>
              {!passed && (
                <button
                  onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); setCurrentQ(0); }}
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/learn/${params.slug}`} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold text-lg">{quiz.title}</h1>
            <p className="text-gray-500 text-sm">{questions.length} questions · {answeredCount} answered</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i === currentQ ? "bg-indigo-500" :
                answers[questions[i]?.id] !== undefined ? "bg-indigo-300" :
                "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span>Question {currentQ + 1} of {questions.length}</span>
            </div>

            <h2 className="text-gray-900 font-semibold text-lg mb-6">{currentQuestion.question_text}</h2>

            <div className="space-y-3">
              {(currentQuestion.options || []).map((option: string, i: number) => {
                const isSelected = answers[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(currentQuestion.id, i)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0 ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ((p) => p - 1)}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ((p) => p + 1)}
                  className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitQuiz.isPending}
                  className="ml-auto bg-green-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* Question Navigator */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                i === currentQ ? "bg-indigo-600 text-white" :
                answers[questions[i]?.id] !== undefined ? "bg-indigo-100 text-indigo-600" :
                "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
