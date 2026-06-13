"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { enrollmentApi, doubtApi, courseApi, courseExtApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Star, Clock, BookOpen, Play, Check, ChevronDown, ChevronUp,
  Award, Globe, Zap, Shield, MessageSquare, Lock, ShoppingCart,
  Heart, BarChart3, FileText, HelpCircle, Calendar,
  RefreshCw, BadgeCheck, ChevronRight, ChevronLeft, X,
  MonitorSmartphone, Pencil, Trash2, Smartphone, Gift, RotateCcw,
  ArrowRight, Timer,
} from "lucide-react";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

interface Lesson { id: string; title: string; lesson_type: string; duration_seconds?: number; is_published: boolean; }
interface Chapter { id: string; title: string; description?: string; order_index: number; is_free_preview: boolean; lessons: Lesson[]; }
interface Course {
  id: string; slug: string; title: string; description?: string; short_description?: string;
  thumbnail_url?: string; price: number; currency: string; category?: string;
  difficulty_level?: string; language?: string; enrolled_count: number; avg_rating: number;
  review_count: number; total_duration_minutes: number; total_chapters: number;
  certificate_enabled: boolean; tags?: string[]; effective_price?: number; discount_percent?: number;
  updated_at?: string;
  chapters?: Chapter[];
  teacher?: { id: string; full_name: string; avatar_url?: string; teacher_profile?: { bio?: string; expertise_areas?: string[]; credibility_score?: number; total_students?: number; }; };
}

function fmtSec(s: number) { if (!s) return ""; const m = Math.floor(s / 60); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`; }
function fmtMin(minutes: number) { if (!minutes) return ""; if (minutes < 60) return `${minutes}m`; const h = Math.floor(minutes / 60), m = minutes % 60; return m ? `${h}h ${m}m` : `${h}h`; }

function getWYL(course: Course): string[] {
  const map: Record<string, string[]> = {
    "Data Science": ["Analyse real-world datasets end-to-end", "Write production-grade Python code", "Build and evaluate predictive models", "Create compelling data visualisations", "Handle missing data & feature engineering", "Communicate insights to non-technical stakeholders"],
    "Machine Learning": ["Implement ML algorithms from scratch", "Train, evaluate, and tune models", "Apply supervised & unsupervised learning", "Build neural networks with TensorFlow/Keras", "Understand bias-variance trade-off", "Deploy ML models to production"],
    "Web Development": ["Build responsive, accessible UIs", "Implement full authentication flows", "Design and consume REST APIs", "Write clean, maintainable TypeScript", "Optimise for Core Web Vitals", "Deploy apps to cloud platforms"],
    "Programming": ["Master modern JavaScript (ES6+)", "Understand the event loop deeply", "Write asynchronous code confidently", "Apply functional programming patterns", "Debug complex issues systematically", "Contribute to real-world codebases"],
  };
  return map[course.category || ""] || ["Build real-world projects from scratch", "Write clean, professional-grade code", "Understand core concepts deeply", "Apply best practices used in industry", "Debug and solve problems confidently", "Advance your career with marketable skills"];
}

/* ── Company logos (same as homepage StatsSection) ───────────────────────── */
const COMPANY_LOGOS = [
  { name: "Google",    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",          w: 52  },
  { name: "Microsoft", src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", w: 76  },
  { name: "AWS",       src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",  w: 36  },
  { name: "NVIDIA",    src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",               w: 58  },
  { name: "IBM",       src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",                  w: 40  },
];

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor", "Fair", "Average", "Good", "Excellent"];
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110 focus:outline-none">
            <Star className={`h-9 w-9 transition-colors ${i <= (hover || value) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && <p className="text-sm font-semibold text-amber-600 mt-1.5">{labels[hover || value]}</p>}
    </div>
  );
}

