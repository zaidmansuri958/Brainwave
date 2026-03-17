"use client";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { enrollmentApi } from "@/lib/api";
import { formatPrice, formatDuration, generateWhatsAppLink } from "@/lib/utils";
import {
  Star, Users, Clock, BookOpen, CheckCircle, Play,
  Share2, Award, Shield, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CourseDetailClient({ course }: { course: any }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const { data: enrollmentStatus } = useQuery({
    queryKey: ["enrollment", course.id],
    queryFn: () => enrollmentApi.check(course.id).then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const isEnrolled = enrollmentStatus?.enrolled;

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentApi.initiate(course.id),
    onSuccess: (res) => {
      const data = res.data;
      if (data.free) {
        toast({ title: "Enrolled!", description: "Welcome to the course!" });
        router.push(`/learn/${course.slug}`);
      } else {
        const rzp = (window as any).Razorpay;
        if (!rzp) {
          toast({ title: "Error", description: "Payment system unavailable", variant: "destructive" });
          return;
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount * 100,
          currency: data.currency,
          name: "Brainwave.ai",
          description: `Enroll in ${course.title}`,
          order_id: data.razorpay_order_id,
          handler: async (response: any) => {
            try {
              await enrollmentApi.confirm({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                course_id: course.id,
              });
              toast({ title: "Enrolled!", description: "Payment successful. Welcome to the course!" });
              router.push(`/learn/${course.slug}`);
            } catch {
              toast({ title: "Error", description: "Enrollment failed", variant: "destructive" });
            }
          },
          prefill: { name: user?.full_name, email: user?.email },
        };
        new rzp(options).open();
      }
    },
    onError: () => {
      if (!isAuthenticated()) {
        router.push("/login");
      } else {
        toast({ title: "Error", description: "Please try again", variant: "destructive" });
      }
    },
  });

  const chapters = course.chapters || [];

  return (
    <main className="flex-1">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-violet-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {course.category && (
                <Badge variant="glass" className="text-white/90 border-white/20 bg-white/10 backdrop-blur-sm">
                  {course.category}
                </Badge>
              )}
              {course.difficulty_level && (
                <Badge variant="glass" className="text-white/90 border-white/20 bg-white/10 backdrop-blur-sm capitalize">
                  {course.difficulty_level}
                </Badge>
              )}
              {course.language && (
                <Badge variant="glass" className="text-white/90 border-white/20 bg-white/10 backdrop-blur-sm">
                  {course.language}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-white/70 mt-4 text-lg leading-relaxed">{course.short_description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold">{Number(course.avg_rating).toFixed(1)}</span>
                ({course.review_count} reviews)
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {course.enrolled_count.toLocaleString()} students
              </span>
              {course.total_duration_minutes > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {formatDuration(course.total_duration_minutes)}
                </span>
              )}
            </div>

            {course.teacher && (
              <div className="flex items-center gap-3 mt-6">
                <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shadow-glow">
                  {course.teacher.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-white/50">Created by</p>
                  <p className="text-white font-semibold">{course.teacher.full_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {course.description && (
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-500" />
                  About This Course
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{course.description}</p>
              </div>
            )}

            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag: string) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            )}

            {chapters.length > 0 && (
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                  Course Curriculum
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {chapters.length} chapters &middot; {chapters.reduce((acc: number, ch: any) => acc + (ch.lessons?.length || 0), 0)} lessons
                </p>

                <div className="space-y-3">
                  {chapters.map((chapter: any, idx: number) => (
                    <div key={chapter.id} className="glass rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-lg gradient-bg text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-foreground text-sm">{chapter.title}</span>
                          <span className="text-xs text-muted-foreground">({chapter.lessons?.length || 0} lessons)</span>
                        </div>
                        {expandedChapter === chapter.id
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>

                      {expandedChapter === chapter.id && chapter.lessons && (
                        <div className="border-t border-border/30">
                          {chapter.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                              <Play className="h-4 w-4 text-primary-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground flex-1">{lesson.title}</span>
                              {lesson.duration_seconds && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.floor(lesson.duration_seconds / 60)}m
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.certificate_enabled && (
              <div className="glass-card p-6 flex items-start gap-4 border-amber-500/20">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Verified Certificate</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Complete the course and receive a certificate issued by Brainwave.ai.
                    Share the link &mdash; anyone can verify it instantly.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 glass-card rounded-3xl overflow-hidden shadow-glass-lg">
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover" />
              )}

              <div className="p-6">
                <div className="text-3xl font-bold text-foreground mb-6">
                  {formatPrice(Number(course.price), course.currency)}
                </div>

                {isEnrolled ? (
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full rounded-2xl"
                    onClick={() => router.push(`/learn/${course.slug}`)}
                  >
                    <CheckCircle className="h-5 w-5" /> Continue Learning
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full rounded-2xl"
                    loading={enrollMutation.isPending}
                    onClick={() => enrollMutation.mutate()}
                  >
                    {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                  </Button>
                )}

                <a
                  href={generateWhatsAppLink(course.title, course.short_description || "", course.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="glass"
                    size="lg"
                    className="w-full rounded-2xl mt-3 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                  >
                    <Share2 className="h-4 w-4" /> Share on WhatsApp
                  </Button>
                </a>

                <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                  <p className="font-semibold text-foreground text-sm">This course includes:</p>
                  {[
                    `${course.total_chapters} chapters`,
                    "AI-powered chatbot assistant",
                    "Course community group",
                    "Downloadable materials",
                    course.certificate_enabled ? "Verified certificate" : null,
                  ].filter(Boolean).map((item) => (
                    <div key={item as string} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
