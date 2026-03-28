"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { Send, Loader2, ChevronLeft, Sparkles, BookOpen, Users, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hi! I'm your AI tutor for this course. I can answer questions about the course material, explain concepts, and help you understand difficult topics. What would you like to learn?",
};

const SUGGESTIONS = [
  "Explain the key concepts of this course",
  "What are the prerequisites I should know?",
  "Give me a summary of the main topics",
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
    queryFn: () => courseApi.get(params.slug).then((r) => r.data),
  });

  // Load persisted messages once we have the course ID
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

  // Persist messages to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (!course?.id || !historyLoaded) return;
    try {
      localStorage.setItem(storageKey(course.id), JSON.stringify(messages));
    } catch {}
  }, [messages, course?.id, historyLoaded]);

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      let token = localStorage.getItem("access_token") || accessToken;

      let response = await fetch(`${API_URL}/chat/${course.id}/message`, {
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
        if (refreshToken) {
          const refreshResp = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (refreshResp.ok) {
            const refreshData = await refreshResp.json();
            token = refreshData.access_token;
            localStorage.setItem("access_token", token!);
            response = await fetch(`${API_URL}/chat/${course.id}/message`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "text/event-stream",
              },
              body: JSON.stringify({ message: userMsg }),
            });
          } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            return;
          }
        } else {
          window.location.href = "/login";
          return;
        }
      }

      if (!response.ok) throw new Error("Chat request failed");

      // Placeholder with bouncing dots
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finalSources: any[] = [];

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                assistantContent += data.token;
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    sources: data.sources ?? finalSources,
                  };
                  return newMsgs;
                });
              }
              if (data.sources) finalSources = data.sources;
              if (data.done && finalSources.length > 0) {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = {
                    ...newMsgs[newMsgs.length - 1],
                    sources: finalSources,
                  };
                  return newMsgs;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the AI service. The model may still be loading — please try again in a moment." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#080F20]/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link
            href={`/learn/${params.slug}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-sm">AI Tutor</h1>
            <p className="text-slate-500 text-xs truncate">{course?.title || "Loading..."}</p>
          </div>

          <button
            onClick={clearHistory}
            title="Clear chat history"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <Link
            href={`/learn/${params.slug}/community`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/5 transition-all"
          >
            <Users className="h-3.5 w-3.5" /> Community
          </Link>
          <Link
            href={`/learn/${params.slug}`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/5 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5" /> Course
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.role === "assistant" ? (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-[#1a2744] border border-white/[0.08] flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-tr-md"
                        : "bg-[#0C1526] border border-white/[0.07] text-slate-200 rounded-tl-md"
                    }`}
                  >
                    {msg.content ? (
                      msg.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 pl-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 pl-1">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-200">{children}</li>,
                            h1: ({ children }) => <h1 className="text-base font-bold text-white mb-2 mt-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold text-white mb-1.5 mt-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold text-white mb-1 mt-1">{children}</h3>,
                            code: ({ children, className }) => {
                              const isBlock = className?.includes("language-");
                              return isBlock ? (
                                <pre className="bg-[#060B18] border border-white/[0.08] rounded-lg p-3 my-2 overflow-x-auto text-xs text-emerald-300 font-mono">
                                  <code>{children}</code>
                                </pre>
                              ) : (
                                <code className="bg-white/10 text-emerald-300 font-mono text-xs px-1.5 py-0.5 rounded">{children}</code>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-blue-500/50 pl-3 my-2 text-slate-400 italic">{children}</blockquote>
                            ),
                            hr: () => <hr className="border-white/10 my-3" />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )
                    ) : (
                      isStreaming && i === messages.length - 1 ? (
                        <span className="flex items-center gap-1.5 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      ) : ""
                    )}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600">
                      <BookOpen className="h-3 w-3" />
                      {msg.sources.length} passage{msg.sources.length > 1 ? "s" : ""} from course material
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Suggestions (shown only at start) */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4"
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm text-slate-400 hover:text-slate-200 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-[#080F20]/80 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about the course..."
                rows={1}
                className="w-full bg-[#0C1526] border border-white/[0.08] text-slate-200 placeholder:text-slate-600 rounded-xl px-4 py-3 resize-none outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm transition-all max-h-32"
                style={{ fieldSizing: "content" } as any}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="h-11 w-11 bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
            >
              {isStreaming ? <Loader2 className="h-4.5 w-4.5 animate-spin" style={{ width: 18, height: 18 }} /> : <Send className="h-4 w-4" />}
            </motion.button>
          </div>
          <p className="text-center text-[11px] text-slate-700 mt-2">
            AI answers are based on course content only · <Link href={`/learn/${params.slug}/community`} className="text-slate-500 hover:text-slate-400 underline underline-offset-2">Ask the community</Link> for broader questions
          </p>
        </div>
      </div>
    </div>
  );
}
