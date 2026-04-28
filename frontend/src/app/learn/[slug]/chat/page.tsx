"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ChevronLeft, Loader2, Send, Sparkles, Trash2, User, Users } from "lucide-react";
import { courseApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hi! I'm your AI tutor for this course. I can explain concepts, summarise lessons, and help you understand difficult topics. What would you like to learn?",
};

const SUGGESTIONS = [
  "Explain the key concepts of this course",
  "Give me a summary of the main topics",
  "What should I revise before the next lesson?",
  "What real-world problems does this solve?",
];

function storageKey(courseId: string) {
  return `chat_history_${courseId}`;
}

export default function CourseChatPage({ params }: { params: { slug: string } }) {
  const { accessToken } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: course } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => courseApi.get(params.slug).then((response) => response.data),
  });

  useEffect(() => {
    if (!course?.id || historyLoaded) return;
    try {
      const stored = localStorage.getItem(storageKey(course.id));
      if (stored) {
        const parsed: Message[] = JSON.parse(stored);
        if (parsed.length > 0) setMessages(parsed);
      }
    } catch {}
    setHistoryLoaded(true);
  }, [course?.id, historyLoaded]);

  useEffect(() => {
    if (!course?.id || !historyLoaded) return;
    try {
      localStorage.setItem(storageKey(course.id), JSON.stringify(messages));
    } catch {}
  }, [course?.id, historyLoaded, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearHistory = () => {
    if (!course?.id) return;
    localStorage.removeItem(storageKey(course.id));
    setMessages([WELCOME]);
  };

  const sendMessage = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim() || !course?.id || isStreaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    let assistantContent = "";

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      let token = localStorage.getItem("access_token") || accessToken;

      let response = await fetch(`${apiUrl}/chat/${course.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (response.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          window.location.href = "/login";
          return;
        }
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!refreshResponse.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return;
        }
        const refreshData = await refreshResponse.json();
        const refreshedToken = refreshData.access_token as string;
        token = refreshedToken;
        localStorage.setItem("access_token", refreshedToken);
        response = await fetch(`${apiUrl}/chat/${course.id}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ message: userMsg }),
        });
      }

      if (!response.ok) throw new Error("Chat request failed");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finalSources: any[] = [];

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              assistantContent += data.token;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: assistantContent, sources: data.sources ?? finalSources };
                return next;
              });
            }
            if (data.sources) finalSources = data.sources;
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the AI service just now. Please try again in a moment." }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bw-shell">
        <div className="bw-band mb-4 flex items-center gap-3 px-4 py-3">
          <Link href={`/learn/${params.slug}`} className="rounded-full bg-white p-2 text-slate-500 transition hover:text-slate-950">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-slate-950">AI Tutor</h1>
            <p className="truncate text-xs text-slate-500">{course?.title || "Loading..."}</p>
          </div>
          <button type="button" onClick={clearHistory} className="rounded-lg p-2 text-slate-400 transition hover:bg-[#f8f2eb] hover:text-slate-950">
            <Trash2 className="h-4 w-4" />
          </button>
          <Link href={`/learn/${params.slug}/community`} className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 sm:flex">
            <Users className="h-3.5 w-3.5" /> Community
          </Link>
          <Link href={`/learn/${params.slug}`} className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 sm:flex">
            <BookOpen className="h-3.5 w-3.5" /> Course
          </Link>
        </div>
      </div>

      <div className="bw-shell flex-1 overflow-y-auto py-2">
        <div className="mx-auto max-w-4xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className="flex-shrink-0">
                  {message.role === "assistant" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                </div>

                <div className={`flex max-w-[78%] flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "rounded-tr-md bg-slate-950 text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-700"}`}>
                    {message.content ? (
                      message.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-slate-950">{children}</strong>,
                            em: ({ children }) => <em className="italic text-slate-500">{children}</em>,
                            ul: ({ children }) => <ul className="mb-2 list-inside list-disc space-y-1 pl-1">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 list-inside list-decimal space-y-1 pl-1">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-700">{children}</li>,
                            h1: ({ children }) => <h1 className="mb-2 mt-1 text-base font-bold text-slate-950">{children}</h1>,
                            h2: ({ children }) => <h2 className="mb-1.5 mt-1 text-sm font-bold text-slate-950">{children}</h2>,
                            h3: ({ children }) => <h3 className="mb-1 mt-1 text-sm font-semibold text-slate-950">{children}</h3>,
                            code: ({ children, className }) =>
                              className?.includes("language-") ? (
                                <pre className="my-2 overflow-x-auto rounded-lg border border-slate-200 bg-[#faf6ef] p-3 font-mono text-xs text-emerald-700">
                                  <code>{children}</code>
                                </pre>
                              ) : (
                                <code className="rounded bg-[#faf6ef] px-1.5 py-0.5 font-mono text-xs text-emerald-700">{children}</code>
                              ),
                            blockquote: ({ children }) => <blockquote className="my-2 border-l-2 border-indigo-300 pl-3 italic text-slate-500">{children}</blockquote>,
                            hr: () => <hr className="my-3 border-slate-200" />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )
                    ) : isStreaming && index === messages.length - 1 ? (
                      <span className="flex items-center gap-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "300ms" }} />
                      </span>
                    ) : null}
                  </div>
                  {message.sources?.length ? <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500"><BookOpen className="h-3 w-3" />{message.sources.length} passage{message.sources.length > 1 ? "s" : ""} from course material</div> : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {messages.length === 1 ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-white hover:text-slate-950">
                  {suggestion}
                </button>
              ))}
            </motion.div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bw-shell pb-6">
        <div className="bw-band mx-auto max-w-4xl p-4">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything about the course..."
                rows={1}
                className="max-h-32 w-full resize-none rounded-xl border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                style={{ fieldSizing: "content" } as any}
              />
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => sendMessage()} disabled={!input.trim() || isStreaming} className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white disabled:opacity-40">
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </motion.button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            AI answers are based on course content only.{" "}
            <Link href={`/learn/${params.slug}/community`} className="text-slate-700 underline underline-offset-2">
              Ask the community
            </Link>{" "}
            for broader questions.
          </p>
        </div>
      </div>
    </div>
  );
}
