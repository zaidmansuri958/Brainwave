"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, communityApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ChevronLeft, Plus, ThumbsUp, MessageSquare, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col">
      <div className="glass-navbar px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <Link href={`/learn/${params.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-foreground font-semibold text-sm">Community</h1>
          <p className="text-muted-foreground text-xs">{course?.title}</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setShowForm(true)} className="gap-1.5 rounded-xl">
          <Plus className="h-3.5 w-3.5" /> New Post
        </Button>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 space-y-4 w-full">
        {showForm && (
          <div className="glass-card p-5 rounded-3xl animate-slide-up">
            <h3 className="text-foreground font-bold mb-3">Start a Discussion</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              rows={4}
              className="w-full glass-input rounded-xl px-4 py-3 resize-none text-sm"
            />
            <div className="flex gap-3 mt-3">
              <Button variant="gradient" size="sm" onClick={() => createPost.mutate(newPost)} disabled={!newPost.trim()} loading={createPost.isPending}>
                Post
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setNewPost(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-32 animate-pulse rounded-3xl">
                <div className="h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-3xl" />
              </div>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">No discussions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to start a conversation!</p>
          </div>
        ) : (
          (posts || []).map((post: any) => (
            <div key={post.id} className="glass-card p-5 rounded-3xl">
              {post.is_pinned && (
                <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
                  <Pin className="h-3 w-3" /> Pinned
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {post.user?.full_name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-foreground">{post.user?.full_name}</span>
                    {post.user?.role === "teacher" && (
                      <Badge variant="default" className="text-[10px] py-0">Teacher</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => upvotePost.mutate(post.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary-500 transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> {post.upvote_count || 0}
                    </button>
                    <button
                      onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary-500 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> {post.replies?.length || 0} Reply
                    </button>
                  </div>

                  {post.replies?.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-border/30 pl-4">
                      {post.replies.map((reply: any) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground text-xs font-semibold flex-shrink-0">
                            {reply.user?.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-foreground">{reply.user?.full_name}</span>
                              {reply.is_official_answer && (
                                <Badge variant="success" className="text-[10px] py-0">Official</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyTo === post.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
                      />
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => createReply.mutate({ postId: post.id, content: replyContent })}
                        disabled={!replyContent.trim()}
                        loading={createReply.isPending}
                        className="text-xs"
                      >
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
