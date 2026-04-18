"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { curriculumApi, teacherApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { useMemo, useState } from "react";

type Q = {
  id?: string;
  question_text: string;
  question_type: string;
  options: unknown;
  correct_answer: string;
  explanation?: string;
  order_index: number;
};

function normOptions(o: unknown): string[] {
  if (Array.isArray(o)) return o.map(String);
  if (o && typeof o === "object") return Object.values(o as Record<string, unknown>).map(String);
  return ["", "", "", ""];
}

export default function CurriculumPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["teacher-course", id],
    queryFn: () => teacherApi.getCourse(id).then((r) => r.data),
  });

  const { data: quizData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["curriculum-quizzes", id],
    queryFn: () => curriculumApi.listQuizzes(id).then((r) => r.data),
  });

  const quizzes = quizData?.quizzes || [];

  const updateChapter = useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: Record<string, unknown> }) =>
      curriculumApi.updateChapter(id, chapterId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Chapter saved" });
    },
    onError: (e) =>
      toast({
        title: "Couldn't save chapter",
        description: getApiErrorMessage(e),
        variant: "destructive",
      }),
  });

  const updateLesson = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: Record<string, unknown> }) =>
      curriculumApi.updateLesson(id, lessonId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Lesson saved" });
    },
    onError: (e) =>
      toast({
        title: "Couldn't save lesson",
        description: getApiErrorMessage(e),
        variant: "destructive",
      }),
  });

  const updateQuiz = useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: Record<string, unknown> }) =>
      curriculumApi.updateQuiz(id, quizId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curriculum-quizzes", id] });
      toast({ title: "Quiz saved" });
    },
    onError: (e) =>
      toast({
        title: "Couldn't save quiz",
        description: getApiErrorMessage(e),
        variant: "destructive",
      }),
  });

  const input =
    "w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200";

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/courses" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">Curriculum & quizzes</h1>
            <p className="text-gray-500 text-sm">{course?.title}</p>
          </div>
        </div>

        <CourseManageNav courseId={id} />

        {/* Chapters & lessons */}
        <section className="space-y-6 mb-10">
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" /> Chapters & lessons
          </h2>
          {(course?.chapters || []).map((ch: any, ci: number) => (
            <div key={ch.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500">Chapter {ci + 1} title</label>
                  <ChapterTitleInput
                    initial={ch.title}
                    onSave={(title) => updateChapter.mutate({ chapterId: ch.id, data: { title } })}
                    disabled={updateChapter.isPending}
                    inputClass={input}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    defaultChecked={ch.is_free_preview}
                    onChange={(e) =>
                      updateChapter.mutate({ chapterId: ch.id, data: { is_free_preview: e.target.checked } })
                    }
                  />
                  Free preview
                </label>
              </div>
              <ul className="space-y-3 border-t border-gray-100 pt-4">
                {(ch.lessons || []).map((les: any) => (
                  <li key={les.id} className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="flex-1">
                      <LessonTitleInput
                        initial={les.title}
                        onSave={(title) => updateLesson.mutate({ lessonId: les.id, data: { title } })}
                        disabled={updateLesson.isPending}
                        inputClass={input}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        defaultChecked={les.is_published}
                        onChange={(e) =>
                          updateLesson.mutate({ lessonId: les.id, data: { is_published: e.target.checked } })
                        }
                      />
                      Published
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Quizzes */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-lg text-gray-900">Quizzes</h2>
          {loadingQuizzes ? (
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          ) : quizzes.length === 0 ? (
            <p className="text-gray-500 text-sm">No quizzes yet. They are created during AI processing or can be added via the API.</p>
          ) : (
            quizzes.map((qz: any) => (
              <QuizEditor
                key={qz.id}
                quiz={qz}
                inputClass={input}
                saving={updateQuiz.isPending}
                onSave={(payload) => updateQuiz.mutate({ quizId: qz.id, data: payload })}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function ChapterTitleInput({
  initial,
  onSave,
  disabled,
  inputClass,
}: {
  initial: string;
  onSave: (v: string) => void;
  disabled: boolean;
  inputClass: string;
}) {
  const [v, setV] = useState(initial);
  return (
    <div className="flex gap-2 mt-1">
      <input className={inputClass} value={v} onChange={(e) => setV(e.target.value)} />
      <button
        type="button"
        disabled={disabled || v === initial}
        onClick={() => onSave(v)}
        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-40"
      >
        Save
      </button>
    </div>
  );
}

function LessonTitleInput({
  initial,
  onSave,
  disabled,
  inputClass,
}: {
  initial: string;
  onSave: (v: string) => void;
  disabled: boolean;
  inputClass: string;
}) {
  const [v, setV] = useState(initial);
  return (
    <div className="flex gap-2">
      <input className={inputClass} value={v} onChange={(e) => setV(e.target.value)} />
      <button
        type="button"
        disabled={disabled || v === initial}
        onClick={() => onSave(v)}
        className="px-3 py-2 rounded-xl bg-gray-800 text-white text-xs font-semibold disabled:opacity-40"
      >
        Save
      </button>
    </div>
  );
}

function QuizEditor({
  quiz,
  inputClass,
  saving,
  onSave,
}: {
  quiz: { id: string; title: string; pass_percent: number; max_attempts: number; questions: Q[] };
  inputClass: string;
  saving: boolean;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [title, setTitle] = useState(quiz.title);
  const [pass, setPass] = useState(quiz.pass_percent ?? 60);
  const [attempts, setAttempts] = useState(quiz.max_attempts ?? 3);
  const [questions, setQuestions] = useState<Q[]>(() =>
    (quiz.questions || []).map((q, i) => ({
      ...q,
      order_index: q.order_index ?? i,
      options: normOptions(q.options),
    }))
  );

  const payload = useMemo(
    () => ({
      title,
      pass_percent: pass,
      max_attempts: attempts,
      questions: questions.map((q, i) => ({
        question_text: q.question_text,
        question_type: q.question_type || "mcq",
        options: Array.isArray(q.options) ? q.options : normOptions(q.options),
        correct_answer: q.correct_answer || "",
        explanation: q.explanation || "",
        order_index: q.order_index ?? i,
      })),
    }),
    [title, pass, attempts, questions]
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500">Quiz title</label>
          <input className={`${inputClass} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Pass %</label>
          <input
            type="number"
            className={`${inputClass} mt-1`}
            value={pass}
            min={0}
            max={100}
            onChange={(e) => setPass(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Max attempts</label>
          <input
            type="number"
            className={`${inputClass} mt-1`}
            value={attempts}
            min={1}
            onChange={(e) => setAttempts(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-4">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl bg-gray-50 p-4 space-y-2">
            <label className="text-xs font-semibold text-gray-500">Question {qi + 1}</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={q.question_text}
              onChange={(e) => {
                const n = [...questions];
                n[qi] = { ...n[qi], question_text: e.target.value };
                setQuestions(n);
              }}
            />
            <div className="grid sm:grid-cols-2 gap-2">
              {(Array.isArray(q.options) ? q.options : normOptions(q.options)).map((opt, oi) => (
                <input
                  key={oi}
                  className={inputClass}
                  placeholder={`Option ${oi + 1}`}
                  value={String(opt ?? "")}
                  onChange={(e) => {
                    const n = [...questions];
                    const opts = [...(Array.isArray(n[qi].options) ? (n[qi].options as string[]) : normOptions(n[qi].options))];
                    opts[oi] = e.target.value;
                    n[qi] = { ...n[qi], options: opts };
                    setQuestions(n);
                  }}
                />
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Correct answer (match option text)</label>
              <input
                className={`${inputClass} mt-1`}
                value={q.correct_answer || ""}
                onChange={(e) => {
                  const n = [...questions];
                  n[qi] = { ...n[qi], correct_answer: e.target.value };
                  setQuestions(n);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => onSave(payload)}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save quiz
      </button>
    </div>
  );
}
