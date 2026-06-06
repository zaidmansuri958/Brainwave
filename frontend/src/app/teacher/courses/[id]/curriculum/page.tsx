"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, BookOpen, Plus, Trash2 } from "lucide-react";
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

  const addChapter = useMutation({
    mutationFn: (title: string) => curriculumApi.createChapter(id, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Chapter added" });
    },
    onError: (e) => toast({ title: "Couldn't add chapter", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const deleteChapter = useMutation({
    mutationFn: (chapterId: string) => curriculumApi.deleteChapter(id, chapterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Chapter deleted" });
    },
    onError: (e) => toast({ title: "Couldn't delete chapter", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const addLesson = useMutation({
    mutationFn: ({ chapterId, title }: { chapterId: string; title: string }) =>
      curriculumApi.createLesson(id, { chapter_id: chapterId, title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Lesson added" });
    },
    onError: (e) => toast({ title: "Couldn't add lesson", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) => curriculumApi.deleteLesson(id, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Lesson deleted" });
    },
    onError: (e) => toast({ title: "Couldn't delete lesson", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const input = "w-full bg-white px-3 py-2 text-sm text-gray-900";

  if (loadingCourse) {
    return (
      <div className="bw-page min-h-screen">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6b00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bw-page min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/courses" className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-white shadow-[4px_4px_0_#111111] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#111111]">
            <ArrowLeft className="h-6 w-6 text-black" strokeWidth={3} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase text-gray-900">Curriculum & quizzes</h1>
            <p className="text-gray-500 text-sm">{course?.title}</p>
          </div>
        </div>

        <CourseManageNav courseId={id} />

        {/* Chapters & lessons */}
        <section className="space-y-8 mb-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-slate-950 flex items-center gap-3 border-b-4 border-black pb-2">
              <BookOpen className="h-6 w-6 text-black" strokeWidth={3} /> Chapters & Lessons
            </h2>
            <AddChapterButton
              onAdd={(title) => addChapter.mutate(title)}
              disabled={addChapter.isPending}
            />
          </div>
          {(course?.chapters || []).map((ch: any, ci: number) => (
            <div key={ch.id} className="rounded-[32px] border-4 border-black bg-[#fff4d6] p-6 sm:p-8 shadow-[8px_8px_0_#111111] transition-shadow hover:shadow-[12px_12px_0_#111111]">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end mb-6">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-800">Chapter {ci + 1} Title</label>
                  <ChapterTitleInput
                    initial={ch.title}
                    onSave={(title) => updateChapter.mutate({ chapterId: ch.id, data: { title } })}
                    disabled={updateChapter.isPending}
                    inputClass="w-full rounded-[16px] border-4 border-black bg-white px-5 py-3 text-base font-bold text-slate-900 shadow-[4px_4px_0_#111111] outline-none focus:shadow-[6px_6px_0_#ff6b00]"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[16px] border-4 border-black bg-white shadow-[4px_4px_0_#111111]">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-sm border-4 border-black ${ch.is_free_preview ? "bg-[#ff6b00]" : "bg-white"}`}>
                    {ch.is_free_preview && <div className="h-2 w-2 bg-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    defaultChecked={ch.is_free_preview}
                    onChange={(e) =>
                      updateChapter.mutate({ chapterId: ch.id, data: { is_free_preview: e.target.checked } })
                    }
                  />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800">Free preview</span>
                </label>
                <button
                  type="button"
                  onClick={() => { if (confirm("Delete this chapter and all its lessons?")) deleteChapter.mutate(ch.id); }}
                  disabled={deleteChapter.isPending}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-white shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:bg-red-100 hover:shadow-[6px_6px_0_#111111] disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5 text-black" strokeWidth={3} />
                </button>
              </div>
              <ul className="space-y-4 border-t-4 border-black pt-6">
                {(ch.lessons || []).map((les: any) => (
                  <li key={les.id} className="flex flex-col sm:flex-row gap-4 sm:items-center rounded-[20px] border-4 border-black bg-white p-4 shadow-[4px_4px_0_#111111]">
                    <div className="flex-1">
                      <LessonTitleInput
                        initial={les.title}
                        onSave={(title) => updateLesson.mutate({ lessonId: les.id, data: { title } })}
                        disabled={updateLesson.isPending}
                        inputClass="w-full rounded-[16px] border-4 border-black bg-[#f4f4f5] px-4 py-2 text-sm font-bold text-slate-900 shadow-[2px_2px_0_#111111] outline-none focus:bg-white focus:shadow-[4px_4px_0_#ff6b00]"
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-[12px] border-4 border-black bg-[#f4f4f5] shadow-[2px_2px_0_#111111] whitespace-nowrap">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-sm border-4 border-black ${les.is_published ? "bg-[#7dde92]" : "bg-white"}`}>
                        {les.is_published && <div className="h-2 w-2 bg-black" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        defaultChecked={les.is_published}
                        onChange={(e) =>
                          updateLesson.mutate({ lessonId: les.id, data: { is_published: e.target.checked } })
                        }
                      />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-800">Published</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { if (confirm("Delete this lesson?")) deleteLesson.mutate(les.id); }}
                      disabled={deleteLesson.isPending}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#111111] transition-all hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 text-black" strokeWidth={3} />
                    </button>
                  </li>
                ))}
                <li>
                  <AddLessonButton
                    onAdd={(title) => addLesson.mutate({ chapterId: ch.id, title })}
                    disabled={addLesson.isPending}
                  />
                </li>
              </ul>
            </div>
          ))}
        </section>

        {/* Quizzes */}
        <section className="space-y-8 pb-20">
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-slate-950 border-b-4 border-black pb-2 inline-block">Quizzes</h2>
          {loadingQuizzes ? (
            <Loader2 className="h-8 w-8 animate-spin text-black" strokeWidth={3} />
          ) : quizzes.length === 0 ? (
            <div className="rounded-[32px] border-4 border-black border-dashed bg-white px-6 py-16 text-center shadow-[4px_4px_0_#111111]">
              <p className="font-display text-xl font-black uppercase tracking-tight text-slate-900">No quizzes yet</p>
              <p className="mt-2 text-sm font-bold text-slate-500">Quizzes are auto-created during AI processing. You can also add them manually below.</p>
            </div>
          ) : (
            quizzes.map((qz: any) => (
              <QuizEditor
                key={qz.id}
                quiz={qz}
                inputClass="w-full rounded-[16px] border-4 border-black bg-white px-5 py-3 text-base font-bold text-slate-900 shadow-[4px_4px_0_#111111] outline-none focus:shadow-[6px_6px_0_#ff6b00]"
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

function AddChapterButton({ onAdd, disabled }: { onAdd: (title: string) => void; disabled: boolean }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-2 rounded-full border-4 border-black bg-[#ffe500] px-5 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#111111]"
      >
        <Plus className="h-5 w-5" strokeWidth={3} /> Add Chapter
      </button>
    );
  }
  return (
    <div className="flex gap-3 items-center">
      <input
        autoFocus
        className="rounded-[16px] border-4 border-black bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-[4px_4px_0_#111111] outline-none focus:shadow-[6px_6px_0_#ff6b00]"
        placeholder="Chapter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) { onAdd(title.trim()); setTitle(""); setShow(false); } }}
      />
      <button
        type="button"
        disabled={disabled || !title.trim()}
        onClick={() => { onAdd(title.trim()); setTitle(""); setShow(false); }}
        className="rounded-full border-4 border-black bg-[#ffe500] px-4 py-2 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={() => setShow(false)} className="rounded-full border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111]">
        Cancel
      </button>
    </div>
  );
}

function AddLessonButton({ onAdd, disabled }: { onAdd: (title: string) => void; disabled: boolean }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-2 rounded-[12px] border-4 border-black border-dashed bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-[2px_2px_0_#111111] transition-all hover:bg-[#f4f4f5]"
      >
        <Plus className="h-4 w-4" strokeWidth={3} /> Add Lesson
      </button>
    );
  }
  return (
    <div className="flex gap-3 items-center mt-2">
      <input
        autoFocus
        className="flex-1 rounded-[12px] border-4 border-black bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-[2px_2px_0_#111111] outline-none focus:shadow-[4px_4px_0_#ff6b00]"
        placeholder="Lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) { onAdd(title.trim()); setTitle(""); setShow(false); } }}
      />
      <button
        type="button"
        disabled={disabled || !title.trim()}
        onClick={() => { onAdd(title.trim()); setTitle(""); setShow(false); }}
        className="rounded-full border-4 border-black bg-[#8ed8ff] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_#111111] disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={() => setShow(false)} className="rounded-full border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_#111111]">
        Cancel
      </button>
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
    <div className="flex gap-3 mt-1">
      <input className={inputClass} value={v} onChange={(e) => setV(e.target.value)} />
      <button
        type="button"
        disabled={disabled || v === initial}
        onClick={() => onSave(v)}
        className="inline-flex items-center justify-center rounded-[16px] border-4 border-black bg-[#ffe500] px-6 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#111111] disabled:opacity-50"
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
    <div className="flex gap-3">
      <input className={inputClass} value={v} onChange={(e) => setV(e.target.value)} />
      <button
        type="button"
        disabled={disabled || v === initial}
        onClick={() => onSave(v)}
        className="inline-flex items-center justify-center rounded-[12px] border-4 border-black bg-[#8ed8ff] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#111111] disabled:opacity-50"
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
    <div className="rounded-[32px] border-4 border-black bg-white p-6 sm:p-10 shadow-[8px_8px_0_#111111] space-y-8">
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-800">Quiz Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-800">Pass %</label>
          <input
            type="number"
            className={inputClass}
            value={pass}
            min={0}
            max={100}
            onChange={(e) => setPass(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-800">Max Attempts</label>
          <input
            type="number"
            className={inputClass}
            value={attempts}
            min={1}
            onChange={(e) => setAttempts(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-6 border-t-4 border-black pt-8">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-[24px] border-4 border-black bg-[#f4f4f5] p-6 shadow-[4px_4px_0_#111111] space-y-4">
            <label className="mb-2 inline-block rounded-full border-2 border-black bg-[#ff6b00] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[2px_2px_0_#111111]">Question {qi + 1}</label>
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
            <div className="grid sm:grid-cols-2 gap-4">
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
              <label className="mb-2 block text-sm font-black uppercase tracking-widest text-slate-800">Correct answer (match option text)</label>
              <input
                className={inputClass}
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
        className="inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-[#7dde92] px-8 py-4 text-base font-black uppercase tracking-widest text-black shadow-[6px_6px_0_#111111] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#111111] disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} /> : <Save className="h-6 w-6" strokeWidth={3} />}
        Save Quiz
      </button>
    </div>
  );
}
