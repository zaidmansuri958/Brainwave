"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Brain, GripVertical, Check, X as XIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { curriculumApi, teacherApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { useMemo, useState } from "react";

// ── types ──────────────────────────────────────────────────────────────────────
type Q = {
  id?: string; question_text: string; question_type: string;
  options: unknown; correct_answer: string; explanation?: string; order_index: number;
};
function normOptions(o: unknown): string[] {
  if (Array.isArray(o)) return o.map(String);
  if (o && typeof o === "object") return Object.values(o as Record<string, unknown>).map(String);
  return ["", "", "", ""];
}

// ── shared input styles ────────────────────────────────────────────────────────
const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

// ── sub-components ─────────────────────────────────────────────────────────────
function InlineEdit({ initial, onSave, disabled, size = "base" }: {
  initial: string; onSave: (v: string) => void; disabled: boolean; size?: "sm" | "base";
}) {
  const [v, setV] = useState(initial);
  const changed = v !== initial;
  return (
    <div className="flex gap-2">
      <input value={v} onChange={e => setV(e.target.value)}
        className={`flex-1 ${inputCls} ${size === "sm" ? "text-xs py-2" : ""}`} />
      {changed && (
        <button type="button" onClick={() => onSave(v)} disabled={disabled}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 transition-colors disabled:opacity-50 shrink-0">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
      )}
    </div>
  );
}

function AddInline({ placeholder, onAdd, disabled, variant = "primary" }: {
  placeholder: string; onAdd: (title: string) => void; disabled: boolean; variant?: "primary" | "secondary";
}) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  if (!show) {
    return (
      <button type="button" onClick={() => setShow(true)} disabled={disabled}
        className={`inline-flex items-center gap-1.5 rounded-xl text-xs font-bold px-3 py-2 transition-colors disabled:opacity-50 ${
          variant === "primary"
            ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200"
            : "border border-dashed border-gray-300 bg-white hover:border-violet-300 hover:bg-violet-50/50 text-gray-500 hover:text-violet-600 w-full"
        }`}>
        <Plus className="h-3.5 w-3.5" />
        {variant === "primary" ? "Add Chapter" : "Add Lesson"}
      </button>
    );
  }
  return (
    <div className="flex gap-2">
      <input autoFocus value={val} onChange={e => setVal(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); setShow(false); } if (e.key === "Escape") setShow(false); }}
        className={inputCls + " flex-1 text-xs py-2"} />
      <button type="button" disabled={disabled || !val.trim()} onClick={() => { onAdd(val.trim()); setVal(""); setShow(false); }}
        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 disabled:opacity-50 shrink-0">Add</button>
      <button type="button" onClick={() => setShow(false)}
        className="rounded-xl border border-gray-200 text-gray-500 text-xs font-bold px-3 py-2 hover:bg-gray-50 shrink-0">Cancel</button>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </label>
  );
}