function ChapterRow({ chapter, index, isEnrolled }: { chapter: Chapter; index: number; isEnrolled: boolean }) {
  const [open, setOpen] = useState(index === 0);
  const totalSecs = chapter.lessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold text-gray-900 flex-1">{index + 1}. {chapter.title}</span>
        <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
          {chapter.is_free_preview && <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">Free</span>}
          <span>{chapter.lessons.length} lectures{totalSecs ? ` · ${fmtSec(totalSecs)}` : ""}</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden bg-gray-50/80">
            <div className="divide-y divide-gray-100">
              {chapter.lessons.map((lesson) => {
                const canView = chapter.is_free_preview || isEnrolled;
                return (
                  <div key={lesson.id} className="flex items-center gap-3 px-8 py-2.5">
                    {lesson.lesson_type === "quiz" ? <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <Play className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                    <span className={`flex-1 text-sm ${canView ? "text-gray-700" : "text-gray-400"}`}>{lesson.title}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                      {chapter.is_free_preview && <span className="text-violet-600 underline cursor-pointer text-xs">Preview</span>}
                      {lesson.duration_seconds ? fmtSec(lesson.duration_seconds) : null}
                      {!canView && <Lock className="h-3 w-3 text-gray-300" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CourseDetailClient({ course }: { course: Course }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [checkingEnroll, setCheckingEnroll] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [doubtSessions, setDoubtSessions] = useState<any[]>([]);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [bookedSessionIds, setBookedSessionIds] = useState<Set<string>>(new Set());
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundDesc, setRefundDesc] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundDone, setRefundDone] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  const effectivePrice = course.effective_price ?? Number(course.price);
  const isFree = effectivePrice === 0;
  const price = isFree ? "Free" : `₹${Number(effectivePrice).toLocaleString("en-IN")}`;
  const originalPrice = `₹${Math.round(Number(course.price)).toLocaleString("en-IN")}`;
  const discountPct: number = course.discount_percent ?? 0;
  const totalLessons = course.chapters?.reduce((s, c) => s + c.lessons.length, 0) || 0;
  const quizCount = course.chapters?.reduce((s, c) => s + c.lessons.filter(l => l.lesson_type === "quiz").length, 0) || 0;
  const chaptersToShow = showAllChapters ? (course.chapters || []) : (course.chapters || []).slice(0, 7);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", course.id],
    queryFn: () => courseApi.getReviews(course.id).then((r) => r.data),
  });
  const reviews: any[] = reviewsData?.reviews || [];
  const myReview = isAuthenticated() && user ? reviews.find((r: any) => r.student_id === user.id) : null;
  const getStarCount = (star: number) => reviews.filter((r: any) => r.rating === star).length;
  const maxStarCount = Math.max(...[5, 4, 3, 2, 1].map(getStarCount), 1);

  const { data: relatedCoursesData } = useQuery({
    queryKey: ["relatedCourses", course.id, course.category],
    queryFn: () => courseApi.list({ category: course.category, limit: 6 }).then((r) => r.data),
    enabled: !!course.category,
  });
  const relatedCourses = (relatedCoursesData?.courses || []).filter((c: any) => c.id !== course.id).slice(0, 3);

  useEffect(() => {
    if (!isAuthenticated()) { setCheckingEnroll(false); return; }
    enrollmentApi.check(course.id).then(({ data }) => setEnrolled(data.enrolled)).catch(() => {}).finally(() => setCheckingEnroll(false));
  }, [course.id]);

  useEffect(() => {
    if (!enrolled) return;
    setDoubtLoading(true);
    doubtApi.getSessions(course.id).then(({ data }) => setDoubtSessions(data.sessions || [])).catch(() => {}).finally(() => setDoubtLoading(false));
  }, [enrolled, course.id]);

  async function handleSubmitReview() {
    if (!reviewRating) return;
    setReviewSubmitting(true);
    const fd = new FormData();
    fd.append("rating", String(reviewRating));
    if (reviewText.trim()) fd.append("review_text", reviewText.trim());
    try {
      if (editingReview) { await courseExtApi.updateReview(course.id, editingReview.id, fd); toast({ title: "Review updated!" }); }
      else { await courseExtApi.submitReview(course.id, fd); toast({ title: "Review submitted! Thank you." }); }
      queryClient.invalidateQueries({ queryKey: ["reviews", course.id] });
      setShowReviewForm(false); setEditingReview(null); setReviewRating(0); setReviewText("");
    } catch (err: any) { toast({ title: "Error", description: err?.response?.data?.detail || "Could not save review.", variant: "destructive" }); }
    finally { setReviewSubmitting(false); }
  }

  async function handleDeleteReview() {
    if (!myReview) return;
    try {
      await courseExtApi.deleteReview(course.id, myReview.id);
      toast({ title: "Review deleted." });
      queryClient.invalidateQueries({ queryKey: ["reviews", course.id] });
      setShowReviewForm(false); setEditingReview(null); setReviewRating(0); setReviewText("");
    } catch { toast({ title: "Could not delete review.", variant: "destructive" }); }
  }

  async function handleBookDoubtSession(session: any) {
    if (!isAuthenticated()) { router.push(`/login?redirect=/courses/${course.slug}`); return; }
    setBookingSessionId(session.id);
    try {
      if (session.price === 0) { setBookedSessionIds((p) => new Set(p).add(session.id)); setBookingSessionId(null); return; }
      const { data: order } = await doubtApi.initiate(session.id);
      const loaded = await loadRazorpay(); if (!loaded) { setBookingSessionId(null); return; }
      const rzp = new (window as any).Razorpay({ key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", amount: Math.round(order.amount * 100), currency: order.currency || "INR", name: "Brainwave.ai", description: `Doubt Session: ${session.topic || ""}`, order_id: order.razorpay_order_id, prefill: { name: user?.full_name || "", email: user?.email || "" }, theme: { color: "#7c3aed" }, modal: { ondismiss: () => setBookingSessionId(null) }, handler: async (resp: any) => { try { await doubtApi.book(session.id, resp); setBookedSessionIds((p) => new Set(p).add(session.id)); } catch { } finally { setBookingSessionId(null); } } });
      rzp.on("payment.failed", () => setBookingSessionId(null)); rzp.open();
    } catch { setBookingSessionId(null); }
  }

  async function handleRefundRequest() {
    if (!refundReason) return; setRefundLoading(true);
    try {
      const { data: myCoursesData } = await enrollmentApi.myCourses();
      const item = myCoursesData?.courses?.find((c: any) => c.course?.id === course.id || c.course?.slug === course.slug);
      if (!item?.enrollment_id) return;
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/refunds/request?enrollment_id=${item.enrollment_id}&reason=${encodeURIComponent(refundReason)}&description=${encodeURIComponent(refundDesc)}`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      if (resp.ok) { setRefundDone(true); setShowRefundModal(false); }
    } catch { } finally { setRefundLoading(false); }
  }

  async function handleEnroll() {
    if (!isAuthenticated()) { router.push(`/login?redirect=/courses/${course.slug}`); return; }
    setEnrollLoading(true); setEnrollError("");
    try {
      const { data } = await enrollmentApi.initiate(course.id);
      if (data.free || data.enrolled) { setEnrolled(true); setEnrollSuccess(true); setTimeout(() => router.push(`/learn/${course.slug}`), 1000); return; }
      const loaded = await loadRazorpay(); if (!loaded) { setEnrollError("Failed to load payment gateway."); setEnrollLoading(false); return; }
      const rzp = new (window as any).Razorpay({ key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", amount: Math.round(Number(data.amount) * 100), currency: data.currency || "INR", name: "Brainwave.ai", description: data.course_title || course.title, order_id: data.razorpay_order_id, prefill: { name: user?.full_name || "", email: user?.email || "" }, theme: { color: "#7c3aed" }, modal: { ondismiss: () => setEnrollLoading(false) }, handler: async (response: any) => { try { await enrollmentApi.confirm({ ...response, course_id: course.id }); setEnrolled(true); setEnrollSuccess(true); setTimeout(() => router.push(`/learn/${course.slug}`), 1200); } catch { setEnrollError("Payment succeeded but enrollment failed. Contact support."); setEnrollLoading(false); } } });
      rzp.on("payment.failed", (r: any) => { setEnrollError(r.error?.description || "Payment failed."); setEnrollLoading(false); }); rzp.open();
    } catch (err: any) { const msg = err?.response?.data?.detail || "Something went wrong."; if (msg === "Already enrolled") { setEnrolled(true); router.push(`/learn/${course.slug}`); } else setEnrollError(msg); setEnrollLoading(false); }
  }

  /* ─── Buy Card ─────────────────────────────────────────────────────────── */
  const BuyCard = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 cursor-pointer group">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-80 transition-opacity" />
          : <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center"><BookOpen className="h-16 w-16 text-white/40" /></div>}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-gray-900 ml-0.5 fill-gray-900" />
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 py-2.5 bg-gradient-to-t from-black/70 text-center">
          <span className="text-white text-xs font-semibold tracking-wide">Preview this course</span>
        </div>
      </div>

      <div className="p-6">
        {/* Price row */}
        {isFree ? (
          <div className="mb-5"><span className="text-4xl font-bold text-gray-900">Free</span></div>
        ) : (
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            {discountPct > 0 && <span className="text-xl text-gray-400 line-through font-normal">{originalPrice}</span>}
            {discountPct > 0 && <span className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">{discountPct}% OFF</span>}
          </div>
        )}

        <AnimatePresence>
          {enrollSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-700 text-sm font-medium">
              <Check className="h-4 w-4 shrink-0" /> Enrolled! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA buttons */}
        {enrolled ? (
          <Link href={`/learn/${course.slug}`}>
            <button className="w-full py-4 rounded-lg bg-violet-600 text-white font-bold text-base hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 mb-3">
              <Play className="h-5 w-5 fill-white" /> Continue Learning
            </button>
          </Link>
        ) : (
          <>
            <button onClick={handleEnroll} disabled={enrollLoading || checkingEnroll}
              className="w-full py-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-base transition-all flex items-center justify-center gap-2 mb-3 disabled:opacity-60">
              {enrollLoading ? <span className="animate-pulse text-sm">Processing…</span>
                : isFree ? <><ShoppingCart className="h-5 w-5" /> Enroll for Free</>
                : <><ShoppingCart className="h-5 w-5" /> Add to cart</>}
            </button>
            {!isFree && (
              <button onClick={handleEnroll} disabled={enrollLoading || checkingEnroll}
                className="w-full py-4 rounded-lg border-2 border-[#1c1d1f] text-[#1c1d1f] font-bold text-base hover:bg-gray-50 transition-colors flex items-center justify-center mb-3 disabled:opacity-60">
                Buy now
              </button>
            )}
          </>
        )}

        {enrollError && <p className="text-red-500 text-xs text-center mb-3">{enrollError}</p>}
        {!isAuthenticated() && (
          <p className="text-gray-400 text-xs text-center mb-4">
            <Link href="/login" className="text-violet-600 hover:underline font-medium">Sign in</Link> to enroll
          </p>
        )}

        <p className="text-xs text-gray-500 text-center font-medium flex items-center justify-center gap-1.5">
          <Timer className="h-3.5 w-3.5" /> 30-Day Money-Back Guarantee
        </p>
      </div>
    </div>
  );

  const tabs = [{ id: "overview", label: "Overview" }, { id: "curriculum", label: "Curriculum" }, { id: "instructor", label: "Instructor" }, { id: "reviews", label: "Reviews" }, { id: "qa", label: "Q&A" }];

  return (
    <div className="min-h-screen bg-white">

      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <div className="bg-[#1c1d1f]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">

            {/* ── Left hero ─────────────────────────────────────────────── */}
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs text-gray-400 mb-4 flex-wrap">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3 text-gray-600 shrink-0" />
                <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
                {course.category && (<>
                  <ChevronRight className="h-3 w-3 text-gray-600 shrink-0" />
                  <Link href={`/courses?category=${encodeURIComponent(course.category)}`} className="hover:text-white transition-colors">{course.category}</Link>
                </>)}
              </nav>

              {/* Rating + enrollment row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(course.enrolled_count || 0) >= 50 && (
                  <span className="text-xs font-bold bg-[#eceb98] text-[#3d3c0a] px-2.5 py-1 rounded">Bestseller</span>
                )}
                {Number(course.avg_rating) > 0 && (<>
                  <span className="text-sm font-bold text-[#f69c08]">{Number(course.avg_rating).toFixed(1)}</span>
                  <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => (<Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(course.avg_rating) ? "fill-[#f69c08] text-[#f69c08]" : "fill-[#6a6f73] text-[#6a6f73]"}`} />))}</div>
                  <span className="text-sm text-[#cec0fc] underline cursor-pointer">({course.review_count?.toLocaleString()} ratings)</span>
                </>)}
                <span className="text-sm text-gray-300">{course.enrolled_count?.toLocaleString()} students</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">{course.title}</h1>

              {/* Short desc */}
              {course.short_description && <p className="text-[#d1d7dc] text-base leading-relaxed mb-5 max-w-xl">{course.short_description}</p>}

              {/* Instructor meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#d1d7dc] mb-7">
                {course.teacher && (
                  <div className="flex items-center gap-2">
                    {course.teacher.avatar_url
                      ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-7 w-7 rounded-full object-cover" />
                      : <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">{course.teacher.full_name.charAt(0)}</div>}
                    <span>Created by <span className="text-[#cec0fc] underline cursor-pointer">{course.teacher.full_name}</span></span>
                  </div>
                )}
                {course.updated_at && (
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#6a6f73]" />Last updated {new Date(course.updated_at).toLocaleString("en-IN", { month: "long", year: "numeric" })}</span>
                )}
                {course.language && <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[#6a6f73]" />{course.language}</span>}
                {course.certificate_enabled && <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-[#6a6f73]" />Certificate</span>}
              </div>

              {/* Hero buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 transition-all shadow-sm">
                  <Play className="h-4 w-4 fill-gray-900" /> Preview this course
                </button>
                <button onClick={() => setWishlist(!wishlist)} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#d1d7dc] text-white text-sm font-bold hover:bg-white/10 transition-all">
                  <Heart className={`h-4 w-4 ${wishlist ? "fill-white" : ""}`} />{wishlist ? "Wishlisted" : "Add to wishlist"}
                </button>
              </div>
            </div>

            {/* ── Buy card in hero (desktop) ─────────────────────────── */}
            <div className="hidden lg:block">
              <BuyCard />
            </div>
          </div>
        </div>
      </div>

      {/* ══ STICKY TABS ════════════════════════════════════════════════════ */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-[#d1d7dc]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <a key={tab.id} href={`#${tab.id}`} onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-4 text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${activeTab === tab.id ? "text-[#401b9c]" : "text-[#1c1d1f] hover:text-[#401b9c]"}`}>
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="tab-ul" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#401b9c]" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══ BODY ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1340px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-14">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pb-28 lg:pb-0">

            {/* What you'll learn */}
            <section id="overview" className="mb-10">
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-4">What you&apos;ll learn</h2>
              <div className="border border-[#d1d7dc] rounded p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                  {getWYL(course).map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-[#1c1d1f] mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-[#1c1d1f]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Course content */}
            {course.chapters && course.chapters.length > 0 && (
              <section id="curriculum" className="mb-10">
                <h2 className="text-2xl font-bold text-[#1c1d1f] mb-1">Course content</h2>
                <p className="text-sm text-[#6a6f73] mb-4 flex items-center justify-between">
                  <span>{course.chapters.length} sections · {totalLessons} lectures{course.total_duration_minutes ? ` · ${fmtMin(course.total_duration_minutes)} total length` : ""}</span>
                  <button onClick={() => setShowAllChapters(!showAllChapters)} className="text-violet-700 font-semibold text-sm hover:underline">
                    {showAllChapters ? "Collapse all sections" : "Expand all sections"}
                  </button>
                </p>
                <div className="border border-[#d1d7dc] rounded overflow-hidden">
                  {chaptersToShow.map((ch, i) => <ChapterRow key={ch.id} chapter={ch} index={i} isEnrolled={enrolled} />)}
                </div>
                {course.chapters.length > 7 && (
                  <button onClick={() => setShowAllChapters(!showAllChapters)} className="mt-4 text-sm font-bold text-violet-700 hover:text-violet-800 underline">
                    {showAllChapters ? "Show fewer sections" : `Show all ${course.chapters.length} sections`}
                  </button>
                )}
              </section>
            )}

            {/* Requirements */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-4">Requirements</h2>
              <ul className="space-y-2">
                {(course.difficulty_level === "Beginner"
                  ? ["No prior experience required — we start from zero", "A computer with internet access", "Enthusiasm and willingness to practice daily"]
                  : ["Basic programming knowledge is recommended", "Familiarity with the language used in this course", "A computer with internet access"]
                ).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#1c1d1f]">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1c1d1f] shrink-0" />{req}
                  </li>
                ))}
              </ul>
            </section>

            {/* Description */}
            {course.description && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#1c1d1f] mb-4">Description</h2>
                <p className="text-sm text-[#1c1d1f] leading-relaxed whitespace-pre-line">{course.description}</p>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {course.tags.map((tag) => (
                      <span key={tag} className="text-xs font-medium px-3 py-1.5 border border-[#d1d7dc] text-[#1c1d1f] hover:border-[#401b9c] hover:text-[#401b9c] cursor-pointer transition-colors rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* AI Features */}
            <section className="mb-10 bg-violet-50 border border-violet-100 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#1c1d1f] mb-5 flex items-center gap-2"><Zap className="h-5 w-5 text-violet-600" /> AI Superpowers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: MessageSquare, title: "AI Transcript", desc: "Auto-generated searchable transcripts for every lesson", color: "bg-violet-100 text-violet-600" },
                  { icon: FileText, title: "Auto Quiz", desc: "AI creates quizzes from lesson content automatically", color: "bg-indigo-100 text-indigo-600" },
                  { icon: Zap, title: "AI Chatbot", desc: "Trained on this course — ask anything, 24/7", color: "bg-purple-100 text-purple-600" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon className="h-4 w-4" /></div>
                    <p className="font-bold text-[#1c1d1f] text-sm mb-1">{title}</p>
                    <p className="text-xs text-[#6a6f73] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructor */}
            {course.teacher && (
              <section id="instructor" className="mb-10">
                <h2 className="text-2xl font-bold text-[#1c1d1f] mb-5">Instructor</h2>
                <div className="flex items-start gap-5">
                  {course.teacher.avatar_url
                    ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-24 w-24 rounded-full object-cover shrink-0 border border-[#d1d7dc]" />
                    : <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-3xl">{course.teacher.full_name.charAt(0)}</span>
                      </div>}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[#401b9c] hover:text-[#2d0f7a] cursor-pointer flex items-center gap-2">
                      {course.teacher.full_name} <BadgeCheck className="h-5 w-5 text-[#401b9c]" />
                    </h3>
                    {course.teacher.teacher_profile?.expertise_areas && (
                      <p className="text-sm text-[#6a6f73] mt-0.5">{course.teacher.teacher_profile.expertise_areas.join(", ")}</p>
                    )}
                    <div className="flex items-center gap-8 mt-3 mb-4">
                      <div>
                        <p className="text-xl font-bold text-[#1c1d1f]">{course.enrolled_count?.toLocaleString()}</p>
                        <p className="text-xs text-[#6a6f73]">Students</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#1c1d1f]">{course.total_chapters}</p>
                        <p className="text-xs text-[#6a6f73]">Courses</p>
                      </div>
                      {course.teacher.teacher_profile?.credibility_score && (
                        <div>
                          <p className="text-xl font-bold text-[#1c1d1f]">
                            {Number(course.teacher.teacher_profile.credibility_score).toFixed(1)}
                            <Star className="h-4 w-4 fill-[#f69c08] text-[#f69c08] inline ml-1 mb-0.5" />
                          </p>
                          <p className="text-xs text-[#6a6f73]">Rating</p>
                        </div>
                      )}
                    </div>
                    {course.teacher.teacher_profile?.bio && (
                      <p className="text-sm text-[#1c1d1f] leading-relaxed mb-5">{course.teacher.teacher_profile.bio}</p>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#6a6f73] mb-3">Top companies worked with</p>
                      <div className="flex flex-wrap items-center gap-6">
                        {COMPANY_LOGOS.map(({ name, src, w }) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img key={name} src={src} alt={name} width={w} height={20} className="h-5 w-auto object-contain opacity-60 grayscale hover:opacity-90 hover:grayscale-0 transition-all duration-200" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Reviews ─────────────────────────────────────────────────── */}
            <section id="reviews" className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-[#1c1d1f]">Ratings &amp; reviews</h2>
                <div className="flex items-center gap-3">
                  <a href="#reviews" className="text-sm font-semibold text-violet-700 hover:underline flex items-center gap-1">See all reviews <ArrowRight className="h-3.5 w-3.5" /></a>
                </div>
              </div>
              <div className="flex items-center justify-end mb-4">
                {enrolled && (myReview ? (
                  <button onClick={() => { setEditingReview(myReview); setReviewRating(myReview.rating); setReviewText(myReview.review_text || ""); setShowReviewForm(true); }} className="text-sm font-bold text-[#401b9c] border border-[#401b9c] hover:bg-violet-50 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                    <Pencil className="h-3.5 w-3.5" /> Edit review
                  </button>
                ) : (
                  <button onClick={() => { setShowReviewForm(true); setEditingReview(null); }} className="text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                    <Star className="h-3.5 w-3.5" /> Write a review
                  </button>
                ))}
              </div>

              {/* Rating overview */}
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center shrink-0">
                  <p className="text-6xl font-bold text-[#f69c08] leading-none">{course.avg_rating ? Number(course.avg_rating).toFixed(1) : "—"}</p>
                  <div className="flex justify-center gap-0.5 mt-2 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className={`h-5 w-5 ${i <= Math.round(course.avg_rating || 0) ? "fill-[#f69c08] text-[#f69c08]" : "fill-[#d1d7dc] text-[#d1d7dc]"}`} />))}
                  </div>
                  <p className="text-sm text-[#6a6f73] font-semibold">{course.review_count?.toLocaleString()} ratings</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = getStarCount(star);
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    const displayCount = reviews.length ? count.toLocaleString() : "0";
                    return (
                      <div key={star} className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 bg-[#d1d7dc] rounded-full overflow-hidden">
                          <div className="h-full bg-[#f69c08] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`h-3 w-3 ${s <= star ? "fill-[#f69c08] text-[#f69c08]" : "fill-[#d1d7dc] text-[#d1d7dc]"}`} />))}
                        </div>
                        <span className="text-xs text-[#6a6f73] w-12 text-right shrink-0">{displayCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write review form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
                    <div className="border-2 border-violet-200 bg-violet-50/40 rounded-xl p-6">
                      <h3 className="font-bold text-[#1c1d1f] text-base mb-5">{editingReview ? "Edit your review" : "Write a review"}</h3>
                      <div className="mb-5">
                        <p className="text-sm font-semibold text-[#1c1d1f] mb-2">Your Rating *</p>
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <div className="mb-5">
                        <label className="text-sm font-semibold text-[#1c1d1f] block mb-2">Your Review</label>
                        <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} placeholder="Share what you liked or learned. Would you recommend this course?" className="w-full bg-white border border-[#d1d7dc] rounded-lg px-4 py-3 text-sm text-[#1c1d1f] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 resize-none transition-all" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={handleSubmitReview} disabled={!reviewRating || reviewSubmitting} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors">
                          {reviewSubmitting ? "Saving…" : editingReview ? "Update review" : "Submit review"}
                        </button>
                        <button onClick={() => { setShowReviewForm(false); setEditingReview(null); setReviewRating(0); setReviewText(""); }} className="px-6 py-2.5 border border-[#d1d7dc] text-sm font-semibold text-[#1c1d1f] rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                        {editingReview && (
                          <button onClick={handleDeleteReview} className="ml-auto flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Review carousel */}
              {reviewsLoading ? (
                <div className="flex gap-4 animate-pulse border border-[#d1d7dc] rounded-lg p-5">
                  <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#d1d7dc] rounded-lg">
                  <Star className="h-12 w-12 text-[#d1d7dc] mx-auto mb-3" />
                  <p className="font-bold text-[#6a6f73]">No reviews yet</p>
                  <p className="text-sm text-[#6a6f73] mt-1">{enrolled ? "Be the first to review this course!" : "Enroll to leave a review."}</p>
                </div>
              ) : (
                <div className="border border-[#d1d7dc] rounded-lg overflow-hidden">
                  <AnimatePresence mode="wait">
                    {(() => {
                      const safeIndex = Math.min(currentReviewIndex, reviews.length - 1);
                      const review = reviews[safeIndex];
                      if (!review) return null;
                      return (
                        <motion.div key={review.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-5">
                          <div className="flex items-start gap-4">
                            {review.student_avatar
                              ? <img src={review.student_avatar} alt={review.student_name} className="h-12 w-12 rounded-full object-cover shrink-0" />
                              : <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-violet-700 font-bold text-lg">
                                  {(review.student_name || "?").charAt(0).toUpperCase()}
                                </div>}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1c1d1f] text-sm">{review.student_name || "Student"}</p>
                              {review.student_role && <p className="text-xs text-[#6a6f73] mt-0.5">{review.student_role}</p>}
                              <div className="flex items-center gap-2 mt-1.5 mb-2">
                                <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => (<Star key={i} className={`h-3.5 w-3.5 ${i <= review.rating ? "fill-[#f69c08] text-[#f69c08]" : "fill-[#d1d7dc] text-[#d1d7dc]"}`} />))}</div>
                                <span className="text-xs text-[#6a6f73]">{new Date(review.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                              </div>
                              {review.review_text && <p className="text-sm text-[#1c1d1f] leading-relaxed">{review.review_text}</p>}
                              {myReview?.id === review.id && (
                                <div className="flex items-center gap-3 mt-3">
                                  <button onClick={() => { setEditingReview(review); setReviewRating(review.rating); setReviewText(review.review_text || ""); setShowReviewForm(true); }} className="text-xs text-[#401b9c] hover:underline font-semibold flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                                  <button onClick={handleDeleteReview} className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                  {/* Carousel navigation */}
                  <div className="flex items-center justify-between px-5 pb-4">
                    <button onClick={() => setCurrentReviewIndex((p) => Math.max(0, p - 1))} disabled={currentReviewIndex === 0} className="p-1.5 rounded-full border border-[#d1d7dc] hover:border-[#6a6f73] disabled:opacity-30 transition-all">
                      <ChevronLeft className="h-4 w-4 text-[#1c1d1f]" />
                    </button>
                    <div className="flex gap-1.5">
                      {reviews.map((_, i) => (
                        <button key={i} onClick={() => setCurrentReviewIndex(i)} className={`h-2 rounded-full transition-all ${i === currentReviewIndex ? "w-5 bg-[#1c1d1f]" : "w-2 bg-[#d1d7dc] hover:bg-[#6a6f73]"}`} />
                      ))}
                    </div>
                    <button onClick={() => setCurrentReviewIndex((p) => Math.min(reviews.length - 1, p + 1))} disabled={currentReviewIndex === reviews.length - 1} className="p-1.5 rounded-full border border-[#d1d7dc] hover:border-[#6a6f73] disabled:opacity-30 transition-all">
                      <ChevronRight className="h-4 w-4 text-[#1c1d1f]" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Doubt Sessions */}
            {enrolled && (
              <section className="border border-[#d1d7dc] rounded-lg p-6 mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-[#1c1d1f] flex items-center gap-2"><Calendar className="h-5 w-5 text-violet-600" /> Book a Doubt Session</h2>
                  {refundDone && <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">Refund requested</span>}
                </div>
                {doubtLoading ? (<div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 text-violet-400 animate-spin" /></div>
                ) : doubtSessions.length === 0 ? (
                  <div className="text-center py-8 bg-[#f7f9fa] rounded-lg border border-dashed border-[#d1d7dc]">
                    <HelpCircle className="h-10 w-10 text-[#d1d7dc] mx-auto mb-3" />
                    <p className="text-sm text-[#6a6f73]">No sessions available right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doubtSessions.map((session: any) => {
                      const booked = bookedSessionIds.has(session.id);
                      const isBooking = bookingSessionId === session.id;
                      const scheduledDate = new Date(session.scheduled_at);
                      const isPast = scheduledDate < new Date();
                      return (
                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-[#d1d7dc] hover:border-violet-300 hover:bg-violet-50/30 transition-all">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${session.session_type === "one_on_one" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>{session.session_type === "one_on_one" ? "1-on-1" : "Group"}</span>
                              {session.spots_left <= 2 && !isPast && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">{session.spots_left} spot{session.spots_left !== 1 ? "s" : ""} left</span>}
                            </div>
                            <p className="font-semibold text-[#1c1d1f] text-sm truncate">{session.topic || "Doubt Session"}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[#6a6f73]">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                              <span>{session.duration_minutes} mins</span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                            <span className={`text-base font-bold ${session.price === 0 ? "text-green-600" : "text-[#1c1d1f]"}`}>{session.price === 0 ? "Free" : `₹${Number(session.price).toLocaleString("en-IN")}`}</span>
                            {booked ? <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg"><Check className="h-3.5 w-3.5" /> Booked</span>
                              : isPast || session.spots_left === 0 ? <span className="text-xs font-medium text-[#6a6f73] bg-[#f7f9fa] px-3 py-1.5 rounded-lg">{isPast ? "Ended" : "Full"}</span>
                              : <button onClick={() => handleBookDoubtSession(session)} disabled={isBooking} className="text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg transition-all disabled:opacity-50">{isBooking ? "Wait..." : session.price === 0 ? "Reserve" : "Book"}</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {!refundDone && <div className="mt-6 pt-5 border-t border-[#d1d7dc] flex flex-col sm:flex-row items-center justify-between gap-3"><p className="text-sm text-[#6a6f73]">Not satisfied with the course?</p><button onClick={() => setShowRefundModal(true)} className="text-sm font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">Request a Refund</button></div>}
              </section>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="hidden lg:block w-[340px] shrink-0">
            <div className="sticky top-[132px] space-y-6">

              {/* This course includes */}
              <div>
                <p className="text-base font-bold text-[#1c1d1f] mb-4">This course includes:</p>
                <ul className="space-y-3">
                  {[
                    { icon: Clock, text: course.total_duration_minutes ? `${fmtMin(course.total_duration_minutes)} on-demand video` : null },
                    { icon: FileText, text: totalLessons ? `${totalLessons} lectures` : null },
                    { icon: Pencil, text: quizCount > 0 ? `${quizCount} assignments & quizzes` : null },
                    { icon: Award, text: course.certificate_enabled ? "Certificate of completion" : null },
                    { icon: RotateCcw, text: "Lifetime access" },
                    { icon: Smartphone, text: "Access on mobile & TV" },
                  ].filter((i) => i.text).map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-sm text-[#1c1d1f]">
                      <Icon className="h-4 w-4 text-[#6a6f73] shrink-0" />{text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share the gift of learning */}
              <div className="border border-[#d1d7dc] rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Gift className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1c1d1f]">Share the gift of learning</p>
                    <p className="text-xs text-[#6a6f73] mt-1">Gift this course to a friend</p>
                    <a href="#" className="text-violet-700 text-xs font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
                      Buy as a gift <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Apply your skills */}
              <div className="border border-[#d1d7dc] rounded-lg p-5 bg-[#f7f9fa]">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#1c1d1f]">Apply your skills</p>
                    <p className="text-xs text-[#6a6f73] mt-1.5 leading-relaxed">Build real-world projects and strengthen your portfolio.</p>
                    <a href="/courses" className="text-violet-700 text-xs font-semibold mt-3 inline-flex items-center gap-1 hover:underline">
                      View projects <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-violet-200 to-indigo-300 flex items-center justify-center shrink-0 overflow-hidden">
                    <BarChart3 className="h-9 w-9 text-violet-700" />
                  </div>
                </div>
              </div>

              {/* Related courses */}
              {relatedCourses.length > 0 && (
                <div className="border border-[#d1d7dc] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#d1d7dc] bg-white">
                    <p className="font-bold text-base text-[#1c1d1f]">Related courses</p>
                    <Link href="/courses" className="text-violet-700 text-xs font-semibold flex items-center gap-1 hover:underline">
                      See more <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-[#f7f9fa] bg-white">
                    {relatedCourses.map((rc: any) => (
                      <Link key={rc.id} href={`/courses/${rc.slug}`} className="flex items-start gap-3 group px-5 py-4 hover:bg-[#f7f9fa] transition-colors">
                        <div className="h-[60px] w-[88px] rounded overflow-hidden shrink-0 bg-gradient-to-br from-violet-400 to-indigo-500">
                          {rc.thumbnail_url
                            ? <img src={rc.thumbnail_url} alt={rc.title} className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-white/60" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1c1d1f] leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">{rc.title}</p>
                          {rc.teacher && <p className="text-[11px] text-[#6a6f73] mt-0.5 truncate">{rc.teacher.full_name}</p>}
                          <div className="flex items-center gap-1 mt-0.5">
                            {rc.avg_rating > 0 && (<>
                              <span className="text-[11px] font-bold text-[#f69c08]">{Number(rc.avg_rating).toFixed(1)}</span>
                              <div className="flex gap-px">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(rc.avg_rating) ? "fill-[#f69c08] text-[#f69c08]" : "fill-[#d1d7dc] text-[#d1d7dc]"}`} />)}</div>
                              <span className="text-[11px] text-[#6a6f73]">({rc.review_count?.toLocaleString()})</span>
                            </>)}
                          </div>
                          <p className="text-sm font-bold text-[#1c1d1f] mt-0.5">
                            {(rc.effective_price ?? rc.price) === 0 ? "Free" : `₹${Number(rc.effective_price ?? rc.price).toLocaleString("en-IN")}`}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM TRUST BAR ════════════════════════════════════════════════ */}
      <div className="border-t border-[#d1d7dc] bg-[#f7f9fa] mt-4">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageSquare, title: "24/7 Support", desc: "Get help anytime you need" },
              { icon: MonitorSmartphone, title: "Learn on the go", desc: "Access on mobile & TV" },
              { icon: Award, title: "Certificate", desc: "Shareable certificate" },
              { icon: Shield, title: "30-Day Guarantee", desc: "Full refund if not satisfied" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-violet-600" /></div>
                <div>
                  <p className="text-sm font-bold text-[#1c1d1f]">{title}</p>
                  <p className="text-xs text-[#6a6f73]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MOBILE STICKY BAR ═══════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#d1d7dc] px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <div>
            <p className="text-xl font-bold text-[#1c1d1f] leading-none">{price}</p>
            {discountPct > 0 && <p className="text-xs text-[#6a6f73] line-through">{originalPrice}</p>}
          </div>
          <div className="flex-1">
            {enrolled ? (
              <Link href={`/learn/${course.slug}`}><button className="w-full py-3 rounded-lg bg-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2"><Play className="h-4 w-4 fill-white" /> Continue</button></Link>
            ) : (
              <button onClick={handleEnroll} disabled={enrollLoading || checkingEnroll} className="w-full py-3 rounded-lg bg-violet-600 text-white font-bold text-sm disabled:opacity-60">{enrollLoading ? "Processing…" : isFree ? "Enroll Free" : "Buy Now"}</button>
            )}
          </div>
          <button onClick={() => setWishlist(!wishlist)} className="p-2.5 rounded-lg border border-[#d1d7dc] shrink-0"><Heart className={`h-5 w-5 ${wishlist ? "fill-violet-600 text-violet-600" : "text-[#6a6f73]"}`} /></button>
        </div>
      </div>

      {/* ══ REFUND MODAL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRefundModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={(e) => { if (e.target === e.currentTarget) setShowRefundModal(false); }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="text-xl font-bold text-[#1c1d1f]">Request Refund</h3><p className="text-sm text-[#6a6f73] mt-0.5">Reviewed within 2 business days</p></div>
                <button onClick={() => setShowRefundModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="h-5 w-5 text-[#6a6f73]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#1c1d1f] block mb-1.5">Reason *</label>
                  <select value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full bg-white border border-[#d1d7dc] text-[#1c1d1f] rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all">
                    <option value="">Select a reason</option>
                    <option value="content_quality">Content quality not as expected</option>
                    <option value="wrong_course">Enrolled in wrong course</option>
                    <option value="technical_issues">Technical issues</option>
                    <option value="duplicate">Duplicate purchase</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1c1d1f] block mb-1.5">Description</label>
                  <textarea value={refundDesc} onChange={(e) => setRefundDesc(e.target.value)} rows={4} placeholder="Tell us more about your experience…" className="w-full bg-white border border-[#d1d7dc] text-[#1c1d1f] rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleRefundRequest} disabled={!refundReason || refundLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50">{refundLoading ? "Submitting…" : "Submit Request"}</button>
                <button onClick={() => setShowRefundModal(false)} className="flex-1 border border-[#d1d7dc] text-[#1c1d1f] py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
