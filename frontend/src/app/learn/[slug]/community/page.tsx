"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, MessageSquare, Plus, Send, Sparkles, ThumbsUp, Users, X } from "lucide-react";
import { communityApi, courseApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function CourseCommunityPage({ params }: { params: { slug: string } }) {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: course } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => courseApi.get(params.slug).then((response) => response.data),
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["community", course?.id],
    queryFn: () => communityApi.list(course!.id).then((response) => response.data),
    enabled: !!course?.id,
  });

  const posts: any[] = Array.isArray(postsData) ? postsData : postsData?.posts || postsData?.results || [];

  const createPost = useMutation({
    mutationFn: (content: string) => communityApi.create(course!.id, { content, post_type: "discussion" }),
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
    mutationFn: ({ postId, content }: { postId: string; content: string }) => communityApi.reply(course!.id, postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", course?.id] });
      setReplyTo(null);
      setReplyContent("");
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bw-shell">
        <div className="bw-band mb-4 flex items-center gap-3 px-4 py-3">
          <Link href={`/learn/${params.slug}`} className="rounded-full bg-white p-2 text-gray-500 transition hover:text-gray-900">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-gray-900">Community</h1>
            <p className="truncate text-xs text-gray-500">{course?.title || "Loading..."}</p>
          </div>
          <Link href={`/learn/${params.slug}/chat`} className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-gray-600 sm:flex">
            <Sparkles className="h-3.5 w-3.5" /> AI Tutor
          </Link>
          <Link href={`/learn/${params.slug}`} className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-gray-600 sm:flex">
            <BookOpen className="h-3.5 w-3.5" /> Course
          </Link>
          <button type="button" onClick={() => setShowForm(true)} className="bw-action-primary !rounded-full !px-4 !py-2.5">
            <Plus className="h-4 w-4" />
            New post
          </button>
        </div>
      </div>

      <div className="bw-shell flex-1 space-y-4 pb-6">
        <AnimatePresence>
          {showForm ? (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="bw-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className=" text-xl font-bold text-gray-900">Start a discussion</h3>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-[#f8f2eb] hover:text-gray-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea value={newPost} onChange={(event) => setNewPost(event.target.value)} rows={4} className="w-full rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" placeholder="Share a question, insight, or challenge..." />
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => createPost.mutate(newPost)} disabled={!newPost.trim() || createPost.isPending} className="bw-action-primary !rounded-[1rem] !px-4 !py-3">
                  {createPost.isPending ? "Posting..." : "Post discussion"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bw-action-secondary !rounded-[1rem] !px-4 !py-3">
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bw-card h-36 animate-pulse bg-white/70" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bw-card-soft border-dashed px-8 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-indigo-50 text-indigo-600">
              <Users className="h-7 w-7" />
            </div>
            <p className=" text-lg font-bold text-gray-900">No discussions yet</p>
            <p className="mt-2 text-sm text-gray-500">Be the first to start a conversation for this course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any, index: number) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="bw-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white">
                    {post.user?.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{post.user?.full_name}</span>
                      <span className="text-xs text-slate-400">{formatDate(post.created_at)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{post.content}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <button type="button" onClick={() => upvotePost.mutate(post.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <ThumbsUp className="h-3.5 w-3.5" /> {post.upvote_count || 0}
                      </button>
                      <button type="button" onClick={() => setReplyTo(replyTo === post.id ? null : post.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <MessageSquare className="h-3.5 w-3.5" /> {post.replies?.length || 0} replies
                      </button>
                    </div>

                    {post.replies?.length ? (
                      <div className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                        {post.replies.map((reply: any) => (
                          <div key={reply.id} className="rounded-[1rem] bg-[#fcf8f3] px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900">{reply.user?.full_name}</span>
                              {reply.is_official_answer ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Official answer</span> : null}
                            </div>
                            <p className="mt-2 text-xs leading-6 text-gray-600">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {replyTo === post.id ? (
                      <div className="mt-4 flex gap-2">
                        <input
                          value={replyContent}
                          onChange={(event) => setReplyContent(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              if (replyContent.trim()) createReply.mutate({ postId: post.id, content: replyContent });
                            }
                          }}
                          className="flex-1 rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                          placeholder="Write a reply..."
                        />
                        <button type="button" onClick={() => createReply.mutate({ postId: post.id, content: replyContent })} disabled={!replyContent.trim() || createReply.isPending} className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white disabled:opacity-40">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
