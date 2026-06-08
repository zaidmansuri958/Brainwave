"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { enrollmentApi, doubtApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Star, Users, Clock, BookOpen, Play, Check, ChevronDown, ChevronUp,
  Award, Globe, Zap, Shield, MessageSquare, Video, Lock, Unlock,
  ArrowRight, Share2, Heart, BarChart3, FileText, HelpCircle, Calendar,
  RefreshCw, Bookmark, GraduationCap, Languages, BadgeCheck, Timer,
  ListVideo, ChevronRight, X,
} from "lucide-react";

// ─── Razorpay loader ───────────────────────────────────────────────────────────
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  duration_seconds?: number;
  is_published: boolean;
}
interface Chapter {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  is_free_preview: boolean;
  lessons: Lesson[];
}
interface Course {
  id: string;
  slug: string;
  title: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  price: number;
  currency: string;
  category?: string;
  difficulty_level?: string;
  language?: string;
  enrolled_count: number;
  avg_rating: number;
  review_count: number;
  total_duration_minutes: number;
  total_chapters: number;
  certificate_enabled: boolean;
  tags?: string[];
  effective_price?: number;
  discount_percent?: number;
  chapters?: Chapter[];
  teacher?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    teacher_profile?: {
      bio?: string;
      expertise_areas?: string[];
      credibility_score?: number;
      total_students?: number;
    };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtSec(seconds: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
function fmtMin(minutes: number) {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ─── What you'll learn ────────────────────────────────────────────────────────
function getWYL(course: Course): string[] {
  const map: Record<string, string[]> = {
    "Data Science": ["Analyse real-world datasets end-to-end", "Write production-grade Python code", "Build and evaluate predictive models", "Create compelling data visualisations", "Handle missing data and feature engineering", "Communicate insights to non-technical stakeholders"],
    "Machine Learning": ["Implement ML algorithms from scratch", "Train, evaluate, and tune models", "Apply supervised & unsupervised learning", "Build neural networks with TensorFlow/Keras", "Understand bias-variance trade-off", "Deploy ML models to production"],
    "Web Development": ["Build responsive, accessible UIs", "Implement full authentication flows", "Design and consume REST APIs", "Write clean, maintainable TypeScript", "Optimise for Core Web Vitals", "Deploy apps to cloud platforms"],
    "Backend Development": ["Design RESTful APIs following best practices", "Implement JWT authentication", "Model SQL and NoSQL databases", "Write efficient async Node.js code", "Add real-time features with WebSockets", "Containerise apps with Docker"],
    "Programming": ["Master modern JavaScript (ES6+)", "Understand the event loop deeply", "Write asynchronous code confidently", "Apply functional programming patterns", "Debug complex issues systematically", "Contribute to real-world codebases"],
    "System Design": ["Design systems that scale to millions", "Architect distributed fault-tolerant services", "Choose the right database for each use case", "Implement caching strategies correctly", "Ace system design interviews", "Draw clear professional architecture diagrams"],
  };
  return map[course.category || ""] || ["Build real-world projects from scratch", "Write clean, professional-grade code", "Understand core concepts deeply", "Apply best practices used in industry", "Debug and solve problems confidently", "Advance your career with marketable skills"];
}

// ─── Chapter accordion ────────────────────────────────────────────────────────
function ChapterRow({ chapter, index, isEnrolled }: { chapter: Chapter; index: number; isEnrolled: boolean }) {
  const [open, setOpen] = useState(index === 0);
  const totalSecs = chapter.lessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);

  const typeIcon = (t: string) => {
    if (t === "quiz") return <FileText className="h-3.5 w-3.5 text-violet-500" />;
    if (t === "document") return <BookOpen className="h-3.5 w-3.5 text-violet-500" />;
    return <Play className="h-3.5 w-3.5 text-violet-500 fill-violet-500" />;
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{chapter.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {chapter.lessons.length} lessons{totalSecs ? ` · ${fmtSec(totalSecs)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {chapter.is_free_preview && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Free Preview
            </span>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {chapter.lessons.map((lesson) => {
                const canView = chapter.is_free_preview || isEnrolled;
                return (
                  <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 hover:bg-violet-50/40 transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 shrink-0">
                      {typeIcon(lesson.lesson_type || "video")}
                    </div>
                    <span className={`flex-1 text-sm ${canView ? "text-gray-700" : "text-gray-400"}`}>
                      {lesson.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.duration_seconds ? (
                        <span className="text-xs text-gray-400">{fmtSec(lesson.duration_seconds)}</span>
                      ) : null}
                      {canView
                        ? <Unlock className="h-3.5 w-3.5 text-green-500" />
                        : <Lock className="h-3.5 w-3.5 text-gray-300" />}
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

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
        <Icon className="h-4 w-4 text-violet-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CourseDetailClient({ course }: { course: Course }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [checkingEnroll, setCheckingEnroll] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Doubt sessions state
  const [doubtSessions, setDoubtSessions] = useState<any[]>([]);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [bookedSessionIds, setBookedSessionIds] = useState<Set<string>>(new Set());

  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundDesc, setRefundDesc] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundDone, setRefundDone] = useState(false);

  const effectivePrice = course.effective_price ?? Number(course.price);
  const isFree = effectivePrice === 0;
  const price = isFree ? "Free" : `₹${Number(effectivePrice).toLocaleString("en-IN")}`;
  const discountPct: number = course.discount_percent ?? 0;
  const totalLessons = course.chapters?.reduce((s, c) => s + c.lessons.length, 0) || 0;
  const whatYouLearn = getWYL(course);

  useEffect(() => {
    if (!isAuthenticated()) { setCheckingEnroll(false); return; }
    enrollmentApi.check(course.id)
      .then(({ data }) => setEnrolled(data.enrolled))
      .catch(() => {})
      .finally(() => setCheckingEnroll(false));
  }, [course.id]);

  useEffect(() => {
    if (!enrolled) return;
    setDoubtLoading(true);
    doubtApi.getSessions(course.id)
      .then(({ data }) => setDoubtSessions(data.sessions || []))
      .catch(() => {})
      .finally(() => setDoubtLoading(false));
  }, [enrolled, course.id]);

  async function handleBookDoubtSession(session: any) {
    if (!isAuthenticated()) { router.push(`/login?redirect=/courses/${course.slug}`); return; }
    setBookingSessionId(session.id);
    try {
      if (session.price === 0) {
        setBookedSessionIds((prev) => new Set(prev).add(session.id));
        setBookingSessionId(null);
        return;
      }
      const { data: order } = await doubtApi.initiate(session.id);
      const loaded = await loadRazorpay();
      if (!loaded) { setBookingSessionId(null); return; }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Math.round(order.amount * 100),
        currency: order.currency || "INR",
        name: "Brainwave.ai",
        description: `Doubt Session: ${session.topic || session.title}`,
        order_id: order.razorpay_order_id,
        prefill: { name: user?.full_name || "", email: user?.email || "" },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => setBookingSessionId(null) },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await doubtApi.book(session.id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookedSessionIds((prev) => new Set(prev).add(session.id));
          } catch { } finally { setBookingSessionId(null); }
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => setBookingSessionId(null));
      rzp.open();
    } catch { setBookingSessionId(null); }
  }

  async function handleRefundRequest() {
    if (!refundReason) return;
    setRefundLoading(true);
    try {
      const { data: myCoursesData } = await enrollmentApi.myCourses();
      const enrolledItem = myCoursesData?.courses?.find((c: any) => c.course?.id === course.id || c.course?.slug === course.slug);
      if (!enrolledItem?.enrollment_id) return;
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/refunds/request?enrollment_id=${enrolledItem.enrollment_id}&reason=${encodeURIComponent(refundReason)}&description=${encodeURIComponent(refundDesc)}`,
        { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      if (resp.ok) { setRefundDone(true); setShowRefundModal(false); }
    } catch { } finally { setRefundLoading(false); }
  }

  async function handleEnroll() {
    if (!isAuthenticated()) { router.push(`/login?redirect=/courses/${course.slug}`); return; }
    setEnrollLoading(true);
    setEnrollError("");
    try {
      const { data } = await enrollmentApi.initiate(course.id);
      if (data.free || data.enrolled) {
        setEnrolled(true);
        setEnrollSuccess(true);
        setTimeout(() => router.push(`/learn/${course.slug}`), 1000);
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded) { setEnrollError("Failed to load payment gateway."); setEnrollLoading(false); return; }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Math.round(Number(data.amount) * 100),
        currency: data.currency || "INR",
        name: "Brainwave.ai",
        description: data.course_title || course.title,
        order_id: data.razorpay_order_id,
        prefill: { name: user?.full_name || "", email: user?.email || "" },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => setEnrollLoading(false) },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await enrollmentApi.confirm({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id,
            });
            setEnrolled(true);
            setEnrollSuccess(true);
            setTimeout(() => router.push(`/learn/${course.slug}`), 1200);
          } catch {
            setEnrollError("Payment succeeded but enrollment failed. Contact support.");
            setEnrollLoading(false);
          }
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setEnrollError(resp.error?.description || "Payment failed.");
        setEnrollLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Something went wrong.";
      if (msg === "Already enrolled") { setEnrolled(true); router.push(`/learn/${course.slug}`); }
      else setEnrollError(msg);
      setEnrollLoading(false);
    }
  }

  // ─── Enroll / Go CTA button ──────────────────────────────────────────────
  const EnrollButton = ({ className = "" }: { className?: string }) => (
    enrolled ? (
      <Link href={`/learn/${course.slug}`} className={className}>
        <button className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-violet-200">
          <Play className="h-4 w-4 fill-white" /> Continue Learning
        </button>
      </Link>
    ) : (
      <button
        onClick={handleEnroll}
        disabled={enrollLoading || checkingEnroll}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md ${isFree ? "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200" : "bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-amber-200"} ${className}`}
      >
        {enrollLoading
          ? <span className="animate-pulse">Processing…</span>
          : <>{isFree ? "Enroll for Free" : `Buy for ${price}`} <ArrowRight className="h-4 w-4" /></>}
      </button>
    )
  );

  // ─── Buy / Sidebar card ──────────────────────────────────────────────────
  const BuyCard = () => (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-90" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700">
              <BookOpen className="h-14 w-14 text-white/60" />
            </div>}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Play className="h-5 w-5 text-violet-600 ml-0.5 fill-violet-600" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-center">
          <span className="text-xs font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            Preview this course
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Price */}
        <div className="flex items-baseline gap-3 mb-1">
          {isFree ? (
            <span className="text-3xl font-extrabold text-violet-600">FREE</span>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-gray-900">{price}</span>
              {discountPct > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{Math.round(Number(course.price)).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-5">
          {isFree ? "Free forever · No credit card required" : "One-time payment · Lifetime access"}
        </p>

        <AnimatePresence>
          {enrollSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2 text-green-700 text-sm font-medium"
            >
              <Check className="h-4 w-4 shrink-0" /> Enrolled! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        <EnrollButton />

        {enrollError && (
          <p className="mt-3 text-red-500 text-xs text-center">{enrollError}</p>
        )}
        {!isAuthenticated() && (
          <p className="mt-3 text-gray-400 text-xs text-center">
            <Link href="/login" className="text-violet-600 hover:underline font-medium">Sign in</Link> to enroll
          </p>
        )}

        {/* Save / Share */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setWishlist(!wishlist)}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${wishlist ? "border-violet-200 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"}`}
          >
            <Bookmark className={`h-4 w-4 ${wishlist ? "fill-violet-600" : ""}`} />
            {wishlist ? "Saved" : "Save"}
          </button>
          <button
            onClick={async () => {
              const url = window.location.href;
              if (navigator.share) {
                await navigator.share({ title: course.title, url }).catch(() => {});
              } else {
                await navigator.clipboard.writeText(url).catch(() => {});
                toast({ title: "Link copied!", description: "Course link copied to clipboard." });
              }
            }}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 flex items-center justify-center gap-1.5 transition-all">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        {/* Stats table */}
        <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
          {[
            { icon: Timer,         label: "Total Length",  value: fmtMin(course.total_duration_minutes) || "—" },
            { icon: ListVideo,     label: "Lectures",      value: `${totalLessons}` },
            { icon: BarChart3,     label: "Skill Level",   value: course.difficulty_level || "All Levels" },
            { icon: Users,         label: "Students",      value: course.enrolled_count?.toLocaleString() || "0" },
            { icon: Languages,     label: "Language",      value: course.language || "English" },
            { icon: BadgeCheck,    label: "Certificate",   value: course.certificate_enabled ? "Yes" : "No" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </div>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview",    label: "Overview" },
    { id: "curriculum",  label: "Curriculum" },
    { id: "instructor",  label: "Instructor" },
    { id: "reviews",     label: "Reviews" },
    { id: "ai-features", label: "AI Features" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero strip ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-violet-300 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            {course.category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/courses?category=${encodeURIComponent(course.category)}`} className="hover:text-white transition-colors">{course.category}</Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60 truncate max-w-[180px]">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
            {/* Left */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-400 text-gray-900 px-3 py-1 rounded-full">
                  Bestseller
                </span>
                {course.category && (
                  <span className="text-xs font-semibold bg-white/10 text-violet-200 border border-white/10 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight mb-4">
                {course.title}
              </h1>

              {course.short_description && (
                <p className="text-violet-200 text-base leading-relaxed mb-6 max-w-2xl">
                  {course.short_description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {Number(course.avg_rating) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-4 w-4 ${i <= Math.round(course.avg_rating) ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                      ))}
                    </div>
                    <span className="text-amber-400 font-bold text-sm">{Number(course.avg_rating).toFixed(1)}</span>
                    <span className="text-violet-300 text-xs">({course.review_count?.toLocaleString()} ratings)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-violet-200 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled_count?.toLocaleString()} students</span>
                </div>
                {course.difficulty_level && (
                  <div className="flex items-center gap-1.5 text-violet-200 text-sm">
                    <BarChart3 className="h-4 w-4" />
                    <span>{course.difficulty_level}</span>
                  </div>
                )}
              </div>

              {/* Teacher */}
              {course.teacher && (
                <div className="flex items-center gap-3 mt-4">
                  {course.teacher.avatar_url
                    ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-400/40" />
                    : <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center ring-2 ring-violet-400/40">
                        <span className="text-white font-bold text-sm">{course.teacher.full_name.charAt(0)}</span>
                      </div>}
                  <div>
                    <p className="text-[11px] text-violet-400">Created by</p>
                    <p className="text-sm font-semibold text-white hover:text-violet-300 cursor-pointer">{course.teacher.full_name}</p>
                  </div>
                </div>
              )}

              {/* CTA (hero, mobile-only below) */}
              <div className="mt-8 flex flex-wrap items-center gap-3 lg:hidden">
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading || checkingEnroll || enrolled}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg ${isFree || enrolled ? "bg-violet-500 hover:bg-violet-600 text-white" : "bg-amber-400 hover:bg-amber-500 text-gray-900"} disabled:opacity-60 transition-all`}
                >
                  {enrolled ? <><Play className="h-4 w-4 fill-white" /> Continue Learning</> : isFree ? "Enroll for Free" : `Buy for ${price}`}
                  {!enrolled && <ArrowRight className="h-4 w-4" />}
                </button>
                <button onClick={() => setWishlist(!wishlist)}
                  className="p-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors">
                  <Bookmark className={`h-4 w-4 ${wishlist ? "fill-white" : ""}`} />
                </button>
              </div>
            </div>

            {/* Right — BuyCard (desktop only in hero) */}
            <div className="hidden lg:block">
              <BuyCard />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky tab nav ────────────────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? "text-violet-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6 pb-28 lg:pb-0">

            {/* What you'll learn */}
            <motion.section
              id="overview"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
            >
              <SectionHeading icon={BookOpen} title="What You'll Learn" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 shrink-0">
                      <Check className="h-3 w-3 text-violet-600" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Requirements */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <SectionHeading icon={FileText} title="Requirements" />
              <ul className="space-y-2.5">
                {(course.difficulty_level === "Beginner"
                  ? ["No prior experience required — we start from zero", "A computer with internet access", "Enthusiasm and willingness to practice daily"]
                  : ["Basic programming knowledge is recommended", "Familiarity with the language used in this course", "A computer with internet access"]
                ).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            {/* About this course */}
            {course.description && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeading icon={HelpCircle} title="About This Course" />
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {course.tags.map((tag) => (
                      <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Curriculum */}
            {course.chapters && course.chapters.length > 0 && (
              <section id="curriculum" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                      <ListVideo className="h-4 w-4 text-violet-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Curriculum</h2>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {course.chapters.length} chapters · {totalLessons} lessons
                  </span>
                </div>
                <div className="space-y-2.5">
                  {course.chapters.map((ch, i) => (
                    <ChapterRow key={ch.id} chapter={ch} index={i} isEnrolled={enrolled} />
                  ))}
                </div>
              </section>
            )}

            {/* Instructor */}
            {course.teacher && (
              <section id="instructor" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeading icon={GraduationCap} title="Your Instructor" />
                <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
                  {course.teacher.avatar_url
                    ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-20 w-20 rounded-2xl object-cover border border-gray-200 shrink-0" />
                    : <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-2xl">{course.teacher.full_name.charAt(0)}</span>
                      </div>}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{course.teacher.full_name}</h3>
                    {course.teacher.teacher_profile?.expertise_areas && (
                      <p className="text-sm text-violet-600 font-medium mt-0.5">
                        {course.teacher.teacher_profile.expertise_areas.join(", ")}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 mb-4">
                      {course.teacher.teacher_profile?.credibility_score && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span>{Number(course.teacher.teacher_profile.credibility_score).toFixed(1)} rating</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{course.enrolled_count?.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <BadgeCheck className="h-4 w-4 text-violet-500" />
                        <span>Expert verified</span>
                      </div>
                    </div>
                    {course.teacher.teacher_profile?.bio && (
                      <p className="text-sm text-gray-600 leading-relaxed">{course.teacher.teacher_profile.bio}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Student Reviews */}
            <section id="reviews" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                    <Star className="h-4 w-4 text-violet-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Student Reviews</h2>
                </div>
                <button className="flex items-center gap-1.5 text-sm font-medium text-violet-600 border border-violet-200 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
                  <FileText className="h-3.5 w-3.5" /> Write a Review
                </button>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-gray-900">
                    {course.avg_rating ? Number(course.avg_rating).toFixed(1) : "—"}
                  </p>
                  <div className="flex justify-center mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-4 w-4 ${i <= Math.round(course.avg_rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Based on {course.review_count?.toLocaleString() || 0} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: star === 5 ? "70%" : star === 4 ? "20%" : star === 3 ? "6%" : star === 2 ? "3%" : "1%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-4 text-right">{star}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI Features */}
            <section id="ai-features" className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6 sm:p-8">
              <SectionHeading icon={Zap} title="AI Superpowers" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: MessageSquare, title: "AI Transcript", desc: "Auto-generated, searchable transcripts for every lesson", color: "bg-violet-100 text-violet-600" },
                  { icon: FileText,      title: "Auto Quiz",     desc: "AI creates custom quizzes from lesson content",       color: "bg-indigo-100 text-indigo-600" },
                  { icon: Zap,           title: "AI Chatbot",    desc: "Trained on this course — ask anything, 24/7",        color: "bg-purple-100 text-purple-600" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="bg-white rounded-xl border border-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Features */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <SectionHeading icon={Shield} title="Course Features" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Users,         val: course.enrolled_count?.toLocaleString() || "0", label: "Enrolled Students" },
                  { icon: Clock,         val: fmtMin(course.total_duration_minutes) || "—",   label: "On-Demand Video" },
                  { icon: BookOpen,      val: `${totalLessons}`,                              label: "Downloadable Resources" },
                  { icon: Award,         val: course.certificate_enabled ? "Yes" : "No",     label: "Certificate of Completion" },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <Icon className="h-6 w-6 text-violet-500 mb-2" />
                    <p className="font-bold text-gray-900 text-base">{val}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Doubt Sessions (enrolled only) */}
            {enrolled && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                      <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Book a Session</h2>
                  </div>
                  {refundDone && (
                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      Refund requested
                    </span>
                  )}
                </div>

                {doubtLoading ? (
                  <div className="flex justify-center py-10">
                    <RefreshCw className="h-7 w-7 text-violet-400 animate-spin" />
                  </div>
                ) : doubtSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                    <HelpCircle className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">No sessions available right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doubtSessions.map((session: any) => {
                      const booked = bookedSessionIds.has(session.id);
                      const isBooking = bookingSessionId === session.id;
                      const scheduledDate = new Date(session.scheduled_at);
                      const isPast = scheduledDate < new Date();
                      return (
                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${session.session_type === "one_on_one" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>
                                {session.session_type === "one_on_one" ? "1-on-1" : "Group"}
                              </span>
                              {session.spots_left <= 2 && !isPast && (
                                <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full animate-pulse">
                                  {session.spots_left} spot{session.spots_left !== 1 ? "s" : ""} left
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900 truncate">{session.topic || "Doubt Session"}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span>{session.duration_minutes} mins</span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                            <span className={`text-lg font-bold ${session.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                              {session.price === 0 ? "Free" : `₹${Number(session.price).toLocaleString("en-IN")}`}
                            </span>
                            {booked ? (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                                <Check className="h-3.5 w-3.5" /> Booked
                              </span>
                            ) : isPast || session.spots_left === 0 ? (
                              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-4 py-2 rounded-xl">
                                {isPast ? "Ended" : "Full"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBookDoubtSession(session)}
                                disabled={isBooking}
                                className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
                              >
                                {isBooking ? "Wait..." : session.price === 0 ? "Reserve" : "Book"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!refundDone && (
                  <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">Not satisfied with the course?</p>
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2 rounded-xl transition-colors"
                    >
                      Request a Refund
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── Right sidebar (desktop, below hero) ─────────────────────────── */}
          <div className="hidden lg:block w-[340px] xl:w-[360px] shrink-0">
            <div className="sticky top-[132px] space-y-4">
              <BuyCard />

              {/* 30-day guarantee */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">30-Day Money Back Guarantee</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Full refund if you're not happy — no questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bar ─────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <div>
            <p className="text-lg font-extrabold text-gray-900 leading-none">{price}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Lifetime access</p>
          </div>
          <div className="flex-1">
            <EnrollButton />
          </div>
          <button onClick={() => setWishlist(!wishlist)} className="p-2.5 rounded-xl border border-gray-200 hover:bg-violet-50 transition-colors shrink-0">
            <Bookmark className={`h-4 w-4 ${wishlist ? "fill-violet-600 text-violet-600" : "text-gray-500"}`} />
          </button>
        </div>
      </div>

      {/* ── Refund Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRefundModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowRefundModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Request Refund</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Reviewed within 2 business days</p>
                </div>
                <button onClick={() => setShowRefundModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason *</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
                  >
                    <option value="">Select a reason</option>
                    <option value="content_quality">Content quality not as expected</option>
                    <option value="wrong_course">Enrolled in wrong course</option>
                    <option value="technical_issues">Technical issues</option>
                    <option value="duplicate">Duplicate purchase</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
                  <textarea
                    value={refundDesc}
                    onChange={(e) => setRefundDesc(e.target.value)}
                    rows={4}
                    placeholder="Tell us more about your experience…"
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRefundRequest}
                  disabled={!refundReason || refundLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm shadow-red-200"
                >
                  {refundLoading ? "Submitting…" : "Submit Request"}
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 border border-gray-200 bg-white text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
