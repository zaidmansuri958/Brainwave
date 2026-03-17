"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Send, Bot, User, Loader2, ChevronLeft } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

export default function CourseChatPage({ params }: { params: { slug: string } }) {
  const { accessToken } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant for this course. Ask me anything about the course material!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: course } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => courseApi.get(params.slug).then((r) => r.data),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !course?.id || isStreaming) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    let assistantContent = "";
    const msgIndex = messages.length + 1;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${API_URL}/chat/${course.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

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
                    sources: data.sources,
                  };
                  return newMsgs;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your question. Please try again.",
        },
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar />

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <Link href={`/learn/${params.slug}`} className="text-gray-400 hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <Bot className="h-6 w-6 text-primary-400" />
        <div>
          <h1 className="text-white font-semibold text-sm">AI Assistant</h1>
          <p className="text-gray-400 text-xs">{course?.title || "Course"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user" ? "bg-primary-600" : "bg-gray-700"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-primary-400" />}
            </div>
            <div className={`max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-200 rounded-tl-sm"
              }`}>
                {msg.content || (isStreaming && i === messages.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "")}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Sources: {msg.sources.length} passage{msg.sources.length > 1 ? "s" : ""} from course
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about the course..."
            rows={1}
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex-shrink-0 min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          AI answers are based on course content only. For off-topic questions, use the community group.
        </p>
      </div>
    </div>
  );
}
