"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, lessonApi, learnApi, communityApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  Play, CheckCircle2, ChevronLeft, ChevronRight, Sparkles,
  Lock, X, Send, BookOpen, FileText, Bookmark,
  Download, RotateCcw, Layers, Zap, MessageSquare,
  Brain, Map, Star, Flame, Trophy, Users, ChevronDown,
  ChevronUp, Bot, BadgeCheck, Clock, ThumbsUp, Plus, Reply,
} from "lucide-react";
import { useCourseStore } from "@/stores/courseStore";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HLSVideoPlayer } from "@/components/ui/HLSVideoPlayer";

// ── helpers ────────────────────────────────────────────────────────────────────
function fmtSec(s: number) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── Curriculum sidebar ─────────────────────────────────────────────────────────
function CurriculumSidebar({
  chapters, progressMap, activeLessonId, onSelectLesson,
  completedCount, totalLessons, overallProgress,
  chapterUnlocked, chapterMeta, courseSlug,
}: any) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-open chapter containing active lesson
    chapters.forEach((ch: any) => {
      if ((ch.lessons || []).some((l: any) => l.id === activeLessonId)) {
        setOpenChapters(p => ({ ...p, [ch.id]: true }));
      }
    });
  }, [activeLessonId, chapters]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Course Curriculum</h3>
        <p className="text-xs text-gray-500 mt-0.5">{completedCount} / {totalLessons} lessons completed</p>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto">
        {chapters.map((ch: any, ci: number) => {
          const chLessons  = ch.lessons || [];
          const doneCh     = chLessons.filter((l: any) => progressMap[l.id]?.completed).length;
          const isOpen     = openChapters[ch.id] !== false;
          const isUnlocked = chapterUnlocked[ch.id] !== false;

          return (
            <div key={ch.id} className="border-b border-gray-50">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/70 transition-colors text-left"
                onClick={() => setOpenChapters(p => ({ ...p, [ch.id]: !isOpen }))}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{ch.title}</p>
                  <p className="text-[11px] text-gray-400">{doneCh} / {chLessons.length}</p>
                </div>
                {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    transition={{ duration: 0.18 }} className="overflow-hidden">
                    {chLessons.map((lesson: any) => {
                      const done     = progressMap[lesson.id]?.completed;
                      const isActive = lesson.id === activeLessonId;
                      const locked   = !isUnlocked;
                      const meta     = chapterMeta[ch.id];
                      const needQuiz = meta && !meta.unlocked && meta.required_quiz_id;

                      return (
                        <div key={lesson.id}>
                          <button
                            onClick={() => !locked && onSelectLesson(lesson)}
                            disabled={locked}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors disabled:opacity-50 ${
                              isActive ? "bg-violet-50 border-r-2 border-violet-600" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="shrink-0">
                              {locked     ? <Lock className="h-3.5 w-3.5 text-gray-300" />
                               : done     ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                               : isActive ? <div className="h-3.5 w-3.5 rounded-full bg-violet-600 flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white rounded-full" /></div>
                               : <div className="h-3.5 w-3.5 rounded-full border border-gray-300" />}
                            </div>
                            <p className={`flex-1 text-xs truncate ${isActive ? "font-semibold text-violet-700" : done ? "text-gray-400" : "text-gray-700"}`}>
                              {lesson.title}
                            </p>
                            {lesson.duration_seconds > 0 && (
                              <span className="text-[10px] text-gray-400 shrink-0">{Math.floor(lesson.duration_seconds / 60)}:{String(lesson.duration_seconds % 60).padStart(2,"0")}</span>
                            )}
                          </button>
                          {needQuiz && (
                            <div className="px-4 pb-2">
                              <Link href={`/courses/${courseSlug}/quiz/${meta.required_quiz_id}`}
                                className="text-[10px] font-semibold text-violet-600 hover:underline">
                                Pass quiz to unlock →
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI Tutor sidebar ───────────────────────────────────────────────────────────
function AITutorSidebar({ courseId, lessonTitle, completedCount, totalLessons, overallProgress }: {
  courseId: string; lessonTitle: string;
  completedCount: number; totalLessons: number; overallProgress: number;
}) {
  const { accessToken } = useAuthStore();
  type Msg = { role: "user" | "assistant"; content: string };
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AI Tutor. Ask me anything about this lesson or course!" }
  ]);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK = [
    "Explain this lesson", "Give real world examples",
    "Quiz me on this topic", "Create flashcards", "Interview questions",
  ];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg = { role: "user" as const, content: text };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setStreaming(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token  = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const res = await fetch(`${apiUrl}/chat/${courseId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMsg = "";
      setMessages(p => [...p, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          try {
            const d = JSON.parse(raw);
            // Backend sends { token: "word " } chunks, then { sources: [...], done: true }
            if (d.token) {
              aiMsg += d.token;
              setMessages(p => [...p.slice(0, -1), { role: "assistant", content: aiMsg }]);
            }
            if (d.done) break;
          } catch {}
        }
      }
    } catch (err: any) {
      const isNetworkError = err?.message?.includes("fetch") || err?.message?.includes("network");
      setMessages(p => [...p, {
        role: "assistant",
        content: isNetworkError
          ? "⚠️ AI service is not reachable. Make sure the backend Docker containers are running (`docker compose -f docker-compose.backend.yml up -d`)."
          : "Sorry, I couldn't process that. Please try again.",
      }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
            <Bot className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-700">Brainwave AI Tutor</p>
            <p className="text-[11px] text-gray-400">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Quick action chips — always visible, collapse when streaming */}
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1.5 px-1">Quick Actions</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map(q => (
            <button key={q}
              onClick={() => { if (!streaming) send(q); }}
              disabled={streaming}
              className={`text-[11px] font-medium rounded-full border px-2.5 py-1 transition-all ${
                streaming
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100 hover:border-violet-400 active:scale-95"
              }`}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/40">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {m.role === "assistant" && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-violet-600" />
              </div>
            )}
            <div className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
              m.role === "user"
                ? "bg-violet-600 text-white rounded-tr-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
            }`}>
              {streaming && i === messages.length - 1 && !m.content ? (
                <span className="flex gap-1"><span className="animate-bounce delay-0">●</span><span className="animate-bounce delay-75">●</span><span className="animate-bounce delay-150">●</span></span>
              ) : m.role === "user" ? (
                m.content
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p:      ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                    em:     ({ children }) => <em className="italic">{children}</em>,
                    ul:     ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                    ol:     ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                    li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
                    code:   ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5 text-[11px] font-mono text-violet-700">{children}</code>,
                    h1: ({ children }) => <p className="font-bold text-gray-900 mb-1">{children}</p>,
                    h2: ({ children }) => <p className="font-bold text-gray-900 mb-1">{children}</p>,
                    h3: ({ children }) => <p className="font-semibold text-gray-900 mb-0.5">{children}</p>,
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none" />
          <button onClick={() => send(input)} disabled={!input.trim() || streaming}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-40 shrink-0">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-800">Your Achievements</p>
          <button className="text-[11px] text-violet-600 font-semibold hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: BookOpen, label: "Lessons",  value: completedCount, bg: "bg-blue-50",   color: "text-blue-500"   },
            { icon: Brain,    label: "Avg Quiz",  value: "87%",          bg: "bg-green-50",  color: "text-green-500"  },
            { icon: Trophy,   label: "Top 10%",   value: "Rank",         bg: "bg-amber-50",  color: "text-amber-500"  },
            { icon: Flame,    label: "Streak",    value: "7 Day",        bg: "bg-red-50",    color: "text-red-500"    },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className={`${bg} rounded-xl p-2 text-center`}>
              <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
              <p className="text-xs font-bold text-gray-800 leading-tight">{value}</p>
              <p className="text-[9px] text-gray-500 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const { user, accessToken } = useAuthStore();
  const { setCurrentLesson }  = useCourseStore();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "transcript" | "ai" | "bookmark" | "download" | "community">("ai");
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const qc = useQueryClient();
  const [lessonDrawerOpen, setLessonDrawerOpen] = useState(false);
  const progressFailToastAt = useRef(0);

  const { data: course, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["course", params.slug],
    queryFn:  () => courseApi.get(params.slug).then(r => r.data),
  });

  const { data: lessonData } = useQuery({
    queryKey: ["lesson", course?.id, activeLessonId],
    queryFn:  () => lessonApi.get(course!.id, activeLessonId!).then(r => r.data),
    enabled:  !!course?.id && !!activeLessonId,
  });

  const { data: videoData } = useQuery({
    queryKey: ["lesson-video", activeLessonId],
    queryFn:  () => lessonApi.videoUrl(activeLessonId!).then(r => r.data),
    enabled:  !!activeLessonId && lessonData?.lesson_type === "video",
    retry: 1,
  });

  const { data: myProgress } = useQuery({
    queryKey: ["my-progress", course?.id],
    queryFn:  () => lessonApi.myProgress(course!.id).then(r => r.data),
    enabled:  !!course?.id,
  });

  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ["learn-access", params.slug],
    queryFn:  () => learnApi.courseAccess(params.slug).then(r => r.data),
    enabled:  !!course?.id && user?.role === "student",
    retry: false,
  });

  // Community posts query (only when tab is active)
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["community", course?.id],
    queryFn:  () => communityApi.list(course!.id).then(r => r.data),
    enabled:  !!course?.id && activeTab === "community",
  });
  const posts: any[] = Array.isArray(postsData) ? postsData : postsData?.posts || postsData?.results || [];

  const createPost = useMutation({
    mutationFn: (content: string) => communityApi.create(course!.id, { content, post_type: "discussion" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community", course?.id] }); setNewPost(""); },
  });
  const upvotePost = useMutation({
    mutationFn: (postId: string) => communityApi.upvote(course!.id, postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community", course?.id] }),
  });
  const createReply = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      communityApi.reply(course!.id, postId, { content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community", course?.id] }); setReplyTo(null); setReplyContent(""); },
  });

  const chapterUnlocked = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const c of accessData?.chapters || []) m[c.chapter_id] = c.unlocked;
    return m;
  }, [accessData]);

  const chapterMeta = useMemo(() => {
    const m: Record<string, any> = {};
    for (const c of accessData?.chapters || []) m[c.chapter_id] = c;
    return m;
  }, [accessData]);

  useEffect(() => {
    if (course?.chapters?.[0]?.lessons?.[0]?.id && !activeLessonId) {
      const first = course.chapters[0].lessons[0];
      setCurrentLesson(first);
      setActiveLessonId(first.id);
    }
  }, [course, activeLessonId, setCurrentLesson]);

  const handleProgressSaveFailure = useCallback(() => {
    const now = Date.now();
    if (now - progressFailToastAt.current < 60_000) return;
    progressFailToastAt.current = now;
    toast({ title: "Couldn't save progress", variant: "destructive" });
  }, []);

  const chapters    = course?.chapters || [];
  const allLessons  = chapters.flatMap((ch: any) => ch.lessons || []);
  const currentIdx  = allLessons.findIndex((l: any) => l.id === activeLessonId);
  const prevLesson  = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson  = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const progressMap = myProgress?.lessons?.reduce((acc: any, l: any) => { acc[l.lesson_id] = l; return acc; }, {}) || {};
  const completedCount  = myProgress?.lessons?.filter((l: any) => l.completed).length || 0;
  const totalLessons    = allLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const findChapter = (lessonId: string | null) => {
    for (const ch of chapters) {
      const idx = (ch.lessons || []).findIndex((l: any) => l.id === lessonId);
      if (idx >= 0) return { chapter: ch, idx: idx + 1, total: ch.lessons.length };
    }
    return null;
  };
  const chapterInfo = findChapter(activeLessonId);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 items-center justify-center">
        <div className="h-10 w-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isError || !course) {
    const msg = (error as any)?.response?.data?.detail || "Couldn't load this course.";
    return (
      <div className="h-screen flex flex-col bg-gray-50 items-center justify-center text-center px-4">
        <p className="text-lg font-bold text-gray-900 mb-2">{!course ? "Course not found" : "Failed to load"}</p>
        <p className="text-sm text-gray-500 mb-6">{msg}</p>
        <div className="flex gap-3">
          {isError && <button onClick={() => refetch()} className="rounded-xl bg-violet-600 text-white text-sm font-semibold px-5 py-2.5">Retry</button>}
          <Link href="/dashboard" className="rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 hover:bg-gray-50">Back</Link>
        </div>
      </div>
    );
  }

  // Rewrite internal MinIO/Docker hostnames to browser-accessible URLs.
  function toPublicUrl(url: string | null | undefined): string | null {
    if (!url || url === "null" || url === "undefined") return null;
    return url
      .replace(/https?:\/\/minio(:\d+)?/g, "http://localhost:9000")
      .replace(/https?:\/\/backend(:\d+)?/g, "http://localhost:8000");
  }

  const rawVideoUrl = videoData?.master_url || lessonData?.video_url || null;
  const videoUrl    = toPublicUrl(rawVideoUrl);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      {/* ── Top header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16 gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition-colors shrink-0">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Link>
            {/* Course icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 shrink-0">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate max-w-[280px] lg:max-w-md">{course.title}</h1>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 flex-wrap">
                {course.avg_rating > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400" /> {Number(course.avg_rating).toFixed(1)}
                    <span className="text-gray-400 font-normal ml-0.5">({course.review_count?.toLocaleString()})</span>
                  </span>
                )}
                {course.enrolled_count > 0 && <span>{course.enrolled_count?.toLocaleString()} learners</span>}
                {course.total_duration_minutes > 0 && (
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{Math.round(course.total_duration_minutes / 60)}h</span>
                )}
                <span className="flex items-center gap-0.5 text-violet-600 font-semibold"><BadgeCheck className="h-3 w-3" /> Expert Verified</span>
              </div>
            </div>
          </div>

          {/* Right — progress + CTA */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Progress</span>
                <span className="font-bold text-gray-900">{overallProgress}%</span>
              </div>
              <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
            {nextLesson ? (
              <button onClick={() => { setCurrentLesson(nextLesson); setActiveLessonId(nextLesson.id); }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-sm shadow-violet-200">
                Continue Learning <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link href={`/courses/${params.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-sm">
                Course Details <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {/* Mobile lessons toggle */}
            <button onClick={() => setLessonDrawerOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
              <Layers className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 3-column body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — Curriculum */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-r border-gray-200 overflow-hidden">
          <CurriculumSidebar
            chapters={chapters} progressMap={progressMap}
            activeLessonId={activeLessonId}
            onSelectLesson={(l: any) => { setCurrentLesson(l); setActiveLessonId(l.id); }}
            completedCount={completedCount} totalLessons={totalLessons} overallProgress={overallProgress}
            chapterUnlocked={chapterUnlocked} chapterMeta={chapterMeta} courseSlug={params.slug}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50">

          {/* Video player — uses HLSVideoPlayer for .m3u8 streams */}
          <div className="bg-black relative shrink-0" style={{ aspectRatio: "16/9", maxHeight: "60vh" }}>
            {videoUrl ? (
              <HLSVideoPlayer
                key={videoUrl}
                src={videoUrl}
                className="w-full h-full"
                captionsSrc={activeLessonId ? lessonApi.captionsUrl(activeLessonId) : undefined}
                captionsLang={course?.transcript_language || "en"}
                onTimeUpdate={(currentTime, duration) => {
                  const pct = Math.floor((currentTime / duration) * 100);
                  if (pct > 0 && pct % 10 === 0 && course?.id && activeLessonId) {
                    lessonApi.updateProgress(course.id, activeLessonId, {
                      watch_percent: pct,
                      watch_duration_seconds: Math.floor(currentTime),
                    }).catch(handleProgressSaveFailure);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 mb-4">
                  <Play className="h-8 w-8 opacity-60 ml-1" />
                </div>
                {!lessonData ? (
                  <p className="text-sm text-white/60">Select a lesson from the sidebar to begin</p>
                ) : lessonData.lesson_type === "document" ? (
                  <p className="text-sm text-white/60">This is a document lesson — no video</p>
                ) : (
                  <>
                    <p className="text-sm text-white/80 font-semibold mb-1">No video uploaded yet</p>
                    <p className="text-xs text-white/40 max-w-xs">
                      This lesson has no video. Teachers can upload a video via the Teacher Studio → My Courses → Upload Materials.
                    </p>
                  </>
                )}
              </div>
            )}
            {/* Chapter / Lesson label */}
            {chapterInfo && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[11px] text-white font-medium">
                {chapterInfo.chapter.title} · Lesson {chapterInfo.idx}
              </div>
            )}
          </div>

          {/* Below video: tabs + content */}
          <div className="flex-1 bg-white border-t border-gray-200">
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-gray-100 px-4 overflow-x-auto no-scrollbar">
              {([
                { id: "notes",      label: "Notes",       icon: FileText      },
                { id: "transcript", label: "Transcript",  icon: FileText      },
                { id: "ai",         label: "AI Explain",  icon: Sparkles      },
                { id: "community",  label: "Discussion",  icon: MessageSquare },
                { id: "bookmark",   label: "Bookmark",    icon: Bookmark      },
                { id: "download",   label: "Download",    icon: Download      },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                    activeTab === id
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === "ai" && lessonData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* AI Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      <h3 className="text-sm font-bold text-gray-900">AI Summary</h3>
                    </div>
                    {lessonData.ai_summary ? (
                      <>
                        <p className="text-sm text-gray-700 leading-relaxed">{lessonData.ai_summary}</p>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-xs text-gray-400">Estimated reading time: 2 min</span>
                          <button className="inline-flex items-center gap-1 text-xs text-violet-600 font-medium hover:underline">
                            <RotateCcw className="h-3 w-3" /> Regenerate
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">AI summary not available for this lesson.</p>
                    )}
                  </div>

                  {/* Smart Actions */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Smart Actions</h3>
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      {[
                        { label: "Generate Notes", icon: FileText, color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100" },
                        { label: "Flashcards",     icon: Layers,   color: "text-amber-600",  bg: "bg-amber-50  hover:bg-amber-100"  },
                        { label: "Practice Quiz",  icon: Brain,    color: "text-pink-600",   bg: "bg-pink-50   hover:bg-pink-100"   },
                        { label: "Mind Map",       icon: Map,      color: "text-green-600",  bg: "bg-green-50  hover:bg-green-100"  },
                      ].map(({ label, icon: Icon, color, bg }) => (
                        <button key={label}
                          className={`flex items-center gap-2 ${bg} rounded-xl px-3 py-2.5 text-xs font-semibold ${color} transition-colors border border-transparent`}>
                          <Icon className="h-4 w-4 shrink-0" />{label}
                        </button>
                      ))}
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold py-2.5 transition-colors">
                      <MessageSquare className="h-4 w-4" /> Ask AI Doubt
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="text-sm text-gray-500 text-center py-8">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  Notes feature coming soon
                </div>
              )}
              {activeTab === "transcript" && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  {lessonData?.ai_summary
                    ? <p className="italic text-gray-500">Auto-transcript will appear here after processing.</p>
                    : <p className="text-gray-400 text-center py-8">No transcript available</p>}
                </div>
              )}
              {activeTab === "bookmark" && (
                <div className="text-sm text-gray-500 text-center py-8">
                  <Bookmark className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  Bookmarks feature coming soon
                </div>
              )}
              {activeTab === "download" && lessonData && (
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-800 mb-3">Downloadable resources</p>
                  <p className="text-gray-400">No downloads available for this lesson.</p>
                </div>
              )}

              {/* ── Community Discussion ── */}
              {activeTab === "community" && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Students Discussion</h3>
                      <p className="text-xs text-gray-400">{posts.length} comment{posts.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => setNewPost(newPost ? "" : " ")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> New Post
                    </button>
                  </div>

                  {/* New post box */}
                  {newPost !== "" && (
                    <div className="bg-violet-50 rounded-xl border border-violet-100 p-4">
                      <textarea value={newPost} onChange={e => setNewPost(e.target.value)} rows={3}
                        placeholder="Share a question, insight or comment with your classmates..."
                        className="w-full bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none mb-3" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setNewPost("")}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>
                        <button onClick={() => newPost.trim() && createPost.mutate(newPost.trim())}
                          disabled={!newPost.trim() || createPost.isPending}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 disabled:opacity-50 transition-colors">
                          <Send className="h-3.5 w-3.5" /> Post
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Posts list */}
                  {postsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="h-10 w-10 text-gray-200 mb-3" />
                      <p className="text-sm font-semibold text-gray-700 mb-1">No discussions yet</p>
                      <p className="text-xs text-gray-400">Be the first to start a conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post: any) => (
                        <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-violet-100 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 shrink-0 text-xs font-bold text-violet-600">
                              {(post.author_name || post.student_name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-900">
                                  {post.author_name || post.student_name || "Student"}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {post.created_at ? new Date(post.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : ""}
                                </span>
                                {post.is_pinned && (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Pinned</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>
                              <div className="flex items-center gap-3">
                                <button onClick={() => upvotePost.mutate(post.id)}
                                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors">
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                  {post.upvotes || post.upvote_count || 0}
                                </button>
                                <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  Reply {post.replies?.length > 0 ? `(${post.replies.length})` : ""}
                                </button>
                              </div>

                              {/* Replies */}
                              {(post.replies || []).map((reply: any) => (
                                <div key={reply.id} className="mt-3 pl-4 border-l-2 border-violet-100">
                                  <div className="flex items-start gap-2">
                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 text-[10px] font-bold ${reply.is_ai ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                                      {reply.is_ai ? "AI" : (reply.author_name || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-semibold text-gray-700 mr-1">
                                        {reply.is_ai ? "Brainwave AI" : (reply.author_name || "Student")}
                                      </span>
                                      <p className="text-xs text-gray-600 mt-0.5">{reply.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Reply input */}
                              {replyTo === post.id && (
                                <div className="mt-3 flex gap-2">
                                  <input value={replyContent} onChange={e => setReplyContent(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && replyContent.trim() && createReply.mutate({ postId: post.id, content: replyContent })}
                                    placeholder="Write a reply..."
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                                  <button onClick={() => replyContent.trim() && createReply.mutate({ postId: post.id, content: replyContent })}
                                    disabled={!replyContent.trim() || createReply.isPending}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 shrink-0">
                                    <Send className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
              <button disabled={!prevLesson} onClick={() => prevLesson && (setCurrentLesson(prevLesson), setActiveLessonId(prevLesson.id))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-semibold px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-30">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button disabled={!nextLesson} onClick={() => nextLesson && (setCurrentLesson(nextLesson), setActiveLessonId(nextLesson.id))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 transition-colors disabled:opacity-30 shadow-sm shadow-violet-200">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Right sidebar — AI Tutor */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 bg-white border-l border-gray-200 overflow-hidden">
          <AITutorSidebar
            courseId={course.id}
            lessonTitle={lessonData?.title || ""}
            completedCount={completedCount}
            totalLessons={totalLessons}
            overallProgress={overallProgress}
          />
        </aside>
      </div>

      {/* Mobile curriculum drawer */}
      <AnimatePresence>
        {lessonDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setLessonDrawerOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 flex flex-col shadow-xl lg:hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-bold text-gray-900">Course Curriculum</p>
                <button onClick={() => setLessonDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CurriculumSidebar
                  chapters={chapters} progressMap={progressMap}
                  activeLessonId={activeLessonId}
                  onSelectLesson={(l: any) => { setCurrentLesson(l); setActiveLessonId(l.id); setLessonDrawerOpen(false); }}
                  completedCount={completedCount} totalLessons={totalLessons} overallProgress={overallProgress}
                  chapterUnlocked={chapterUnlocked} chapterMeta={chapterMeta} courseSlug={params.slug}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
