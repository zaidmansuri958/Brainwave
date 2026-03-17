"use client";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { enrollmentApi } from "@/lib/api";
import { formatPrice, formatDuration, generateWhatsAppLink } from "@/lib/utils";
import {
  Star, Users, Clock, BookOpen, CheckCircle, Play,
  Share2, Award, Shield, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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
        // Razorpay payment flow
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
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl">
            {course.category && (
              <span className="text-primary-400 text-sm font-semibold uppercase tracking-wide">
                {course.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mt-2">{course.title}</h1>
            <p className="text-gray-300 mt-3 text-lg">{course.short_description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {Number(course.avg_rating).toFixed(1)} ({course.review_count} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {course.enrolled_count.toLocaleString()} students
              </span>
              {course.total_duration_minutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {formatDuration(course.total_duration_minutes)}
                </span>
              )}
              {course.language && <span>🌐 {course.language}</span>}
              {course.difficulty_level && (
                <span className="capitalize bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                  {course.difficulty_level}
                </span>
              )}
            </div>

            {course.teacher && (
              <p className="text-gray-400 mt-2 text-sm">
                Created by <span className="text-primary-400 font-medium">{course.teacher.full_name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About This Course</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{course.description}</p>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag: string) => (
                  <span key={tag} className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Curriculum */}
            {chapters.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Course Curriculum
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({chapters.length} chapters · {chapters.reduce((acc: number, ch: any) => acc + (ch.lessons?.length || 0), 0)} lessons)
                  </span>
                </h2>
                <div className="space-y-2">
                  {chapters.map((chapter: any) => (
                    <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-primary-600" />
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{chapter.title}</span>
                          <span className="text-xs text-gray-500">({chapter.lessons?.length || 0} lessons)</span>
                        </div>
                        {expandedChapter === chapter.id
                          ? <ChevronUp className="h-4 w-4 text-gray-400" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </button>

                      {expandedChapter === chapter.id && chapter.lessons && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {chapter.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="px-4 py-3 flex items-center gap-3">
                              <Play className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{lesson.title}</span>
                              {lesson.duration_seconds && (
                                <span className="ml-auto text-xs text-gray-400">
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

            {/* Certificate info */}
            {course.certificate_enabled && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                <Award className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-300">Blockchain-Verified Certificate</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                    Complete the course and receive a certificate issued by Brainwave.ai. Share the link — anyone can verify it instantly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Purchase card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              {/* Thumbnail */}
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover" />
              )}

              <div className="p-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {formatPrice(Number(course.price), course.currency)}
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => router.push(`/learn/${course.slug}`)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <CheckCircle className="h-5 w-5" /> Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors min-h-[48px]"
                  >
                    {enrollMutation.isPending ? "Processing..." : course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                  </button>
                )}

                {/* Share on WhatsApp */}
                <a
                  href={generateWhatsAppLink(course.title, course.short_description || "", course.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors min-h-[48px]"
                >
                  <Share2 className="h-4 w-4" /> Share on WhatsApp
                </a>

                {/* Course includes */}
                <div className="mt-6 space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">This course includes:</p>
                  {[
                    `${course.total_chapters} chapters`,
                    "AI-powered chatbot assistant",
                    "Course community group",
                    "Downloadable materials",
                    course.certificate_enabled ? "Blockchain certificate" : null,
                  ].filter(Boolean).map((item) => (
                    <div key={item as string} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
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
