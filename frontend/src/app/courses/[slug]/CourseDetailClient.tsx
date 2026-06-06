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
    if (t === "quiz") return <FileText className="h-4 w-4 text-black" strokeWidth={3} />;
    if (t === "document") return <BookOpen className="h-4 w-4 text-black" strokeWidth={3} />;
    return <Play className="h-4 w-4 text-black" strokeWidth={3} fill="currentColor" />;
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm transition-transform hover:-translate-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors ${open ? "bg-yellow-300" : "bg-white hover:bg-white"}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-800 shrink-0 border border-gray-200 rounded-full px-2 py-0.5 bg-white">Ch {index + 1}</span>
            <h4 className="text-gray-900  uppercase tracking-tight text-base sm:text-lg">{chapter.title}</h4>
            {chapter.is_free_preview && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-black border border-gray-200">
                Preview
              </span>
            )}
          </div>
          <p className="text-gray-700 font-bold text-xs mt-2 ">
            {chapter.lessons.length} lessons{totalSecs ? ` · ${fmtSec(totalSecs)}` : ""}
          </p>
        </div>
        {open
          ? <ChevronUp className="h-6 w-6 text-black shrink-0" strokeWidth={3} />
          : <ChevronDown className="h-6 w-6 text-black shrink-0" strokeWidth={3} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden"
          >
            <div className="border-t-4 border-black bg-white">
              {chapter.lessons.map((lesson) => {
                const canView = chapter.is_free_preview || isEnrolled;
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 px-6 py-4 border-b-4 border-black/10 last:border-b-0 hover:bg-blue-100/20 transition-colors"
                  >
                    <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 bg-white">{typeIcon(lesson.lesson_type || "video")}</div>
                    <span className={`flex-1 font-bold text-sm uppercase tracking-wide ${canView ? "text-gray-900" : "text-gray-400"}`}>{lesson.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {lesson.duration_seconds ? (
                        <span className="text-[11px] font-bold text-gray-500 ">{fmtSec(lesson.duration_seconds)}</span>
                      ) : null}
                      {canView
                        ? <Unlock className="h-5 w-5 text-green-400" strokeWidth={3} />
                        : <Lock className="h-5 w-5 text-slate-300" strokeWidth={3} />}
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
        theme: { color: "#ff6b00" },
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
      const { data: enrollData } = await enrollmentApi.check(course.id);
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
        theme: { color: "#ff6b00" },
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
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Thumbnail */}
      <div className="relative aspect-video border-b-4 border-black bg-slate-100">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-yellow-300"><BookOpen className="h-16 w-16 text-black" strokeWidth={2} /></div>
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm transition-transform hover:scale-110">
            <Play className="h-6 w-6 text-black ml-1 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="  text-5xl uppercase tracking-tighter text-gray-900">{price}</span>
        </div>
        <p className="text-gray-500 font-bold text-xs  mb-6">
          {isFree ? "Free forever. No credit card required." : "One-time payment. Lifetime access."}
        </p>

        <AnimatePresence>
          {enrollSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-green-100 border border-gray-200 text-black text-sm uppercase  tracking-widest text-center shadow-sm"
            >
              <Check className="h-6 w-6 mx-auto mb-2" strokeWidth={3} /> Enrolled! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        {enrolled ? (
          <Link href={`/learn/${course.slug}`}>
            <button className="w-full py-4 rounded-full border border-gray-200 bg-blue-100 text-black font-semibold shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md flex items-center justify-center gap-3">
              <Play className="h-5 w-5 fill-current" /> Go to Course
            </button>
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrollLoading || checkingEnroll}
            className="w-full py-4 rounded-full border border-gray-200 bg-yellow-300 text-black font-semibold shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {enrollLoading ? (
              <span className="animate-pulse">Processing…</span>
            ) : (
              <>{isFree ? "Enrol for Free" : `Buy for ${price}`}<ArrowRight className="h-5 w-5" strokeWidth={3} /></>
            )}
          </button>
        )}

        {enrollError && (
          <p className="mt-4 text-red-500 text-sm font-bold text-center leading-relaxed">{enrollError}</p>
        )}
        {!isAuthenticated() && (
          <p className="mt-4 text-gray-500 text-xs font-bold  text-center">
            <Link href="/login" className="text-black hover:text-orange-500 underline underline-offset-4">Sign in</Link> to enrol
          </p>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setWishlist(!wishlist)}
            className="flex-1 py-3 rounded-full border border-gray-200 bg-white text-black hover:bg-orange-500 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold  transition-all"
          >
            <Heart className={`h-4 w-4 ${wishlist ? "fill-current text-white" : ""}`} strokeWidth={3} />
            {wishlist ? "Saved" : "Save"}
          </button>
          <button className="flex-1 py-3 rounded-full border border-gray-200 bg-white text-black hover:bg-blue-100 flex items-center justify-center gap-2 text-xs font-semibold  transition-all">
            <Share2 className="h-4 w-4" strokeWidth={3} /> Share
          </button>
        </div>

        {/* Includes */}
        <div className="mt-8 pt-6 border-t-4 border-black space-y-4">
          <p className="text-gray-900  text-sm  mb-4">This course includes</p>
          {[
            { icon: Video,    text: `${fmtMin(course.total_duration_minutes)} on-demand video` },
            { icon: BookOpen, text: `${totalLessons} lessons · ${course.total_chapters} chapters` },
            { icon: Globe,    text: "Full lifetime access" },
            { icon: Zap,      text: "Mobile & desktop access" },
            ...(course.certificate_enabled ? [{ icon: Award, text: "Certificate of completion" }] : []),
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-4 text-sm font-bold text-gray-700">
              <Icon className="h-5 w-5 text-black shrink-0" strokeWidth={2.5} />{text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Card / Section wrapper component ─────────────────────────────────────
  const Card = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
    <div id={id} className={`bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-10 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero strip ── */}
      <div className="relative border-b-4 border-black bg-blue-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-[1400px] mx-auto">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-bold  text-gray-800">
              <Link href="/courses" className="transition-colors hover:text-black hover:underline underline-offset-4 border border-gray-200 rounded-full px-3 py-1 bg-white ">Courses</Link>
              {course.category && <><span className="text-black ">&gt;</span><span className="border border-gray-200 rounded-full px-3 py-1 bg-white ">{course.category}</span></>}
              <span className="text-black ">&gt;</span>
              <span className="max-w-[200px] sm:max-w-md truncate border border-gray-200 rounded-full px-3 py-1 bg-black text-white ">{course.title}</span>
            </div>

            {course.category && (
              <span className="mb-6 inline-block rounded-full border border-gray-200 bg-yellow-300 px-4 py-1.5 text-xs font-semibold text-black shadow-sm">
                {course.category}
              </span>
            )}

            <h1 className="mb-6   uppercase tracking-tighter text-gray-900"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.1 }}>
              {course.title}
            </h1>

            {course.short_description && (
              <p className="mb-10 max-w-2xl text-lg font-bold leading-relaxed text-gray-800 border-l-4 border-black pl-4">
                {course.short_description}
              </p>
            )}

            {/* Stats */}
            <div className="mb-8 flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-semibold">
              {Number(course.avg_rating) > 0 && (
                <div className="flex items-center gap-2 border border-gray-200 rounded-full bg-white px-4 py-2 shadow-sm">
                  <Star className="h-5 w-5 fill-[#ffe500] text-black stroke-[2px]" />
                  <span className="text-black">{Number(course.avg_rating).toFixed(1)}</span>
                  <span className="text-gray-500">({course.review_count?.toLocaleString()})</span>
                </div>
              )}
              <div className="flex items-center gap-2 border border-gray-200 rounded-full bg-white px-4 py-2 shadow-sm"><Users className="h-5 w-5 text-black" strokeWidth={3} />{course.enrolled_count?.toLocaleString()}</div>
              {course.total_duration_minutes > 0 && <div className="flex items-center gap-2 border border-gray-200 rounded-full bg-white px-4 py-2 shadow-sm"><Clock className="h-5 w-5 text-black" strokeWidth={3} />{fmtMin(course.total_duration_minutes)}</div>}
            </div>

            {/* Teacher */}
            {course.teacher && (
              <div className="flex items-center gap-4 mt-8 border border-gray-200 rounded-xl bg-white p-4 w-fit shadow-md">
                {course.teacher.avatar_url
                  ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                  : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-500 border border-gray-200">
                      <span className="text-white  text-2xl uppercase">{course.teacher.full_name.charAt(0)}</span>
                    </div>
                }
                <div className="pr-4">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1">Created by</p>
                  <p className="text-lg  uppercase tracking-tight text-gray-900">{course.teacher.full_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky nav */}
      <div className="sticky top-[72px] z-30 border-b-4 border-black bg-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto flex items-center gap-8 py-4 overflow-x-auto no-scrollbar text-sm font-semibold text-gray-400">
          <a href="#overview" className="border-b-4 border-black pb-2 text-black shrink-0 hover:text-orange-500">Overview</a>
          <a href="#curriculum" className="pb-2 shrink-0 border-b-4 border-transparent hover:border-black hover:text-black">Curriculum</a>
          <a href="#reviews" className="pb-2 shrink-0 border-b-4 border-transparent hover:border-black hover:text-black">Reviews</a>
          <a href="#ai-features" className="pb-2 shrink-0 border-b-4 border-transparent hover:border-black hover:text-black">AI Features</a>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto py-12 lg:py-16">
        
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left */}
          <div className="flex-1 min-w-0 space-y-8 pb-24 lg:pb-0">

            <Card id="ai-features" className="bg-green-100">
              <h2 className=" text-4xl  uppercase tracking-tight text-gray-900 mb-6">AI Superpowers</h2>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 font-bold  text-black shadow-sm"><Zap className="h-5 w-5 fill-[#ffe500]" /> AI Transcript</span>
                <span className="inline-flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 font-bold  text-black shadow-sm"><Zap className="h-5 w-5 fill-[#ffe500]" /> Auto Quiz</span>
                <span className="inline-flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 font-bold  text-black shadow-sm"><Zap className="h-5 w-5 fill-[#ffe500]" /> AI Chatbot</span>
              </div>
            </Card>

            {/* What you'll learn */}
            <motion.div
              id="overview"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              <Card>
                <h2 className="  text-4xl uppercase tracking-tight text-gray-900 mb-8">What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full border border-gray-200 bg-yellow-300 flex items-center justify-center shrink-0">
                        <Check className="h-5 w-5 text-black" strokeWidth={4} />
                      </div>
                      <span className="text-gray-800 font-bold text-sm uppercase tracking-wide leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Requirements */}
            <Card>
              <h2 className="  text-4xl uppercase tracking-tight text-gray-900 mb-8">Requirements</h2>
              <ul className="space-y-4">
                {(course.difficulty_level === "Beginner"
                  ? ["No prior experience required — we start from zero", "A computer with internet access", "Enthusiasm and willingness to practice daily"]
                  : ["Basic programming knowledge is recommended", "Familiarity with the language used in this course", "A computer with internet access"]
                ).map((req, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-bold uppercase tracking-wide text-gray-700">
                    <span className="text-black  text-xl leading-none mt-0.5">•</span>{req}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Description */}
            {course.description && (
              <Card>
                <h2 className="  text-4xl uppercase tracking-tight text-gray-900 mb-8">About this course</h2>
                <p className="text-gray-700 font-medium text-base leading-loose whitespace-pre-line border-l-4 border-black pl-6">{course.description}</p>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-8">
                    {course.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold px-4 py-2 rounded-full bg-slate-100 border border-gray-200 text-gray-900">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b-4 border-black pb-6">
                  <h2 className="  text-4xl uppercase tracking-tight text-gray-900">Curriculum</h2>
                  <span className="text-gray-900  text-xs  bg-blue-100 border border-gray-200 px-4 py-2 rounded-full inline-block w-fit shadow-sm">
                    {course.chapters.length} chapters · {totalLessons} lessons
                  </span>
                </div>
                <div className="space-y-4">
                  {course.chapters.map((ch, i) => (
                    <ChapterRow key={ch.id} chapter={ch} index={i} isEnrolled={enrolled} />
                  ))}
                </div>
              </Card>
            )}

            {/* Instructor */}
            {course.teacher && (
              <Card>
                <h2 className="  text-4xl uppercase tracking-tight text-gray-900 mb-8">Your instructor</h2>
                <div className="flex items-start gap-6 flex-wrap">
                  {course.teacher.avatar_url
                    ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-24 w-24 rounded-xl border border-gray-200 object-cover shrink-0 shadow-sm" />
                    : <div className="h-24 w-24 rounded-xl border border-gray-200 bg-pink-100 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-black  text-4xl uppercase">{course.teacher.full_name.charAt(0)}</span>
                      </div>
                  }
                  <div className="min-w-0 flex-1">
                    <h3 className="  text-3xl uppercase tracking-tight text-gray-900">{course.teacher.full_name}</h3>
                    {course.teacher.teacher_profile?.expertise_areas && (
                      <p className="text-orange-500  text-sm  mt-2 mb-4">{course.teacher.teacher_profile.expertise_areas.join(", ")}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs font-bold  text-gray-700 mb-6 border-y-4 border-black py-4">
                      {course.teacher.teacher_profile?.credibility_score && (
                        <span className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-black fill-[#ffe500]" strokeWidth={2} />
                          {Number(course.teacher.teacher_profile.credibility_score).toFixed(1)} rating
                        </span>
                      )}
                      <span className="flex items-center gap-2 border-l-4 border-black pl-4"><Users className="h-5 w-5 text-black" />{course.enrolled_count?.toLocaleString()} students</span>
                      <span className="flex items-center gap-2 border-l-4 border-black pl-4"><BookOpen className="h-5 w-5 text-black" />Expert verified</span>
                    </div>
                    {course.teacher.teacher_profile?.bio && (
                      <p className="text-gray-700 font-medium text-sm leading-relaxed">{course.teacher.teacher_profile.bio}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <Card id="reviews">
              <h2 className=" text-4xl  uppercase tracking-tight text-gray-900 mb-6">Student Reviews</h2>
              <p className="text-sm font-semibold text-gray-900 bg-yellow-300 border border-gray-200 px-6 py-4 rounded-lg inline-block shadow-sm">
                {course.avg_rating ? `${Number(course.avg_rating).toFixed(1)} average rating` : "New course"} from{" "}
                {course.review_count?.toLocaleString() || 0} learners.
              </p>
            </Card>

            {/* Doubt Sessions */}
            {enrolled && (
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b-4 border-black pb-6">
                  <h2 className="  text-4xl uppercase tracking-tight text-gray-900">Book a session</h2>
                  {refundDone && (
                    <span className="text-xs font-semibold text-black bg-green-100 border border-gray-200 px-4 py-2 rounded-full ">
                      Refund requested
                    </span>
                  )}
                </div>

                {doubtLoading ? (
                  <div className="flex justify-center py-12 border border-gray-200 rounded-xl bg-slate-50">
                    <RefreshCw className="h-10 w-10 text-black animate-spin" strokeWidth={3} />
                  </div>
                ) : doubtSessions.length === 0 ? (
                  <div className="text-center py-12 border-4 border-dashed border-black/20 rounded-xl bg-slate-50">
                    <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" strokeWidth={2} />
                    <p className="text-gray-500  text-lg ">No sessions available.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {doubtSessions.map((session: any) => {
                      const booked = bookedSessionIds.has(session.id);
                      const isBooking = bookingSessionId === session.id;
                      const scheduledDate = new Date(session.scheduled_at);
                      const isPast = scheduledDate < new Date();
                      return (
                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-xl border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border border-gray-200 ${
                                session.session_type === "one_on_one"
                                  ? "bg-pink-100 text-black"
                                  : "bg-blue-100 text-black"
                              }`}>
                                {session.session_type === "one_on_one" ? "1-on-1" : "Group"}
                              </span>
                              {session.spots_left <= 2 && !isPast && (
                                <span className="text-[10px] text-white bg-red-500 px-3 py-1 rounded-full border border-gray-200 font-semibold animate-pulse">
                                  {session.spots_left} spot{session.spots_left !== 1 ? "s" : ""} left
                                </span>
                              )}
                            </div>
                            <p className="text-2xl  uppercase tracking-tight text-gray-900 truncate">
                              {session.topic || "Doubt Session"}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-gray-900">
                              <span className="flex items-center gap-2 bg-slate-100 border border-gray-200 px-4 py-2 rounded-full">
                                <Calendar className="h-4 w-4 text-black" strokeWidth={3} />
                                {scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span className="bg-slate-100 border border-gray-200 px-4 py-2 rounded-full">{session.duration_minutes} mins</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end gap-3 shrink-0">
                            <span className={` text-3xl uppercase ${session.price === 0 ? "text-green-400" : "text-orange-500"}`}>
                              {session.price === 0 ? "Free" : `₹${Number(session.price).toLocaleString("en-IN")}`}
                            </span>
                            {booked ? (
                              <span className="flex items-center justify-center gap-2 text-sm font-semibold text-black bg-green-100 border border-gray-200 px-8 py-3 rounded-full shadow-sm">
                                <Check className="h-5 w-5" strokeWidth={4} /> Booked
                              </span>
                            ) : isPast || session.spots_left === 0 ? (
                              <span className="text-sm font-semibold text-gray-500 bg-slate-200 border border-gray-200 px-8 py-3 rounded-full text-center">
                                {isPast ? "Ended" : "Full"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBookDoubtSession(session)}
                                disabled={isBooking}
                                className="text-sm font-semibold bg-yellow-300 border border-gray-200 text-black px-8 py-3 rounded-full shadow-sm hover:-translate-y-1 hover:shadow-md disabled:opacity-50 transition-all text-center"
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

                {/* Refund request link */}
                {!refundDone && (
                  <div className="mt-8 pt-6 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-bold  text-gray-500">Not satisfied? Request a refund.</p>
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="text-sm font-semibold text-white bg-red-500 border border-gray-200 px-6 py-3 rounded-full hover:bg-red-600 shadow-sm transition-transform hover:-translate-y-1"
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
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                  onClick={(e) => { if (e.target === e.currentTarget) setShowRefundModal(false); }}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-[16px_16px_0_#111111] p-8 w-full max-w-lg"
                  >
                    <h3 className="  uppercase text-4xl text-gray-900 mb-2">Request Refund</h3>
                    <p className="text-sm font-bold  text-gray-500 mb-8 border-b-4 border-black pb-4">Reviewed in 2 days.</p>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm  text-gray-900  block mb-3">Reason *</label>
                        <select
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-gray-900 font-bold rounded-lg px-5 py-4 text-base outline-none focus:bg-yellow-300 transition-colors cursor-pointer shadow-sm"
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
                        <label className="text-sm  text-gray-900  block mb-3">Description</label>
                        <textarea
                          value={refundDesc}
                          onChange={(e) => setRefundDesc(e.target.value)}
                          rows={4}
                          placeholder="Tell us more about your issue..."
                          className="w-full bg-white border border-gray-200 text-gray-900 font-bold rounded-lg px-5 py-4 text-base outline-none focus:bg-white transition-colors resize-none shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleRefundRequest}
                        disabled={!refundReason || refundLoading}
                        className="flex-1 bg-red-500 border border-gray-200 text-white py-4 rounded-full text-base font-semibold hover:bg-red-600 disabled:opacity-50 transition-transform hover:-translate-y-1 shadow-sm"
                      >
                        {refundLoading ? "Wait…" : "Submit"}
                      </button>
                      <button
                        onClick={() => setShowRefundModal(false)}
                        className="flex-1 border border-gray-200 bg-white text-gray-900 py-4 rounded-full text-base font-semibold hover:bg-slate-100 transition-transform hover:-translate-y-1 shadow-sm"
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
              <h2 className="  text-4xl uppercase tracking-tight text-gray-900 mb-8 border-b-4 border-black pb-4">Exclusive Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: MessageSquare, title: "AI Tutor", desc: "Trained on this exact course — 24/7", color: "bg-blue-100" },
                  { icon: Video,         title: "Live Sessions", desc: "Book 1-on-1 calls with the instructor", color: "bg-pink-100" },
                  { icon: Users,         title: "Community", desc: "Discuss and collaborate with peers", color: "bg-yellow-300" },
                  { icon: Shield,        title: "Pace Tracker", desc: "AI tracks your pace and progress", color: "bg-green-100" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 bg-white shadow-md hover:-translate-y-1 transition-transform">
                    <div className={`h-14 w-14 rounded-full border border-gray-200 ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-6 w-6 text-black" strokeWidth={3} />
                    </div>
                    <div>
                      <p className=" text-gray-900 text-2xl uppercase tracking-tight">{title}</p>
                      <p className="text-gray-600 font-bold text-xs  mt-2 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right (sticky) */}
          <div className="hidden lg:block w-[380px] xl:w-[420px] shrink-0">
            <div className="sticky top-[160px]">
              <BuyCard />
              <div className="mt-6 p-6 rounded-xl border border-gray-200 bg-green-100 shadow-sm text-center hover:-translate-y-1 transition-transform">
                <Shield className="h-10 w-10 text-black mx-auto mb-4" strokeWidth={2.5} />
                <p className=" uppercase tracking-tight text-2xl text-black">30-Day Guarantee</p>
                <p className="text-gray-800 font-bold text-sm  mt-3 border-t-4 border-black/20 pt-3 mx-4">Not satisfied? Full refund, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t-4 border-black px-4 py-4 shadow-[0_-8px_0_rgba(17,17,17,1)]">
        <div className="flex items-center gap-4 max-w-xl mx-auto">
          <p className=" text-3xl uppercase text-gray-900 shrink-0">{price}</p>
          {enrolled ? (
            <Link href={`/learn/${course.slug}`} className="flex-1">
              <button className="w-full py-4 rounded-full border border-gray-200 bg-blue-100 text-black font-semibold flex items-center justify-center gap-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform">
                <Play className="h-5 w-5 fill-current" /> Go
              </button>
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="flex-1 py-4 rounded-full border border-gray-200 bg-yellow-300 text-black font-semibold flex items-center justify-center gap-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform disabled:opacity-50"
            >
              {enrollLoading ? "Wait…" : isFree ? "Free" : `Buy`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
