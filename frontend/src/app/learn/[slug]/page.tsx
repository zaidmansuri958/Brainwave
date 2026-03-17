"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi, lessonApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  Play, CheckCircle, BookOpen, MessageSquare, Users, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { useCourseStore } from "@/stores/courseStore";
import { Button } from "@/components/ui/button";

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const { user } = useAuthStore();
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="glass-navbar py-3 px-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-foreground font-semibold truncate flex-1">{course?.title}</h1>
        <div className="text-sm text-muted-foreground hidden md:block">
          {completedCount}/{totalLessons} lessons &middot; {overallProgress}%
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/learn/${params.slug}/chat`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /> AI Chat
            </Button>
          </Link>
          <Link href={`/learn/${params.slug}/community`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Community
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
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
              <div className="text-center text-muted-foreground">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>{lessonData ? "No video for this lesson" : "Select a lesson to start"}</p>
              </div>
            )}
          </div>

          {lessonData && (
            <div className="glass p-5 border-t border-border/30">
              <h2 className="text-foreground font-bold text-lg">{lessonData.title}</h2>
              {lessonData.ai_summary && (
                <div className="mt-3 glass rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                    <span className="text-xs text-muted-foreground font-semibold">AI Summary</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{lessonData.ai_summary}</p>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                {prevLesson && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveLessonId(prevLesson.id)} className="gap-1.5">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                )}
                {nextLesson && (
                  <Button variant="gradient" size="sm" onClick={() => setActiveLessonId(nextLesson.id)} className="ml-auto gap-1.5">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-72 lg:w-80 glass border-l border-border/30 flex flex-col overflow-hidden hidden md:flex">
          <div className="p-4 border-b border-border/30">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Your Progress</span>
              <span className="font-bold text-foreground">{overallProgress}%</span>
            </div>
            <div className="bg-muted/50 rounded-full h-2.5 overflow-hidden">
              <div className="gradient-bg h-2.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter: any) => (
              <div key={chapter.id}>
                <div className="px-4 py-2.5 glass sticky top-0 border-b border-border/20">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{chapter.title}</p>
                </div>
                {(chapter.lessons || []).map((lesson: any) => {
                  const lessonProgress = progressMap[lesson.id];
                  const isDone = lessonProgress?.completed;
                  const isActive = lesson.id === activeLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left ${
                        isActive ? "bg-primary-500/10 border-l-2 border-primary-500" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : isActive ? (
                          <Play className="h-4 w-4 text-primary-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? "text-primary-500" : isDone ? "text-muted-foreground" : "text-foreground/70"}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds && (
                          <p className="text-xs text-muted-foreground">{Math.floor(lesson.duration_seconds / 60)}m</p>
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