// ── QuizEditor ─────────────────────────────────────────────────────────────────
function QuizEditor({ quiz, saving, onSave }: {
  quiz: { id: string; title: string; pass_percent: number; max_attempts: number; questions: Q[] };
  saving: boolean; onSave: (data: Record<string, unknown>) => void;
}) {
  const [open,      setOpen]      = useState(false);
  const [title,     setTitle]     = useState(quiz.title);
  const [pass,      setPass]      = useState(quiz.pass_percent ?? 60);
  const [attempts,  setAttempts]  = useState(quiz.max_attempts ?? 3);
  const [questions, setQuestions] = useState<Q[]>(() =>
    (quiz.questions || []).map((q, i) => ({ ...q, order_index: q.order_index ?? i, options: normOptions(q.options) }))
  );

  const payload = useMemo(() => ({
    title, pass_percent: pass, max_attempts: attempts,
    questions: questions.map((q, i) => ({
      question_text: q.question_text, question_type: q.question_type || "mcq",
      options: Array.isArray(q.options) ? q.options : normOptions(q.options),
      correct_answer: q.correct_answer || "", explanation: q.explanation || "", order_index: i,
    })),
  }), [title, pass, attempts, questions]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 shrink-0">
          <Brain className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-400">{questions.length} questions · Pass: {pass}%</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-5">
          {/* Quiz settings */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quiz Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls + " text-xs py-2"} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pass % </label>
              <input type="number" value={pass} min={0} max={100} onChange={e => setPass(Number(e.target.value))} className={inputCls + " text-xs py-2"} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Attempts</label>
              <input type="number" value={attempts} min={1} onChange={e => setAttempts(Number(e.target.value))} className={inputCls + " text-xs py-2"} />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-gray-200 text-center">
                <Brain className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400 font-medium">No questions yet — add your first one below</p>
              </div>
            )}
            {questions.map((q, qi) => (
              <div key={qi} className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
                {/* Question header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                      Q{qi + 1}
                    </span>
                    <span className="text-[11px] text-gray-400 capitalize">{q.question_type || "mcq"}</span>
                  </div>
                  {/* Delete question */}
                  <button type="button"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Remove this question">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <textarea rows={2} value={q.question_text} placeholder="Enter your question here…"
                  className={inputCls + " resize-none text-xs py-2"}
                  onChange={e => { const n = [...questions]; n[qi] = { ...n[qi], question_text: e.target.value }; setQuestions(n); }} />

                {/* Options grid */}
                <div className="grid grid-cols-2 gap-2">
                  {(Array.isArray(q.options) ? q.options : normOptions(q.options)).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-600 shrink-0">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <input placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={String(opt ?? "")}
                        className={inputCls + " text-xs py-2 flex-1"}
                        onChange={e => {
                          const n = [...questions];
                          const opts = [...(Array.isArray(n[qi].options) ? (n[qi].options as string[]) : normOptions(n[qi].options))];
                          opts[oi] = e.target.value;
                          n[qi] = { ...n[qi], options: opts };
                          setQuestions(n);
                        }} />
                    </div>
                  ))}
                </div>

                {/* Correct answer */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    ✓ Correct answer <span className="font-normal text-gray-400">(must match option text exactly)</span>
                  </label>
                  <input value={q.correct_answer || ""} placeholder="e.g. Concept A"
                    className={inputCls + " text-xs py-2 border-green-200 focus:border-green-400 focus:ring-green-100"}
                    onChange={e => { const n = [...questions]; n[qi] = { ...n[qi], correct_answer: e.target.value }; setQuestions(n); }} />
                </div>
              </div>
            ))}
          </div>

          {/* Add Question button */}
          <button type="button"
            onClick={() => setQuestions(prev => [...prev, {
              question_text: "", question_type: "mcq",
              options: ["", "", "", ""], correct_answer: "", explanation: "",
              order_index: prev.length,
            }])}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/50 hover:bg-violet-50 text-violet-600 text-xs font-bold py-3 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Question
          </button>

          {/* Save quiz */}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" disabled={saving} onClick={() => onSave(payload)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-5 py-2.5 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Quiz
            </button>
            <span className="text-xs text-gray-400">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function CurriculumPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ["teacher-course", id],
    queryFn:  () => teacherApi.getCourse(id).then(r => r.data),
  });

  const { data: quizData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["curriculum-quizzes", id],
    queryFn:  () => curriculumApi.listQuizzes(id).then(r => r.data),
  });

  const quizzes = quizData?.quizzes || [];

  const mut = (fn: any, successMsg: string, keys: string[][]) => useMutation({
    mutationFn: fn,
    onSuccess: () => { keys.forEach(k => qc.invalidateQueries({ queryKey: k })); toast({ title: successMsg }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateChapter = useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: Record<string, unknown> }) => curriculumApi.updateChapter(id, chapterId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-course", id] }); toast({ title: "Chapter saved" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateLesson = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: Record<string, unknown> }) => curriculumApi.updateLesson(id, lessonId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-course", id] }); toast({ title: "Lesson saved" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const updateQuiz = useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: Record<string, unknown> }) => curriculumApi.updateQuiz(id, quizId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["curriculum-quizzes", id] }); toast({ title: "Quiz saved" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addChapter = useMutation({
    mutationFn: (title: string) => curriculumApi.createChapter(id, { title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-course", id] }); toast({ title: "Chapter added" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deleteChapter = useMutation({
    mutationFn: (chapterId: string) => curriculumApi.deleteChapter(id, chapterId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-course", id] }); toast({ title: "Chapter deleted" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addLesson = useMutation({
    mutationFn: ({ chapterId, title }: { chapterId: string; title: string }) => curriculumApi.createLesson(id, { chapter_id: chapterId, title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-course", id] }); toast({ title: "Lesson added" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) => curriculumApi.deleteLesson(id, lessonId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-course", id] }); toast({ title: "Lesson deleted" }); },
    onError:   e => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Curriculum" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "My Courses", href: "/teacher/courses" }, { label: "Curriculum" }]}>
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
      </DashboardLayout>
    );
  }

  const chapters = course?.chapters || [];
  const totalLessons = chapters.reduce((s: number, c: any) => s + (c.lessons?.length || 0), 0);

  return (
    <DashboardLayout
      title={course?.title || "Curriculum"}
      subtitle="Manage chapters, lessons and quizzes"
      breadcrumbs={[
        { label: "Teacher",    href: "/teacher/dashboard" },
        { label: "My Courses", href: "/teacher/courses"   },
        { label: "Curriculum"                              },
      ]}
    >
      <div className="max-w-3xl py-6">
        <CourseManageNav courseId={id} />

        {/* Chapters section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Chapters & Lessons</h2>
              <p className="text-xs text-gray-400">{chapters.length} chapters · {totalLessons} lessons</p>
            </div>
            <AddInline placeholder="Chapter title" onAdd={t => addChapter.mutate(t)} disabled={addChapter.isPending} />
          </div>

          {chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <BookOpen className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">No chapters yet</p>
              <p className="text-xs text-gray-400">Add your first chapter to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((ch: any, ci: number) => (
                <div key={ch.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Chapter header */}
                  <div className="flex items-center gap-3 px-5 py-4 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 shrink-0">
                      <span className="text-xs font-bold text-violet-600">{ci + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <InlineEdit initial={ch.title}
                        onSave={title => updateChapter.mutate({ chapterId: ch.id, data: { title } })}
                        disabled={updateChapter.isPending} />
                    </div>
                    <Toggle checked={ch.is_free_preview}
                      onChange={v => updateChapter.mutate({ chapterId: ch.id, data: { is_free_preview: v } })}
                      label="Free preview" />
                    <button type="button" onClick={() => { if (confirm("Delete chapter and all its lessons?")) deleteChapter.mutate(ch.id); }}
                      disabled={deleteChapter.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors ml-1 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Lessons */}
                  <div className="divide-y divide-gray-50">
                    {(ch.lessons || []).map((les: any) => (
                      <div key={les.id} className="flex items-center gap-3 px-5 py-3 hover:bg-violet-50/20 transition-colors">
                        <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <InlineEdit initial={les.title}
                            onSave={title => updateLesson.mutate({ lessonId: les.id, data: { title } })}
                            disabled={updateLesson.isPending} size="sm" />
                        </div>
                        <span className="text-[10px] text-gray-400 capitalize shrink-0">{les.lesson_type || "video"}</span>
                        <Toggle checked={les.is_published}
                          onChange={v => updateLesson.mutate({ lessonId: les.id, data: { is_published: v } })}
                          label={les.is_published ? "Published" : "Draft"} />
                        <button type="button" onClick={() => { if (confirm("Delete this lesson?")) deleteLesson.mutate(les.id); }}
                          disabled={deleteLesson.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="px-5 py-3">
                      <AddInline placeholder="Lesson title" variant="secondary"
                        onAdd={t => addLesson.mutate({ chapterId: ch.id, title: t })}
                        disabled={addLesson.isPending} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <Brain className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Quizzes</h2>
              <p className="text-xs text-gray-400">Auto-created during AI processing · click to expand and edit</p>
            </div>
          </div>

          {loadingQuizzes ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
              <Brain className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">No quizzes yet</p>
              <p className="text-xs text-gray-400 text-center max-w-xs">Quizzes are auto-generated during AI processing. Upload course materials to generate them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((qz: any) => (
                <QuizEditor key={qz.id} quiz={qz}
                  saving={updateQuiz.isPending}
                  onSave={payload => updateQuiz.mutate({ quizId: qz.id, data: payload })} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
