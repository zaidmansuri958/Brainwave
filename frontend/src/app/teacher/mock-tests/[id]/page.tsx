"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockTestsApi } from "@/lib/api";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Send,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";

const OPTIONS = ["A", "B", "C", "D"] as const;

const inp =
  "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300";
const smallBtn =
  "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  marks: number;
}
interface Section {
  id: string;
  title: string;
  questions: Question[];
}
interface Paper {
  id: string;
  title: string;
  time_limit_minutes: number;
  total_marks: number | null;
  marks_per_question: number;
  negative_marks: number;
  sections: Section[];
}

function QuestionForm({
  sectionId,
  marksDefault,
  orderIndex,
  onDone,
}: {
  sectionId: string;
  marksDefault: number;
  orderIndex: number;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number | null>(null);

  const addQ = useMutation({
    mutationFn: () =>
      mockTestsApi.addQuestion(sectionId, {
        question_text: text.trim(),
        question_type: "mcq",
        options: opts.filter(Boolean),
        correct_answer: correct !== null ? opts[correct] : "",
        marks: marksDefault,
        order_index: orderIndex,
      }),
    onSuccess: () => {
      toast({ title: "Question added" });
      onDone();
    },
    onError: (e) => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const canSubmit = text.trim() && opts.filter(Boolean).length >= 2 && correct !== null;

  return (
    <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-3">
      <textarea
        className={`${inp} min-h-[72px]`}
        placeholder="Question text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrect(i)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                correct === i
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              {label}
            </button>
            <input
              className={inp}
              placeholder={`Option ${label}`}
              value={opts[i]}
              onChange={(e) => {
                const next = [...opts];
                next[i] = e.target.value;
                setOpts(next);
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-violet-600 font-medium">
        Click A/B/C/D circle to mark correct answer · Marks: +{marksDefault}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canSubmit || addQ.isPending}
          onClick={() => addQ.mutate()}
          className={`${smallBtn} bg-violet-600 text-white hover:bg-violet-700`}
        >
          {addQ.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Save question
        </button>
        <button
          type="button"
          onClick={onDone}
          className={`${smallBtn} bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`}
        >
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  marksDefault,
  onRefetch,
}: {
  section: Section;
  marksDefault: number;
  onRefetch: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);

  const delQ = useMutation({
    mutationFn: (qid: string) => mockTestsApi.deleteQuestion(qid),
    onSuccess: () => { toast({ title: "Question removed" }); onRefetch(); },
    onError: (e) => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
      >
        <span>
          {section.title}
          <span className="ml-2 text-xs font-normal text-gray-500">
            {section.questions.length} question{section.questions.length !== 1 ? "s" : ""}
          </span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="bg-white px-4 pb-4 space-y-2 pt-2">
          {section.questions.length === 0 && (
            <p className="text-xs text-gray-400 py-2">No questions yet.</p>
          )}
          {section.questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 font-bold">
                {i + 1}
              </span>
              <p className="flex-1 text-sm text-gray-700 leading-snug">{q.question_text}</p>
              <span className="shrink-0 inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">
                {q.correct_answer}
              </span>
              <button
                type="button"
                onClick={() => delQ.mutate(q.id)}
                disabled={delQ.isPending}
                className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {adding ? (
            <QuestionForm
              sectionId={section.id}
              marksDefault={marksDefault}
              orderIndex={section.questions.length}
              onDone={() => { setAdding(false); onRefetch(); }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={`${smallBtn} mt-2 bg-white border border-dashed border-violet-300 text-violet-600 hover:bg-violet-50`}
            >
              <Plus className="h-3 w-3" /> Add question
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PaperCard({
  paper,
  onRefetch,
}: {
  paper: Paper;
  onRefetch: () => void;
}) {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [secTitle, setSecTitle] = useState("");

  const [eTitle, setETitle] = useState(paper.title);
  const [eMins, setEMins] = useState(paper.time_limit_minutes);
  const [eTotal, setETotal] = useState(paper.total_marks ?? "");
  const [eMarksPerQ, setEMarksPerQ] = useState(paper.marks_per_question);
  const [eNeg, setENeg] = useState(paper.negative_marks);

  const updatePaper = useMutation({
    mutationFn: () =>
      mockTestsApi.updatePaper(paper.id, {
        title: eTitle.trim(),
        time_limit_minutes: Number(eMins),
        total_marks: eTotal === "" ? null : Number(eTotal),
        marks_per_question: Number(eMarksPerQ),
        negative_marks: Number(eNeg),
      }),
    onSuccess: () => { toast({ title: "Paper updated" }); setEditOpen(false); onRefetch(); },
    onError: (e) => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const delPaper = useMutation({
    mutationFn: () => mockTestsApi.deletePaper(paper.id),
    onSuccess: () => { toast({ title: "Paper deleted" }); onRefetch(); },
    onError: (e) => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const addSection = useMutation({
    mutationFn: () => mockTestsApi.addSection(paper.id, { title: secTitle.trim(), order_index: paper.sections.length }),
    onSuccess: () => { setSecTitle(""); toast({ title: "Section added" }); onRefetch(); },
    onError: (e) => toast({ title: "Error", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const totalQs = paper.sections.reduce((s, sec) => s + sec.questions.length, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Paper header */}
      <div className="flex items-start justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div>
          <p className="font-bold text-gray-900">{paper.title}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>⏱ {paper.time_limit_minutes} min</span>
            {paper.total_marks != null && <span>📋 {paper.total_marks} marks</span>}
            <span className="text-green-600 font-semibold">+{paper.marks_per_question} correct</span>
            {paper.negative_marks > 0 && (
              <span className="text-red-500 font-semibold">−{paper.negative_marks} wrong</span>
            )}
            <span className="text-gray-400">{totalQs} Qs · {paper.sections.length} sections</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen((v) => !v)}
            className="text-gray-400 hover:text-violet-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => delPaper.mutate()}
            disabled={delPaper.isPending}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editOpen && (
        <div className="px-5 py-4 border-b border-gray-100 bg-violet-50 space-y-3">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Edit paper config</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Title</label>
              <input className={inp} value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Time limit (minutes)</label>
              <input type="number" className={inp} value={eMins} onChange={(e) => setEMins(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Total marks</label>
              <input type="number" className={inp} value={eTotal} onChange={(e) => setETotal(e.target.value)} placeholder="e.g. 400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Marks per correct MCQ</label>
              <input type="number" step="0.5" className={inp} value={eMarksPerQ} onChange={(e) => setEMarksPerQ(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Negative marks per wrong MCQ</label>
              <input type="number" step="0.25" className={inp} value={eNeg} onChange={(e) => setENeg(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={updatePaper.isPending}
              onClick={() => updatePaper.mutate()}
              className={`${smallBtn} bg-violet-600 text-white hover:bg-violet-700`}
            >
              {updatePaper.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save
            </button>
            <button type="button" onClick={() => setEditOpen(false)} className={`${smallBtn} bg-white border border-gray-200 text-gray-600`}>
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="px-5 py-4 space-y-3">
        {paper.sections.map((sec) => (
          <SectionBlock key={sec.id} section={sec} marksDefault={paper.marks_per_question} onRefetch={onRefetch} />
        ))}

        {/* Add section row */}
        <div className="flex gap-2 pt-1">
          <input
            className={`${inp} flex-1`}
            placeholder="New section title (e.g. Physics)"
            value={secTitle}
            onChange={(e) => setSecTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && secTitle.trim() && addSection.mutate()}
          />
          <button
            type="button"
            disabled={!secTitle.trim() || addSection.isPending}
            onClick={() => addSection.mutate()}
            className={`${smallBtn} bg-indigo-600 text-white hover:bg-indigo-700 shrink-0`}
          >
            {addSection.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Add section
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MockPackageBuilderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: pkg, isLoading, isError, refetch } = useQuery({
    queryKey: ["mock-builder", id],
    queryFn: () => mockTestsApi.builderDetail(id).then((r) => r.data),
    retry: 1,
  });

  const [paperTitle, setPaperTitle] = useState("");
  const [paperMins, setPaperMins] = useState(180);
  const [paperTotal, setPaperTotal] = useState<number | "">(400);
  const [paperMarksPerQ, setPaperMarksPerQ] = useState(4);
  const [paperNeg, setPaperNeg] = useState(1);

  const addPaper = useMutation({
    mutationFn: () =>
      mockTestsApi.addPaper(id, {
        title: paperTitle.trim(),
        time_limit_minutes: paperMins,
        total_marks: paperTotal === "" ? null : paperTotal,
        marks_per_question: paperMarksPerQ,
        negative_marks: paperNeg,
        order_index: pkg?.papers?.length ?? 0,
      }),
    onSuccess: async () => {
      setPaperTitle("");
      toast({ title: "Paper added" });
      await refetch();
    },
    onError: (e) => toast({ title: "Error adding paper", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const publish = useMutation({
    mutationFn: () => mockTestsApi.publishPackage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock-builder", id] });
      toast({ title: "Package published" });
    },
    onError: (e) => toast({ title: "Publish failed", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const totalQuestions = (pkg?.papers ?? []).reduce(
    (s: number, p: Paper) =>
      s + p.sections.reduce((ss: number, sec: Section) => ss + sec.questions.length, 0),
    0
  );
  const canPublish = (pkg?.papers?.length ?? 0) > 0 && totalQuestions > 0;

  if (isLoading) {
    return (
      <DashboardLayout title="Mock Test Builder">
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !pkg) {
    return (
      <DashboardLayout title="Mock Test Builder">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center max-w-lg">
          <p className="font-semibold text-red-700 mb-1">Failed to load package</p>
          <p className="text-sm text-red-500 mb-4">
            The server returned an error. If you just added new DB columns, run{" "}
            <code className="bg-red-100 px-1 rounded">alembic upgrade head</code> inside the backend container.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold text-red-600 underline"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={pkg.title}
      subtitle={`Status: ${pkg.status}`}
      breadcrumbs={[
        { label: "Mock Tests", href: "/teacher/mock-tests" },
        { label: pkg.title },
      ]}
      actions={
        pkg.status !== "published" ? (
          <button
            type="button"
            disabled={publish.isPending || !canPublish}
            onClick={() => publish.mutate()}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            title={!canPublish ? "Add at least one paper with questions first" : undefined}
          >
            {publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish package
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">
            ✓ Published
          </span>
        )
      }
    >
      <div className="max-w-3xl space-y-8">

        {/* Add paper form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-violet-600" /> Add a new paper
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Paper title</label>
              <input
                className={inp}
                placeholder="e.g. Full Mock Test 1"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Time limit (minutes)</label>
              <input type="number" className={inp} value={paperMins} onChange={(e) => setPaperMins(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Total marks</label>
              <input
                type="number"
                className={inp}
                value={paperTotal}
                onChange={(e) => setPaperTotal(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Marks per correct MCQ (+)</label>
              <input
                type="number"
                step="0.5"
                className={inp}
                value={paperMarksPerQ}
                onChange={(e) => setPaperMarksPerQ(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Negative marks per wrong MCQ (−)</label>
              <input
                type="number"
                step="0.25"
                className={inp}
                value={paperNeg}
                onChange={(e) => setPaperNeg(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={addPaper.isPending || !paperTitle.trim()}
            onClick={() => addPaper.mutate()}
            className="mt-4 inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {addPaper.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add paper
          </button>
        </div>

        {/* Papers list */}
        {(pkg.papers ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
            <p className="text-gray-400 text-sm">No papers yet. Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900">Papers</h2>
            {(pkg.papers as Paper[]).map((p) => (
              <PaperCard key={p.id} paper={p} onRefetch={refetch} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
