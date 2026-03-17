"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, communityApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ChevronLeft, Plus, ThumbsUp, MessageSquare, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

  const { data: posts, isLoading } = useQuery({
    queryKey: ["community", course?.id],
    queryFn: () => communityApi.list(course!.id).then((r) => r.data),
    enabled: !!course?.id,
  });

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
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <Link href={`/learn/${params.slug}`} className="text-gray-400 hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-white font-semibold text-sm">Community</h1>
          <p className="text-gray-400 text-xs">{course?.title}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* New Post Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3">Start a Discussion</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              rows={4}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => createPost.mutate(newPost)}
                disabled={!newPost.trim() || createPost.isPending}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {createPost.isPending ? "Posting..." : "Post"}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewPost(""); }}
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No discussions yet</p>
            <p className="text-sm mt-1">Be the first to start a conversation!</p>
          </div>
        ) : (
          (posts || []).map((post: any) => (
            <div key={post.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              {post.is_pinned && (
                <div className="flex items-center gap-1 text-xs text-yellow-500 mb-2">
                  <Pin className="h-3 w-3" /> Pinned
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {post.user?.full_name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{post.user?.full_name}</span>
                    {post.user?.role === "teacher" && (
                      <span className="text-xs bg-primary-900 text-primary-400 px-1.5 py-0.5 rounded">Teacher</span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => upvotePost.mutate(post.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> {post.upvote_count || 0}
                    </button>
                    <button
                      onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> {post.replies?.length || 0} Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {post.replies?.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-gray-700 pl-4">
                      {post.replies.map((reply: any) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {reply.user?.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-white">{reply.user?.full_name}</span>
                              {reply.is_official_answer && (
                                <span className="text-xs bg-green-900 text-green-400 px-1 py-0.5 rounded">Official</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-300">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyTo === post.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => createReply.mutate({ postId: post.id, content: replyContent })}
                        disabled={!replyContent.trim() || createReply.isPending}
                        className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
