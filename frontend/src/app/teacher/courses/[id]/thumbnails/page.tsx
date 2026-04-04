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
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/courses" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">Thumbnails</h1>
            <p className="text-gray-500 text-sm">{course?.title}</p>
          </div>
        </div>

        <CourseManageNav courseId={id} />

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-48 aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              {course?.thumbnail_url ? (
                <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">
                Regenerate the course thumbnail with Gemini, optionally scoped to a lesson. Add a custom prompt to steer style
                (e.g. &quot;flat vector, indigo background&quot;).
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Target (optional)</label>
            <select
              className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
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
            <label className="text-xs font-semibold text-gray-500">Custom prompt (optional)</label>
            <textarea
              className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[88px]"
              placeholder="Style hints for the thumbnail…"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          <button
            type="button"
            disabled={regen.isPending}
            onClick={() => regen.mutate()}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {regen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Regenerate thumbnail
          </button>
        </div>
      </div>
    </div>
  );
}
