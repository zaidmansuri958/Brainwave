"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi, lessonApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play, CheckCircle, BookOpen, MessageSquare, Users, ChevronLeft, ChevronRight
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 py-3 px-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-white font-semibold truncate flex-1">{course?.title}</h1>
        <div className="text-sm text-gray-400 hidden md:block">
          {completedCount}/{totalLessons} lessons · {overallProgress}%
        </div>
        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/learn/${params.slug}/chat`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> AI Chat
          </Link>
          <Link
            href={`/learn/${params.slug}/community`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Users className="h-4 w-4" /> Community
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
            <div className="bg-gray-800 p-4">
              <h2 className="text-white font-bold text-lg">{lessonData.title}</h2>
              {lessonData.ai_summary && (
                <div className="mt-3 p-3 bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold mb-1">AI Summary</p>
                  <p className="text-sm text-gray-200">{lessonData.ai_summary}</p>
                </div>
              )}

              {/* Prev/Next Navigation */}
              <div className="flex gap-3 mt-4">
                {prevLesson && (
                  <button
                    onClick={() => setActiveLessonId(prevLesson.id)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                )}
                {nextLesson && (
                  <button
                    onClick={() => setActiveLessonId(nextLesson.id)}
                    className="ml-auto flex items-center gap-2 text-sm text-white bg-primary-600 px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden hidden md:flex">
          {/* Progress */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Your Progress</span>
              <span className="font-semibold text-white">{overallProgress}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Chapter/Lesson List */}
          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter: any) => (
              <div key={chapter.id}>
                <div className="px-4 py-2 bg-gray-700 sticky top-0">
                  <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{chapter.title}</p>
                </div>
                {(chapter.lessons || []).map((lesson: any) => {
                  const lessonProgress = progressMap[lesson.id];
                  const isDone = lessonProgress?.completed;
                  const isActive = lesson.id === activeLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left ${
                        isActive ? "bg-primary-900/30 border-l-2 border-primary-500" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isActive ? (
                          <Play className="h-4 w-4 text-primary-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? "text-primary-400" : isDone ? "text-gray-300" : "text-gray-400"}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds && (
                          <p className="text-xs text-gray-500">{Math.floor(lesson.duration_seconds / 60)}m</p>
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
