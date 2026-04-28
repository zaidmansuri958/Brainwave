"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { enrollmentApi, doubtApi } from "@/lib/api";
import {
  Star, Users, Clock, BookOpen, Play, Check, ChevronDown, ChevronUp,
  Award, Globe, Zap, Shield, MessageSquare, Video, Lock, Unlock,
  ArrowRight, Share2, Heart, BarChart3, FileText, HelpCircle, Calendar,
  RefreshCw,
} from "lucide-react";
import { AIBadge } from "@/components/ui/ai-badge";

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
    if (t === "document") return <BookOpen className="h-3.5 w-3.5 text-amber-500" />;
    return <Play className="h-3.5 w-3.5 text-indigo-500" />;
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium shrink-0">Ch {index + 1}</span>
            <h4 className="text-gray-900 font-semibold text-sm">{chapter.title}</h4>
            {chapter.is_free_preview && (
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Preview
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            {chapter.lessons.length} lessons{totalSecs ? ` · ${fmtSec(totalSecs)}` : ""}
          </p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden"
          >
            <div className="border-t border-gray-100">
              {chapter.lessons.map((lesson) => {
                const canView = chapter.is_free_preview || isEnrolled;
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="shrink-0">{typeIcon(lesson.lesson_type || "video")}</div>
                    <span className={`flex-1 text-sm ${canView ? "text-gray-700" : "text-gray-400"}`}>{lesson.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.duration_seconds ? (
                        <span className="text-[11px] text-gray-400">{fmtSec(lesson.duration_seconds)}</span>
                      ) : null}
                      {canView
                        ? <Unlock className="h-3 w-3 text-emerald-500" />
                        : <Lock className="h-3 w-3 text-gray-300" />}
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

  const isFree = Number(course.price) === 0;
  const price = isFree ? "Free" : `₹${Number(course.price).toLocaleString("en-IN")}`;
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
        // Free session — book directly (no payment needed, skip to confirmation)
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
        theme: { color: "#4F46E5" },
        modal: { ondismiss: () => setBookingSessionId(null) },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await doubtApi.book(session.id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookedSessionIds((prev) => new Set(prev).add(session.id));
          } catch {
            // booking confirmed via webhook fallback
          } finally {
            setBookingSessionId(null);
          }
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => setBookingSessionId(null));
      rzp.open();
    } catch (err: any) {
      setBookingSessionId(null);
    }
  }

  async function handleRefundRequest() {
    if (!refundReason) return;
    setRefundLoading(true);
    try {
      // Find enrollment id — check from the enrollment check we did earlier
      const { data: enrollData } = await enrollmentApi.check(course.id);
      // The check endpoint just returns enrolled:bool, so we need to get the enrollment id
      // from my-courses endpoint; for now we pass course.id as a hint
      const { data: myCoursesData } = await enrollmentApi.myCourses();
      const enrolled = myCoursesData?.courses?.find((c: any) => c.course?.id === course.id || c.course?.slug === course.slug);
      if (!enrolled?.enrollment_id) return;

      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/refunds/request?enrollment_id=${enrolled.enrollment_id}&reason=${encodeURIComponent(refundReason)}&description=${encodeURIComponent(refundDesc)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      if (resp.ok) {
        setRefundDone(true);
        setShowRefundModal(false);
      }
    } catch {
    } finally {
      setRefundLoading(false);
    }
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
        theme: { color: "#4F46E5" },
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

  // ─── Buy card (light theme) ───────────────────────────────────────────────
  const BuyCard = () => (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-card">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-indigo-50"><BookOpen className="h-14 w-14 text-indigo-300" /></div>
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
            <Play className="h-6 w-6 text-indigo-600 ml-0.5 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-extrabold text-3xl ${isFree ? "text-emerald-600" : "text-gray-900"}`}>{price}</span>
        </div>
        <p className="text-gray-400 text-xs mb-5">
          {isFree ? "Free forever. No credit card required." : "One-time payment · Lifetime access."}
        </p>

        <AnimatePresence>
          {enrollSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center font-semibold"
            >
              <Check className="h-5 w-5 mx-auto mb-1" /> Enrolled! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        {enrolled ? (
          <Link href={`/learn/${course.slug}`}>
            <button className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-button-indigo">
              <Play className="h-4 w-4 fill-current" /> Go to Course
            </button>
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrollLoading || checkingEnroll}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-button-indigo"
          >
            {enrollLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>{isFree ? "Enrol for Free" : `Buy for ${price}`}<ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        )}

        {enrollError && (
          <p className="mt-3 text-red-500 text-xs text-center leading-relaxed">{enrollError}</p>
        )}
        {!isAuthenticated() && (
          <p className="mt-3 text-gray-400 text-xs text-center">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link> to enrol
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setWishlist(!wishlist)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Heart className={`h-4 w-4 ${wishlist ? "fill-red-500 text-red-500" : ""}`} />
            {wishlist ? "Saved" : "Wishlist"}
          </button>
          <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center justify-center gap-2 text-sm transition-all">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        {/* Includes */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
          <p className="text-gray-900 font-bold text-xs uppercase tracking-wide mb-3">This course includes</p>
          {[
            { icon: Video,    text: `${fmtMin(course.total_duration_minutes)} on-demand video` },
            { icon: BookOpen, text: `${totalLessons} lessons · ${course.total_chapters} chapters` },
            { icon: Globe,    text: "Full lifetime access" },
            { icon: Zap,      text: "Mobile & desktop access" },
            ...(course.certificate_enabled ? [{ icon: Award, text: "Certificate of completion" }] : []),
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs text-gray-500">
              <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />{text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Card / Section wrapper component ─────────────────────────────────────
  const Card = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
    <div id={id} className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero strip ── */}
      <div className="border-b border-[#e2e5ec] bg-white">
        <div className="bw-shell py-12">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <Link href="/courses" className="transition-colors hover:text-ink-heading">Courses</Link>
              {course.category && <><span>/</span><span>{course.category}</span></>}
              <span>/</span>
              <span className="max-w-[200px] truncate text-ink-body">{course.title}</span>
            </div>

            {course.category && (
              <span className="mb-4 inline-block rounded-full border border-[#e2e5ec] bg-[#ebebff] px-3 py-1 text-xs font-bold text-brand-primary">
                {course.category}
              </span>
            )}

            <h1 className="mb-4 font-display font-extrabold leading-tight tracking-[-0.02em] text-ink-heading"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}>
              {course.title}
            </h1>

            {course.short_description && (
              <p className="mb-6 max-w-2xl text-base leading-relaxed text-ink-body">{course.short_description}</p>
            )}

            {/* Stats */}
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {Number(course.avg_rating) > 0 && (
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(course.avg_rating)) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                  ))}
                  <span className="ml-1 font-bold text-ink-heading">{Number(course.avg_rating).toFixed(1)}</span>
                  <span className="text-ink-muted">({course.review_count?.toLocaleString()} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-ink-muted"><Users className="h-4 w-4" />{course.enrolled_count?.toLocaleString()} students</div>
              {course.total_duration_minutes > 0 && <div className="flex items-center gap-1 text-ink-muted"><Clock className="h-4 w-4" />{fmtMin(course.total_duration_minutes)}</div>}
              {course.difficulty_level && <div className="flex items-center gap-1 text-ink-muted"><BarChart3 className="h-4 w-4" />{course.difficulty_level}</div>}
              {course.language && <div className="flex items-center gap-1 text-ink-muted"><Globe className="h-4 w-4" />{course.language}</div>}
            </div>

            {/* Teacher */}
            {course.teacher && (
              <div className="flex items-center gap-2.5">
                {course.teacher.avatar_url
                  ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
                  : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary">
                      <span className="text-white font-bold text-sm">{course.teacher.full_name.charAt(0)}</span>
                    </div>
                }
                <div>
                  <p className="text-xs text-ink-muted">Created by</p>
                  <p className="text-sm font-semibold text-brand-primary">{course.teacher.full_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="sticky top-[84px] z-30 border-b border-[#e2e5ec] bg-white/95 backdrop-blur">
        <div className="bw-shell flex items-center gap-6 py-3 text-sm font-medium text-ink-muted">
          <a href="#overview" className="border-b-2 border-brand-primary pb-2 text-brand-primary">Overview</a>
          <a href="#curriculum" className="pb-2 hover:text-ink-heading">Curriculum</a>
          <a href="#reviews" className="pb-2 hover:text-ink-heading">Reviews</a>
          <a href="#ai-features" className="pb-2 hover:text-ink-heading">AI Features</a>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bw-shell py-10">
            <Card id="ai-features" className="border-l-4 border-l-brand-primary bg-[#eff6ff]">
              <h2 className="font-display text-xl font-bold text-ink-heading">AI Features</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <AIBadge label="AI Transcript Available" />
                <AIBadge label="Auto-Generated Quiz" />
                <AIBadge label="Course AI Chatbot" />
              </div>
            </Card>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left */}
          <div className="flex-1 min-w-0 space-y-5 pb-24 lg:pb-0">

            {/* What you'll learn */}
            <motion.div
              id="overview"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              <Card>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">What you&apos;ll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-indigo-600" strokeWidth={2.5} />
                      </div>
                      <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Requirements */}
            <Card>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {(course.difficulty_level === "Beginner"
                  ? ["No prior experience required — we start from zero", "A computer with internet access", "Enthusiasm and willingness to practice daily"]
                  : ["Basic programming knowledge is recommended", "Familiarity with the language used in this course", "A computer with internet access"]
                ).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <span className="text-gray-300 mt-0.5 text-base leading-none">•</span>{req}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Description */}
            {course.description && (
              <Card>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-4">About this course</h2>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{course.description}</p>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {course.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Curriculum */}
            {course.chapters && course.chapters.length > 0 && (
              <Card id="curriculum">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <h2 className="font-display font-bold text-xl text-gray-900">Course curriculum</h2>
                  <span className="text-gray-400 text-xs">
                    {course.chapters.length} chapters · {totalLessons} lessons · {fmtMin(course.total_duration_minutes)}
                  </span>
                </div>
                <div className="space-y-2">
                  {course.chapters.map((ch, i) => (
                    <ChapterRow key={ch.id} chapter={ch} index={i} isEnrolled={enrolled} />
                  ))}
                </div>
              </Card>
            )}

            {/* Instructor */}
            {course.teacher && (
              <Card>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Your instructor</h2>
                <div className="flex items-start gap-5 flex-wrap">
                  {course.teacher.avatar_url
                    ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-20 w-20 rounded-2xl object-cover shrink-0" />
                    : <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-extrabold text-2xl">{course.teacher.full_name.charAt(0)}</span>
                      </div>
                  }
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-lg text-gray-900">{course.teacher.full_name}</h3>
                    {course.teacher.teacher_profile?.expertise_areas && (
                      <p className="text-indigo-600 text-sm mb-3">{course.teacher.teacher_profile.expertise_areas.join(", ")}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                      {course.teacher.teacher_profile?.credibility_score && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {Number(course.teacher.teacher_profile.credibility_score).toFixed(1)} rating
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrolled_count?.toLocaleString()} students</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />Expert verified</span>
                    </div>
                    {course.teacher.teacher_profile?.bio && (
                      <p className="text-gray-500 text-sm leading-relaxed">{course.teacher.teacher_profile.bio}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <Card id="reviews">
              <h2 className="font-display text-xl font-bold text-ink-heading">Student Reviews</h2>
              <p className="mt-2 text-sm text-ink-muted">
                {course.avg_rating ? `${Number(course.avg_rating).toFixed(1)} average rating` : "New course"} from{" "}
                {course.review_count?.toLocaleString() || 0} learners.
              </p>
            </Card>

            {/* Doubt Sessions — only shown to enrolled students */}
            {enrolled && (
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-xl text-gray-900">Book a doubt session</h2>
                  {refundDone && (
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                      Refund requested
                    </span>
                  )}
                </div>

                {doubtLoading ? (
                  <div className="flex justify-center py-6">
                    <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />
                  </div>
                ) : doubtSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No doubt sessions available yet.</p>
                    <p className="text-gray-300 text-xs mt-1">Check back later or use the community forum.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doubtSessions.map((session: any) => {
                      const booked = bookedSessionIds.has(session.id);
                      const isBooking = bookingSessionId === session.id;
                      const scheduledDate = new Date(session.scheduled_at);
                      const isPast = scheduledDate < new Date();
                      return (
                        <div key={session.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-[#FAFAF9]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                session.session_type === "one_on_one"
                                  ? "bg-violet-50 text-violet-700 border-violet-100"
                                  : "bg-blue-50 text-blue-700 border-blue-100"
                              }`}>
                                {session.session_type === "one_on_one" ? "1-on-1" : "Group"}
                              </span>
                              {session.spots_left <= 2 && !isPast && (
                                <span className="text-[11px] text-red-500 font-semibold">
                                  {session.spots_left} spot{session.spots_left !== 1 ? "s" : ""} left
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {session.topic || "Doubt Session"}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span>{session.duration_minutes} mins</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`font-bold text-sm ${session.price === 0 ? "text-emerald-600" : "text-gray-900"}`}>
                              {session.price === 0 ? "Free" : `₹${Number(session.price).toLocaleString("en-IN")}`}
                            </span>
                            {booked ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                                <Check className="h-3.5 w-3.5" /> Booked
                              </span>
                            ) : isPast || session.spots_left === 0 ? (
                              <span className="text-xs text-gray-400 font-medium px-3 py-1.5 rounded-lg border border-gray-100">
                                {isPast ? "Ended" : "Full"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBookDoubtSession(session)}
                                disabled={isBooking}
                                className="text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                              >
                                {isBooking ? "..." : session.price === 0 ? "Reserve" : "Book"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Refund request link */}
                {!refundDone && (
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Not satisfied? You may request a refund.</p>
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Request refund
                    </button>
                  </div>
                )}
              </Card>
            )}

            {/* Refund Modal */}
            <AnimatePresence>
              {showRefundModal && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                  onClick={(e) => { if (e.target === e.currentTarget) setShowRefundModal(false); }}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                  >
                    <h3 className="font-display font-bold text-gray-900 text-lg mb-1">Request a Refund</h3>
                    <p className="text-xs text-gray-400 mb-5">Refund requests are reviewed within 2 business days.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Reason *</label>
                        <select
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
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
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Description</label>
                        <textarea
                          value={refundDesc}
                          onChange={(e) => setRefundDesc(e.target.value)}
                          rows={3}
                          placeholder="Tell us more about your issue..."
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={handleRefundRequest}
                        disabled={!refundReason || refundLoading}
                        className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {refundLoading ? "Submitting…" : "Submit Request"}
                      </button>
                      <button
                        onClick={() => setShowRefundModal(false)}
                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Platform features */}
            <Card>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Brainwave exclusive features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: MessageSquare, title: "AI Tutor", desc: "Trained on this exact course — available 24/7", color: "bg-indigo-50 text-indigo-600" },
                  { icon: Video,         title: "Live Doubt Sessions", desc: "Book 1-on-1 video calls with the instructor", color: "bg-violet-50 text-violet-600" },
                  { icon: Users,         title: "Course Community", desc: "Discuss doubts and collaborate with peers", color: "bg-sky-50 text-sky-600" },
                  { icon: Shield,        title: "Progress Monitoring", desc: "AI tracks your pace and keeps you on schedule", color: "bg-emerald-50 text-emerald-600" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-[#FAFAF9]">
                    <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right (sticky) */}
          <div className="hidden lg:block w-[340px] xl:w-[370px] shrink-0">
            <div className="sticky top-[76px]">
              <BuyCard />
              <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-white shadow-card text-center">
                <Shield className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-gray-900 text-sm">30-Day Money-Back Guarantee</p>
                <p className="text-gray-400 text-xs mt-1">Not satisfied? Full refund, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <p className={`font-extrabold text-xl shrink-0 ${isFree ? "text-emerald-600" : "text-gray-900"}`}>{price}</p>
          {enrolled ? (
            <Link href={`/learn/${course.slug}`} className="flex-1">
              <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2">
                <Play className="h-4 w-4 fill-current" /> Go to Course
              </button>
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {enrollLoading ? "Processing…" : isFree ? "Enrol Free" : `Buy ${price}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
