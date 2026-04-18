"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi, lessonApi, learnApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import {
  Play,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  ListVideo,
  X,
} from "lucide-react";
import { useCourseStore } from "@/stores/courseStore";
import { toast } from "@/hooks/use-toast";

type Chapter = { id: string; title?: string; lessons?: any[] };

function LearnLessonList({
  chapters,
  progressMap,
  activeLessonId,
  setActiveLessonId,
  setCurrentLesson,
  user,
  accessLoading,
  chapterUnlocked,
  chapterMeta,
  courseSlug,
  onPickLesson,
}: {
  chapters: Chapter[];
  progressMap: Record<string, any>;
  activeLessonId: string | null;
  setActiveLessonId: (id: string) => void;
  setCurrentLesson: (l: any) => void;
  user: { role?: string } | null | undefined;
  accessLoading: boolean;
  chapterUnlocked: Record<string, boolean>;
  chapterMeta: Record<string, { unlocked: boolean; required_quiz_id?: string | null }>;
  courseSlug: string;
  onPickLesson?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {chapters.map((chapter: Chapter) => (
          <div key={chapter.id}>
            <div className="px-4 py-2.5 bg-[#060B18] sticky top-0 border-b border-white/[0.04] z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{chapter.title}</p>
            </div>
            {(chapter.lessons || []).map((lesson: any) => {
              const lessonProgress = progressMap[lesson.id];
              const isDone = lessonProgress?.completed;
              const isActive = lesson.id === activeLessonId;
              const unlocked =
                user?.role !== "student" || accessLoading || chapterUnlocked[String(chapter.id)] === true;
              const meta = chapterMeta[String(chapter.id)];
              const needQuiz = meta && !meta.unlocked && meta.required_quiz_id;

              return (
                <div key={lesson.id} className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (!unlocked) return;
                      setCurrentLesson(lesson);
                      setActiveLessonId(lesson.id);
                      onPickLesson?.();
                    }}
                    disabled={!unlocked}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                      isActive ? "bg-blue-500/[0.08] border-l-2 border-blue-500" : "border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {!unlocked ? (
                        <Lock className="h-4 w-4 text-amber-500/80" />
                      ) : isDone ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : isActive ? (
                        <Play className="h-4 w-4 text-blue-400 fill-blue-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium leading-snug ${
                          isActive ? "text-blue-400" : isDone ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {lesson.title}
                      </p>
                      {lesson.duration_seconds && (
                        <p className="text-[10px] text-slate-700 mt-0.5">{Math.floor(lesson.duration_seconds / 60)}m</p>
                      )}
                    </div>
                  </button>
                  {needQuiz && (
                    <div className="px-4 pb-2 -mt-1">
                      <Link
                        href={`/courses/${courseSlug}/quiz/${meta.required_quiz_id}`}
                        className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
                      >
                        Pass previous chapter quiz to unlock →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const { user } = useAuthStore();
  const { setCurrentLesson } = useCourseStore();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonDrawerOpen, setLessonDrawerOpen] = useState(false);
  const progressFailToastAt = useRef(0);

  const {
    data: course,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => courseApi.get(params.slug).then((r) => r.data),
  });

  const { data: lessonData } = useQuery({
    queryKey: ["lesson", course?.id, activeLessonId],
    queryFn: () => lessonApi.get(course!.id, activeLessonId!).then((r) => r.data),
    enabled: !!course?.id && !!activeLessonId,
  });

  const { data: videoData } = useQuery({
    queryKey: ["lesson-video", activeLessonId],
    queryFn: () => lessonApi.videoUrl(activeLessonId!).then((r) => r.data),
    enabled: !!activeLessonId && lessonData?.lesson_type === "video",
    retry: 1,
  });

  const { data: myProgress } = useQuery({
    queryKey: ["my-progress", course?.id],
    queryFn: () => lessonApi.myProgress(course!.id).then((r) => r.data),
    enabled: !!course?.id,
  });

  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ["learn-access", params.slug],
    queryFn: () => learnApi.courseAccess(params.slug).then((r) => r.data),
    enabled: !!course?.id && user?.role === "student",
    retry: false,
  });

  const chapterUnlocked = useMemo(() => {
    const m: Record<string, boolean> = {};
    if (!accessData?.chapters) return m;
    for (const c of accessData.chapters) {
      m[c.chapter_id] = c.unlocked;
    }
    return m;
  }, [accessData]);

  const chapterMeta = useMemo(() => {
    const m: Record<string, { unlocked: boolean; required_quiz_id?: string | null }> = {};
    for (const c of accessData?.chapters || []) {
      m[c.chapter_id] = { unlocked: c.unlocked, required_quiz_id: c.required_quiz_id };
    }
    return m;
  }, [accessData]);

  useEffect(() => {
    if (course?.chapters?.[0]?.lessons?.[0]?.id && !activeLessonId) {
      setCurrentLesson(course.chapters[0].lessons[0]);
      setActiveLessonId(course.chapters[0].lessons[0].id);
    }
  }, [course, activeLessonId, setCurrentLesson]);

  const chapters = course?.chapters || [];
  const allLessons = chapters.flatMap((ch: any) => ch.lessons || []);
  const currentIdx = allLessons.findIndex((l: any) => l.id === activeLessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const progressMap =
    myProgress?.lessons?.reduce((acc: any, l: any) => {
      acc[l.lesson_id] = l;
      return acc;
    }, {}) || {};

  const completedCount = myProgress?.lessons?.filter((l: any) => l.completed).length || 0;
  const totalLessons = allLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleProgressSaveFailure = useCallback(() => {
    const now = Date.now();
    if (now - progressFailToastAt.current < 60_000) return;
    progressFailToastAt.current = now;
    toast({
      title: "Couldn't save progress",
      description: "Check your connection. Your watch position may not be saved.",
      variant: "destructive",
    });
  }, []);

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

  if (isError) {
    const msg =
      (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
      (error as Error)?.message ||
      "Something went wrong loading this course.";
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
          <p className="text-gray-900 font-semibold text-lg">We couldn&apos;t load this course</p>
          <p className="text-gray-600 text-sm mt-2">{typeof msg === "string" ? msg : "Try again in a moment."}</p>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold shadow-button-indigo"
            >
              Retry
            </button>
            <Link href="/dashboard" className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-gray-900 font-semibold text-lg">Course not found</p>
          <p className="text-gray-600 text-sm mt-2">This course may have been removed or the link is incorrect.</p>
          <Link href="/courses" className="mt-8 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold">
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  const sidebarProgressHeader = (
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
      <p className="text-[11px] text-slate-600 mt-1.5">
        {completedCount} of {totalLessons} lessons completed
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      <div className="bg-[#080F20]/80 backdrop-blur-xl border-b border-white/[0.06] py-3 px-4 flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-white font-semibold truncate flex-1 text-sm min-w-0">{course.title}</h1>
        <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5 shrink-0">
          <span className="text-slate-300 font-semibold">{overallProgress}%</span> complete
        </div>
        <button
          type="button"
          className="md:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-white/[0.08] border border-white/[0.1] px-3 py-1.5 rounded-xl shrink-0"
          onClick={() => setLessonDrawerOpen(true)}
          aria-expanded={lessonDrawerOpen}
          aria-controls="learn-lesson-drawer"
        >
          <ListVideo className="h-4 w-4" />
          Lessons
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/learn/${params.slug}/chat`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">AI Tutor</span>
          </Link>
          <Link
            href={`/learn/${params.slug}/community`}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/[0.08]"
          >
            <Users className="h-3.5 w-3.5" /> Community
          </Link>
        </div>
      </div>

      {user?.role === "student" && accessData?.access && (
        <div className="px-4 py-2.5 bg-violet-500/10 border-b border-violet-500/20 text-[11px] text-violet-100 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {accessData.access.type === "lifetime" || !accessData.access.expires_at
              ? "Enrollment: lifetime access"
              : `Enrollment: access ends ${new Date(accessData.access.expires_at).toLocaleString()}`}
          </span>
          {accessData.module_lock_enabled && (
            <span className="text-slate-400">
              Modules unlock when you complete the previous chapter and pass its quiz.
            </span>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-black aspect-video flex items-center justify-center shrink-0">
            {videoData?.master_url || lessonData?.video_url ? (
              <video
                key={videoData?.master_url || lessonData?.video_url}
                controls
                className="w-full h-full"
                src={videoData?.master_url || lessonData?.video_url}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  const percent = Math.floor((video.currentTime / video.duration) * 100);
                  if (percent > 0 && percent % 10 === 0 && course?.id && activeLessonId) {
                    lessonApi
                      .updateProgress(course.id, activeLessonId, {
                        watch_percent: percent,
                        watch_duration_seconds: Math.floor(video.currentTime),
                      })
                      .catch(handleProgressSaveFailure);
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
                    type="button"
                    onClick={() => {
                      setCurrentLesson(prevLesson);
                      setActiveLessonId(prevLesson.id);
                    }}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                )}
                {nextLesson && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLesson(nextLesson);
                      setActiveLessonId(nextLesson.id);
                    }}
                    className="ml-auto flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-shadow"
                  >
                    Next Lesson <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-72 lg:w-80 bg-[#080F20] border-l border-white/[0.06] flex flex-col overflow-hidden hidden md:flex min-h-0">
          {sidebarProgressHeader}
          <LearnLessonList
            chapters={chapters}
            progressMap={progressMap}
            activeLessonId={activeLessonId}
            setActiveLessonId={setActiveLessonId}
            setCurrentLesson={setCurrentLesson}
            user={user}
            accessLoading={accessLoading}
            chapterUnlocked={chapterUnlocked}
            chapterMeta={chapterMeta}
            courseSlug={params.slug}
          />
        </div>
      </div>

      {lessonDrawerOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-labelledby="learn-drawer-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close lesson list"
            onClick={() => setLessonDrawerOpen(false)}
          />
          <div
            id="learn-lesson-drawer"
            className="absolute bottom-0 left-0 right-0 max-h-[78vh] bg-[#080F20] border-t border-white/[0.1] rounded-t-2xl flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h2 id="learn-drawer-title" className="text-sm font-semibold text-white">
                Lessons
              </h2>
              <button
                type="button"
                onClick={() => setLessonDrawerOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarProgressHeader}
            <div className="flex-1 overflow-y-auto min-h-0">
              <LearnLessonList
                chapters={chapters}
                progressMap={progressMap}
                activeLessonId={activeLessonId}
                setActiveLessonId={setActiveLessonId}
                setCurrentLesson={setCurrentLesson}
                user={user}
                accessLoading={accessLoading}
                chapterUnlocked={chapterUnlocked}
                chapterMeta={chapterMeta}
                courseSlug={params.slug}
                onPickLesson={() => setLessonDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
