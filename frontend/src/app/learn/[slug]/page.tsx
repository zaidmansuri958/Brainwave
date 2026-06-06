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
  SendHorizontal,
} from "lucide-react";
import { AIBadge } from "@/components/ui/ai-badge";
import { ProgressRing } from "@/components/ui/progress-ring";
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
    <div className="flex-1 overflow-y-auto min-h-0 bg-white">
      {chapters.map((chapter: Chapter) => (
          <div key={chapter.id}>
            <div className="sticky top-0 z-10 border-b-4 border-black bg-yellow-300 px-5 py-3">
              <p className="text-xs font-semibold text-black">{chapter.title}</p>
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
                <div key={lesson.id} className="w-full border-b-2 border-black/10 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!unlocked) return;
                      setCurrentLesson(lesson);
                      setActiveLessonId(lesson.id);
                      onPickLesson?.();
                    }}
                    disabled={!unlocked}
                    className={`w-full border-l-8 px-5 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive ? "border-l-black bg-blue-100" : "border-l-transparent hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {!unlocked ? (
                          <Lock className="h-5 w-5 text-gray-400" strokeWidth={3} />
                        ) : isDone ? (
                          <CheckCircle className="h-5 w-5 text-black fill-[#7dde92]" strokeWidth={2} />
                        ) : isActive ? (
                          <Play className="h-5 w-5 fill-black text-black" strokeWidth={2} />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-gray-200" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold uppercase tracking-wide leading-snug ${
                            isActive ? "text-black" : isDone ? "text-gray-500" : "text-gray-800"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds && (
                          <p className="mt-1 text-[10px] font-semibold text-gray-500">{Math.floor(lesson.duration_seconds / 60)}m</p>
                        )}
                      </div>
                    </div>
                  </button>
                  {needQuiz && (
                    <div className="px-5 pb-3 bg-white">
                      <Link
                        href={`/courses/${courseSlug}/quiz/${meta.required_quiz_id}`}
                        className="inline-block text-[10px] font-semibold text-white bg-red-500 border border-gray-200 px-3 py-1 rounded-full  hover:-translate-y-0.5 transition-transform"
                      >
                        Pass quiz to unlock →
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
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-8 border-black border-t-[#ffe500] shadow-sm" />
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
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-lg mx-auto relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 relative z-10 w-full">
            <p className="text-black   text-3xl uppercase tracking-tighter">We couldn't load this course</p>
            <p className="text-gray-600 font-bold text-sm  mt-4">{typeof msg === "string" ? msg : "Try again in a moment."}</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={() => refetch()}
                className="flex-1 rounded-full bg-yellow-300 border border-gray-200 px-6 py-4 text-sm font-semibold text-black shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform"
              >
                Retry
              </button>
              <Link href="/dashboard" className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-black shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform block text-center">
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 relative z-10 w-full max-w-md">
            <p className="text-black   text-3xl uppercase tracking-tighter">Course not found</p>
            <p className="text-gray-600 font-bold text-sm  mt-4">This course may have been removed or the link is incorrect.</p>
            <Link href="/courses" className="mt-8 block w-full rounded-full bg-yellow-300 border border-gray-200 px-6 py-4 text-sm font-semibold text-black shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform">
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sidebarProgressHeader = (
    <div className="border-b-4 border-black p-5 bg-blue-100">
      <div className="mb-3 flex justify-between items-center text-sm font-semibold text-black">
        <span>Progress</span>
        <span className="bg-white border border-gray-200 px-3 py-1 rounded-full">{overallProgress}%</span>
      </div>
      <div className="h-4 rounded-full bg-white border border-gray-200 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 bottom-0 bg-yellow-300 border-r-2 border-black transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <p className="mt-3 text-[10px] font-semibold text-black bg-white/50 px-2 py-1 rounded-md inline-block">
        {completedCount} of {totalLessons} lessons completed
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
      
      <div className="bw-shell py-4 lg:py-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200 rounded-xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="shrink-0 rounded-full border border-gray-200 bg-yellow-300 p-2 sm:p-3 text-black transition-transform hover:-translate-y-1 ">
              <ChevronLeft className="h-5 w-5" strokeWidth={3} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl  uppercase tracking-tight text-black line-clamp-1">{course.title}</h1>
              <div className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-gray-500 md:flex mt-1">
                <span className="text-black bg-green-100 px-2 py-0.5 rounded border border-black">{overallProgress}%</span> complete
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              className="flex-1 sm:flex-none justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black md:hidden  flex items-center gap-2"
              onClick={() => setLessonDrawerOpen(true)}
              aria-expanded={lessonDrawerOpen}
              aria-controls="learn-lesson-drawer"
            >
              <ListVideo className="h-4 w-4" strokeWidth={3} />
              Lessons
            </button>
            <Link
              href={`/learn/${params.slug}/chat`}
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-full border border-gray-200 bg-black px-4 py-2 text-xs font-semibold text-yellow-400 hover:-translate-y-1 transition-transform "
            >
              <Sparkles className="h-4 w-4" strokeWidth={3} /> <span className="hidden sm:inline">AI Tutor</span>
            </Link>
            <Link
              href={`/learn/${params.slug}/community`}
              className="hidden sm:flex rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black hover:-translate-y-1 transition-transform  items-center gap-2"
            >
              <Users className="h-4 w-4" strokeWidth={3} /> Community
            </Link>
          </div>
        </div>
      </div>

      {user?.role === "student" && accessData?.access && (
        <div className="bw-shell mb-4 relative z-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-gray-200 bg-pink-100 px-5 py-3 text-xs font-semibold text-black shadow-sm">
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full">
              {accessData.access.type === "lifetime" || !accessData.access.expires_at
                ? "Access: Lifetime"
                : `Ends: ${new Date(accessData.access.expires_at).toLocaleDateString()}`}
            </span>
            {accessData.module_lock_enabled && (
              <span className="opacity-80">
                Modules unlock upon quiz completion
              </span>
            )}
          </div>
        </div>
      )}

      <div className="bw-shell flex min-h-0 flex-1 gap-6 pb-12 relative z-10">
        
        {/* Main Video Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex aspect-video shrink-0 items-center justify-center bg-black border-b-4 border-black relative">
            {videoData?.master_url || lessonData?.video_url ? (
              <video
                key={videoData?.master_url || lessonData?.video_url}
                controls
                className="w-full h-full object-cover"
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
              >
                {activeLessonId && (
                  <track
                    kind="captions"
                    src={lessonApi.captionsUrl(activeLessonId)}
                    srcLang={course?.transcript_language || "en"}
                    label="Auto-generated captions"
                    default={true}
                  />
                )}
              </video>
            ) : (
              <div className="text-center text-white">
                <div className="h-24 w-24 rounded-full border-4 border-white flex items-center justify-center mx-auto mb-6">
                  <Play className="h-10 w-10 opacity-50 ml-2" strokeWidth={3} />
                </div>
                <p className="font-semibold">{lessonData ? "No video" : "Select a lesson"}</p>
              </div>
            )}
          </div>

          {lessonData && (
            <div className="bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b-4 border-black pb-6 mb-6">
                <h2 className="text-2xl sm:text-3xl  uppercase tracking-tight text-gray-900">{lessonData.title}</h2>
              </div>
              
              {lessonData.ai_summary && (
                <div className="rounded-lg border border-gray-200 bg-blue-100 p-5 sm:p-6 mb-8 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b-2 border-black/20 pb-2 w-fit">
                    <Sparkles className="h-5 w-5 text-black" strokeWidth={3} />
                    <p className="text-sm font-semibold text-black">AI Summary</p>
                  </div>
                  <p className="text-base font-bold text-gray-900 leading-relaxed">{lessonData.ai_summary}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                {prevLesson && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLesson(prevLesson);
                      setActiveLessonId(prevLesson.id);
                    }}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-4 text-xs font-semibold text-black transition-transform hover:-translate-y-1 shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={3} /> Prev
                  </button>
                )}
                {nextLesson && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLesson(nextLesson);
                      setActiveLessonId(nextLesson.id);
                    }}
                    className="flex flex-1 sm:flex-none items-center justify-center sm:ml-auto gap-3 rounded-full border border-gray-200 bg-yellow-300 px-8 py-4 text-xs font-semibold text-black transition-transform hover:-translate-y-1 shadow-sm"
                  >
                    Next <ChevronRight className="h-5 w-5" strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Lessons */}
        <div className="hidden min-h-0 w-72 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white md:flex lg:w-80 shadow-sm">
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

        {/* Right Sidebar AI Tutor (Desktop Only) */}
        <div className="hidden min-h-0 w-[360px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white lg:flex shadow-sm">
          <div className="border-b-4 border-black p-5 bg-green-100">
            <div className="flex items-center justify-between">
              <p className="text-xl  uppercase tracking-tight text-black">AI Tutor</p>
              <div className="bg-white border border-gray-200 rounded-full px-2 py-1 "><Sparkles className="h-4 w-4 text-black" strokeWidth={3} /></div>
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 ">
              <ProgressRing value={overallProgress} size={48} strokeWidth={6} />
              <div>
                <p className="text-[10px] font-semibold text-gray-500">Progress</p>
                <p className="text-sm  uppercase text-black">{completedCount} / {totalLessons} done</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto p-5 bg-slate-50">
            <div className="max-w-[85%] rounded-lg rounded-tl-sm border border-gray-200 bg-white p-4 text-sm font-bold text-gray-800 ">
              Great work finishing this module. Want a quick recap or quiz?
            </div>
            <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm border border-gray-200 bg-yellow-300 p-4 text-sm font-bold text-black ">
              Quiz me on the key definitions from this lesson.
            </div>
            <div className="max-w-[85%] rounded-lg rounded-tl-sm border border-gray-200 bg-white p-4 text-sm font-bold text-gray-800 ">
              Sure. First question: what is gradient descent optimizing in neural training?
            </div>
          </div>
          
          <div className="border-t-4 border-black p-5 bg-white">
            <div className="mb-4 flex flex-wrap gap-2">
              <button className="rounded-full border border-gray-200 bg-white hover:bg-blue-100 px-3 py-1.5 text-[10px] font-semibold text-black  transition-transform hover:-translate-y-0.5">Recap</button>
              <button className="rounded-full border border-gray-200 bg-white hover:bg-pink-100 px-3 py-1.5 text-[10px] font-semibold text-black  transition-transform hover:-translate-y-0.5">Quiz</button>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pl-4 bg-slate-50 ">
              <input className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-gray-400" placeholder="Ask anything..." />
              <button className="rounded-full bg-black p-3 text-white hover:bg-orange-500 transition-colors"><SendHorizontal className="h-4 w-4" strokeWidth={3} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
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
            className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-[32px] border-t-8 border-black bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b-4 border-black px-6 py-4 bg-yellow-300 rounded-t-[24px]">
              <h2 id="learn-drawer-title" className="text-xl  uppercase tracking-tight text-black">
                Lessons
              </h2>
              <button
                type="button"
                onClick={() => setLessonDrawerOpen(false)}
                className="rounded-full border border-gray-200 bg-white p-2 text-black hover:bg-slate-100 "
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
            {sidebarProgressHeader}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
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
