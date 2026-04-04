import type { QuizData } from "react-quiz-kit";

/** Maps Brainwave API quiz payload to react-quiz-kit shape for UI tooling. Server always grades authoritatively. */
export function apiQuizToReactQuizKitShape(
  title: string,
  questions: Array<{
    id: string;
    question_text: string;
    question_type?: string;
    options?: Array<{ id?: string; text?: string } | string>;
  }>
): QuizData {
  return {
    title,
    questions: questions.map((q) => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type === "true_false" ? "true-false" : "multiple-choice",
      options: (q.options || []).map((o) => (typeof o === "string" ? o : o.text || "")),
      correctAnswer: "a",
    })),
  };
}
