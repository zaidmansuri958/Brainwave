"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Send, Bot, User, Loader2, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        { role: "assistant", content: "Sorry, I couldn't process your question. Please try again." },
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
    <div className="min-h-screen flex flex-col">
      <div className="glass-navbar px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <Link href={`/learn/${params.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-foreground font-semibold text-sm">AI Assistant</h1>
          <p className="text-muted-foreground text-xs">{course?.title || "Course"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
              msg.role === "user" ? "gradient-bg" : "glass"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-primary-500" />}
            </div>
            <div className={`max-w-2xl flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "gradient-bg text-white rounded-tr-md"
                  : "glass text-foreground rounded-tl-md"
              }`}>
                {msg.content || (isStreaming && i === messages.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                ) : "")}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1.5 text-xs text-muted-foreground">
                  Sources: {msg.sources.length} passage{msg.sources.length > 1 ? "s" : ""} from course
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass border-t border-border/30 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about the course..."
            rows={1}
            className="flex-1 glass-input rounded-xl px-4 py-3 resize-none text-sm"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            variant="gradient"
            size="icon"
            className="rounded-xl flex-shrink-0"
          >
            {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          AI answers are based on course content only.
        </p>
      </div>
    </div>
  );
}
