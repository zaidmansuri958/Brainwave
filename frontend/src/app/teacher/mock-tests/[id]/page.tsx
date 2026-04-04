"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { mockTestsApi } from "@/lib/api";
import { ArrowLeft, Loader2, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MockPackageBuilderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: pkg, isLoading, refetch } = useQuery({
    queryKey: ["mock-builder", id],
    queryFn: () => mockTestsApi.builderDetail(id).then((r) => r.data),
  });

  const [paperTitle, setPaperTitle] = useState("");
  const [paperMins, setPaperMins] = useState(60);
  const [secTitle, setSecTitle] = useState("");
  const [secPaperId, setSecPaperId] = useState("");
  const [qText, setQText] = useState("");
  const [qOpts, setQOpts] = useState("A\nB\nC\nD");
  const [qCorrect, setQCorrect] = useState("");
  const [qSectionId, setQSectionId] = useState("");

  const addPaper = useMutation({
    mutationFn: () =>
      mockTestsApi.addPaper(id, {
        title: paperTitle.trim(),
        time_limit_minutes: paperMins,
        order_index: (pkg?.papers?.length || 0),
      }),
    onSuccess: async () => {
      setPaperTitle("");
      toast({ title: "Paper added" });
      await refetch();
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const addSection = useMutation({
    mutationFn: () =>
      mockTestsApi.addSection(secPaperId, {
        title: secTitle.trim(),
        order_index: 0,
      }),
    onSuccess: async () => {
      setSecTitle("");
      toast({ title: "Section added" });
      await refetch();
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const addQuestion = useMutation({
    mutationFn: () => {
      const options = qOpts
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      return mockTestsApi.addQuestion(qSectionId, {
        question_text: qText.trim(),
        question_type: "mcq",
        options,
        correct_answer: qCorrect.trim(),
        marks: 1,
        order_index: 0,
      });
    },
    onSuccess: async () => {
      setQText("");
      setQCorrect("");
      toast({ title: "Question added" });
      await refetch();
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const publish = useMutation({
    mutationFn: () => mockTestsApi.publishPackage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock-builder", id] });
      toast({ title: "Published" });
    },
    onError: () => toast({ title: "Publish failed", variant: "destructive" }),
  });

  const input = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm";

  if (isLoading || !pkg) {
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/teacher/mock-tests" className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> All packages
        </Link>
        <h1 className="font-display font-extrabold text-2xl text-gray-900">{pkg.title}</h1>
        <p className="text-sm text-gray-500">{pkg.status}</p>

        {pkg.status !== "published" && (
          <button
            type="button"
            disabled={publish.isPending}
            onClick={() => publish.mutate()}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish package
          </button>
        )}

        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add paper
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className={input} placeholder="Paper title" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} />
            <input
              type="number"
              className={input}
              placeholder="Minutes"
              value={paperMins}
              onChange={(e) => setPaperMins(Number(e.target.value))}
            />
          </div>
          <button
            type="button"
            disabled={addPaper.isPending || !paperTitle.trim()}
            onClick={() => addPaper.mutate()}
            className="text-sm font-semibold text-indigo-600"
          >
            Add paper
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Add section</h2>
          <select className={input} value={secPaperId} onChange={(e) => setSecPaperId(e.target.value)}>
            <option value="">Select paper</option>
            {(pkg.papers || []).map((p: { id: string; title: string }) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input className={input} placeholder="Section title" value={secTitle} onChange={(e) => setSecTitle(e.target.value)} />
          <button
            type="button"
            disabled={addSection.isPending || !secPaperId || !secTitle.trim()}
            onClick={() => addSection.mutate()}
            className="text-sm font-semibold text-indigo-600"
          >
            Add section
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Add MCQ</h2>
          <select className={input} value={qSectionId} onChange={(e) => setQSectionId(e.target.value)}>
            <option value="">Select section</option>
            {(pkg.papers || []).flatMap((p: any) =>
              (p.sections || []).map((s: { id: string; title: string }) => (
                <option key={s.id} value={s.id}>
                  {p.title} — {s.title}
                </option>
              ))
            )}
          </select>
          <textarea className={`${input} min-h-[72px]`} placeholder="Question text" value={qText} onChange={(e) => setQText(e.target.value)} />
          <textarea className={`${input} min-h-[88px]`} placeholder="Options (one per line)" value={qOpts} onChange={(e) => setQOpts(e.target.value)} />
          <input className={input} placeholder="Correct answer (exact match)" value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} />
          <button
            type="button"
            disabled={addQuestion.isPending || !qSectionId || !qText.trim()}
            onClick={() => addQuestion.mutate()}
            className="text-sm font-semibold text-indigo-600"
          >
            Add question
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="font-display font-bold text-lg">Preview</h2>
          {(pkg.papers || []).map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="font-semibold text-gray-900">
                {p.title}{" "}
                <span className="text-gray-400 font-normal text-sm">({p.time_limit_minutes} min)</span>
              </p>
              {(p.sections || []).map((s: any) => (
                <div key={s.id} className="mt-3 pl-3 border-l-2 border-indigo-100">
                  <p className="text-sm font-medium text-gray-700">{s.title}</p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    {(s.questions || []).map((q: any, i: number) => (
                      <li key={q.id}>
                        {i + 1}. {q.question_text.slice(0, 80)}
                        {q.question_text.length > 80 ? "…" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
