"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { quizApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { CheckCircle, XCircle, Trophy, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  if (submitted && result) {
    const passed = result.passed;

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
          <div className={`glass-card rounded-3xl p-8 text-center ${passed ? "border-emerald-500/20" : "border-red-500/20"}`}>
            <div className={`inline-flex h-16 w-16 rounded-2xl items-center justify-center mb-4 ${
              passed ? "bg-emerald-500/10" : "bg-red-500/10"
            }`}>
              {passed ? <Trophy className="h-8 w-8 text-amber-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {passed ? "Congratulations!" : "Better luck next time!"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {passed ? "You passed the quiz." : "Review the material and try again."}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Score", value: result.score },
                { label: "Percentage", value: `${result.percentage}%` },
                { label: "Correct", value: `${result.correct_count}/${questions.length}` },
              ].map((item) => (
                <div key={item.label} className="glass rounded-2xl p-4">
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {result.question_results && (
              <div className="text-left space-y-3 mb-8">
                <h3 className="text-foreground font-bold text-lg">Review</h3>
                {result.question_results.map((qr: any, i: number) => (
                  <div key={i} className={`glass p-4 rounded-2xl ${qr.correct ? "border-emerald-500/20" : "border-red-500/20"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {qr.correct ? <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      <p className="text-sm text-foreground font-medium">{qr.question}</p>
                    </div>
                    {!qr.correct && (
                      <div className="ml-6 text-sm space-y-1">
                        <p className="text-red-500">Your answer: {qr.selected_answer}</p>
                        <p className="text-emerald-500">Correct: {qr.correct_answer}</p>
                        {qr.explanation && (
                          <p className="text-muted-foreground text-xs mt-1">{qr.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link href={`/learn/${params.slug}`}>
                <Button variant="gradient" className="rounded-2xl">Back to Course</Button>
              </Link>
              {!passed && (
                <Button
                  variant="glass"
                  className="rounded-2xl"
                  onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); setCurrentQ(0); }}
                >
                  Retry Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/learn/${params.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-foreground font-bold text-lg">{quiz.title}</h1>
            <p className="text-muted-foreground text-sm">{questions.length} questions &middot; {answeredCount} answered</p>
          </div>
        </div>

        <div className="flex gap-1.5 mb-6">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i === currentQ ? "gradient-bg" :
                answers[questions[i]?.id] !== undefined ? "bg-primary-500/30" :
                "bg-muted"
              }`}
            />
          ))}
        </div>

        {currentQuestion && (
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <Badge variant="secondary" className="mb-4">
              Question {currentQ + 1} of {questions.length}
            </Badge>

            <h2 className="text-foreground font-bold text-lg mb-6">{currentQuestion.question_text}</h2>

            <div className="space-y-3">
              {(currentQuestion.options || []).map((option: string, i: number) => {
                const isSelected = answers[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(currentQuestion.id, i)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
                      isSelected
                        ? "border-primary-500 bg-primary-500/10 text-foreground shadow-glow"
                        : "border-border glass hover:border-primary-500/30 hover:bg-accent/30 text-muted-foreground"
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0 ${
                      isSelected ? "gradient-bg text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              {currentQ > 0 && (
                <Button variant="ghost" onClick={() => setCurrentQ((p) => p - 1)}>
                  Previous
                </Button>
              )}
              {currentQ < questions.length - 1 ? (
                <Button variant="gradient" onClick={() => setCurrentQ((p) => p + 1)} className="ml-auto gap-1.5 rounded-xl">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={handleSubmit}
                  loading={submitQuiz.isPending}
                  className="ml-auto rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-5 gap-2">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                i === currentQ ? "gradient-bg text-white shadow-glow" :
                answers[questions[i]?.id] !== undefined ? "bg-primary-500/10 text-primary-500" :
                "glass text-muted-foreground hover:bg-accent"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
