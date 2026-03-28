"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, communityApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  ChevronLeft, Plus, ThumbsUp, MessageSquare, Pin, Sparkles, BookOpen, X, Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseCommunityPage({ params }: { params: { slug: string } }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: course } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => courseApi.get(params.slug).then((r) => r.data),
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["community", course?.id],
    queryFn: () => communityApi.list(course!.id).then((r) => r.data),
    enabled: !!course?.id,
  });

  // Handle both array response and { posts: [] } object response
  const posts: any[] = Array.isArray(postsData)
    ? postsData
    : postsData?.posts || postsData?.results || [];

  const createPost = useMutation({
    mutationFn: (content: string) =>
      communityApi.create(course!.id, { content, post_type: "discussion" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", course?.id] });
      setNewPost("");
      setShowForm(false);
    },
  });

  const upvotePost = useMutation({
    mutationFn: (postId: string) => communityApi.upvote(course!.id, postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community", course?.id] }),
  });

  const createReply = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      communityApi.reply(course!.id, postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", course?.id] });
      setReplyTo(null);
      setReplyContent("");
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#080F20]/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href={`/learn/${params.slug}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-sm">Community</h1>
            <p className="text-slate-500 text-xs truncate">{course?.title || "Loading..."}</p>
          </div>

          <Link
            href={`/learn/${params.slug}/chat`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/5 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Tutor
          </Link>
          <Link
            href={`/learn/${params.slug}`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/5 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5" /> Course
          </Link>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3.5 py-2 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-shadow"
          >
            <Plus className="h-3.5 w-3.5" /> New Post
          </motion.button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">

        {/* New Post Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0C1526] rounded-2xl p-5 border border-white/[0.08]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Start a Discussion</h3>
                <button
                  onClick={() => { setShowForm(false); setNewPost(""); }}
                  className="p-1 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts, questions, or insights about the course..."
                rows={4}
                className="w-full bg-[#080F20] border border-white/[0.07] text-slate-200 placeholder:text-slate-600 rounded-xl px-4 py-3 resize-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-sm transition-all"
              />
              <div className="flex gap-3 mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createPost.mutate(newPost)}
                  disabled={!newPost.trim() || createPost.isPending}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity shadow-lg shadow-violet-500/20"
                >
                  {createPost.isPending ? "Posting..." : "Post Discussion"}
                </motion.button>
                <button
                  onClick={() => { setShowForm(false); setNewPost(""); }}
                  className="text-slate-500 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-[#0C1526] rounded-2xl animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-[#0C1526] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-white font-semibold">No discussions yet</p>
            <p className="text-slate-500 text-sm mt-1">Be the first to start a conversation!</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20"
            >
              <Plus className="h-4 w-4" /> Start Discussion
            </button>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post: any, i: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0C1526] rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.11] transition-colors"
              >
                {post.is_pinned && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mb-3 font-medium">
                    <Pin className="h-3 w-3" /> Pinned by instructor
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {post.user?.full_name?.[0]?.toUpperCase() || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{post.user?.full_name}</span>
                      {post.user?.role === "teacher" && (
                        <span className="text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          Instructor
                        </span>
                      )}
                      <span className="text-xs text-slate-600">{formatDate(post.created_at)}</span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => upvotePost.mutate(post.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{post.upvote_count || 0}</span>
                      </button>
                      <button
                        onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{post.replies?.length || 0} {post.replies?.length === 1 ? "reply" : "replies"}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {post.replies?.length > 0 && (
                      <div className="mt-4 space-y-3 border-l-2 border-white/[0.05] pl-4">
                        {post.replies.map((reply: any) => (
                          <div key={reply.id} className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#1a2744] border border-white/[0.06] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {reply.user?.full_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-semibold text-white">{reply.user?.full_name}</span>
                                {reply.is_official_answer && (
                                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    Official Answer
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    <AnimatePresence>
                      {replyTo === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex gap-2">
                            <input
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (replyContent.trim()) createReply.mutate({ postId: post.id, content: replyContent });
                                }
                              }}
                              placeholder="Write a reply..."
                              className="flex-1 bg-[#080F20] border border-white/[0.07] text-slate-200 placeholder:text-slate-600 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            />
                            <button
                              onClick={() => createReply.mutate({ postId: post.id, content: replyContent })}
                              disabled={!replyContent.trim() || createReply.isPending}
                              className="h-9 w-9 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
