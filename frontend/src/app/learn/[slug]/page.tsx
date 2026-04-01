"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi, lessonApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play, CheckCircle, BookOpen, MessageSquare, Users, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { useCourseStore } from "@/stores/courseStore";

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const { currentLesson, setCurrentLesson, progress } = useCourseStore();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => courseApi.get(params.slug).then((r) => r.data),
  });

  const { data: lessonData } = useQuery({
    queryKey: ["lesson", course?.id, activeLessonId],
    queryFn: () => lessonApi.get(course!.id, activeLessonId!).then((r) => r.data),
    enabled: !!course?.id && !!activeLessonId,
  });

  const { data: myProgress } = useQuery({
    queryKey: ["my-progress", course?.id],
    queryFn: () => lessonApi.myProgress(course!.id).then((r) => r.data),
    enabled: !!course?.id,
  });

  // Auto-select first lesson
  useEffect(() => {
    if (course?.chapters?.[0]?.lessons?.[0]?.id && !activeLessonId) {
      setActiveLessonId(course.chapters[0].lessons[0].id);
    }
  }, [course]);

  const chapters = course?.chapters || [];
  const allLessons = chapters.flatMap((ch: any) => ch.lessons || []);
  const currentIdx = allLessons.findIndex((l: any) => l.id === activeLessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const progressMap = myProgress?.lessons?.reduce((acc: any, l: any) => {
    acc[l.lesson_id] = l;
    return acc;
  }, {}) || {};

  const completedCount = myProgress?.lessons?.filter((l: any) => l.completed).length || 0;
  const totalLessons = allLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      {/* Top bar */}
      <div className="bg-[#080F20]/80 backdrop-blur-xl border-b border-white/[0.06] py-3 px-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-white font-semibold truncate flex-1 text-sm">{course?.title}</h1>
        <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5">
          <span className="text-slate-300 font-semibold">{overallProgress}%</span> complete
        </div>
        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/learn/${params.slug}/chat`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white px-3.5 py-1.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-shadow"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Tutor
          </Link>
          <Link
            href={`/learn/${params.slug}/community`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
          >
            <Users className="h-3.5 w-3.5" /> Community
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="bg-black aspect-video flex items-center justify-center">
            {lessonData?.video_url ? (
              <video
                key={lessonData.video_url}
                controls
                className="w-full h-full"
                src={lessonData.video_url}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  const percent = Math.floor((video.currentTime / video.duration) * 100);
                  if (percent > 0 && percent % 10 === 0 && course?.id && activeLessonId) {
                    lessonApi.updateProgress(course.id, activeLessonId, {
                      watch_percent: percent,
                      watch_duration_seconds: Math.floor(video.currentTime),
                    }).catch(() => {});
                  }
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>{lessonData ? "No video for this lesson" : "Select a lesson to start"}</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          {lessonData && (
            <div className="bg-[#080F20] border-t border-white/[0.06] p-5">
              <h2 className="text-white font-bold text-base">{lessonData.title}</h2>
              {lessonData.ai_summary && (
                <div className="mt-3 p-3.5 bg-blue-500/[0.07] border border-blue-500/[0.12] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    <p className="text-xs text-blue-400 font-semibold">AI Summary</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{lessonData.ai_summary}</p>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                {prevLesson && (
                  <button
                    onClick={() => setActiveLessonId(prevLesson.id)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                )}
                {nextLesson && (
                  <button
                    onClick={() => setActiveLessonId(nextLesson.id)}
                    className="ml-auto flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-shadow"
                  >
                    Next Lesson <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 lg:w-80 bg-[#080F20] border-l border-white/[0.06] flex flex-col overflow-hidden hidden md:flex">
          {/* Progress */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Your Progress</span>
              <span className="font-semibold text-white">{overallProgress}%</span>
            </div>
            <div className="bg-white/[0.06] rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-violet-500 h-1.5 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5">{completedCount} of {totalLessons} lessons completed</p>
          </div>

          {/* Chapter/Lesson List */}
          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter: any) => (
              <div key={chapter.id}>
                <div className="px-4 py-2.5 bg-[#060B18] sticky top-0 border-b border-white/[0.04]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{chapter.title}</p>
                </div>
                {(chapter.lessons || []).map((lesson: any) => {
                  const lessonProgress = progressMap[lesson.id];
                  const isDone = lessonProgress?.completed;
                  const isActive = lesson.id === activeLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left ${
                        isActive ? "bg-blue-500/[0.08] border-l-2 border-blue-500" : "border-l-2 border-transparent"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : isActive ? (
                          <Play className="h-4 w-4 text-blue-400 fill-blue-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-700" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-medium leading-snug ${isActive ? "text-blue-400" : isDone ? "text-slate-400" : "text-slate-500"}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds && (
                          <p className="text-[10px] text-slate-700 mt-0.5">{Math.floor(lesson.duration_seconds / 60)}m</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
