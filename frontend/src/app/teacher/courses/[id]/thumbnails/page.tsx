"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { teacherApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ThumbnailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();
  const [lessonId, setLessonId] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");

  const { data: course, isLoading } = useQuery({
    queryKey: ["teacher-course", id],
    queryFn: () => teacherApi.getCourse(id).then((r) => r.data),
  });

  const regen = useMutation({
    mutationFn: () =>
      teacherApi.regenerateThumbnail(id, {
        lesson_id: lessonId || undefined,
        custom_prompt: customPrompt.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-course", id] });
      toast({ title: "Thumbnail updated" });
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Regeneration failed";
      toast({ title: String(msg), variant: "destructive" });
    },
  });

  const lessons: { id: string; title: string; chapter: string }[] = [];
  for (const ch of course?.chapters || []) {
    for (const les of ch.lessons || []) {
      lessons.push({ id: les.id, title: les.title, chapter: ch.title });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/courses" className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md">
            <ArrowLeft className="h-6 w-6 text-black" strokeWidth={3} />
          </Link>
          <div>
            <h1 className=" text-3xl  uppercase tracking-tight text-gray-900">Thumbnails</h1>
            <p className="text-sm font-bold text-gray-600">{course?.title}</p>
          </div>
        </div>

        <CourseManageNav courseId={id} />

        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm mt-8 mb-20 space-y-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-full sm:w-64 aspect-video rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-sm flex-shrink-0 relative">
              {course?.thumbnail_url ? (
                <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-10 w-10" strokeWidth={2} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-700">
                Regenerate the course thumbnail with Gemini, optionally scoped to a lesson. Add a custom prompt to steer style
                (e.g. &quot;flat vector, indigo background&quot;).
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Target (optional)</label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00] appearance-none"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
              >
                <option value="">Course cover only</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.chapter} — {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Custom prompt (optional)</label>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                placeholder="Style hints for the thumbnail…"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={regen.isPending}
            onClick={() => regen.mutate()}
            className="inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md disabled:opacity-50"
          >
            {regen.isPending ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <RefreshCw className="h-5 w-5" strokeWidth={3} />}
            Regenerate Thumbnail
          </button>
        </div>
      </div>
    </div>
  );
}
