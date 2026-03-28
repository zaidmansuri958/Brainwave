"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { enrollmentApi } from "@/lib/api";
import {
  Star, Users, Clock, BookOpen, Play, Check, ChevronDown, ChevronUp,
  Award, Globe, Zap, Shield, MessageSquare, Video, Lock, Unlock,
  ArrowRight, Share2, Heart, BarChart3, FileText,
} from "lucide-react";

// ─── Razorpay loader ──────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Chapter accordion ───────────────────────────────────────────────────────
function ChapterRow({ chapter, index, isEnrolled }: { chapter: Chapter; index: number; isEnrolled: boolean }) {
  const [open, setOpen] = useState(index === 0);
  const totalSecs = chapter.lessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);

  const typeIcon = (t: string) => {
    if (t === "quiz") return <FileText className="h-3.5 w-3.5 text-violet-400" />;
    if (t === "document") return <BookOpen className="h-3.5 w-3.5 text-amber-400" />;
    return <Play className="h-3.5 w-3.5 text-blue-400" />;
  };

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 font-medium shrink-0">Ch {index + 1}</span>
            <h4 className="text-white font-semibold text-sm">{chapter.title}</h4>
            {chapter.is_free_preview && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Preview</span>
            )}
          </div>
          <p className="text-slate-600 text-xs mt-0.5">{chapter.lessons.length} lessons{totalSecs ? ` • ${fmtSec(totalSecs)}` : ""}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="border-t border-white/[0.05]">
              {chapter.lessons.map((lesson) => {
                const canView = chapter.is_free_preview || isEnrolled;
                return (
                  <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <div className="shrink-0">{typeIcon(lesson.lesson_type || "video")}</div>
                    <span className={`flex-1 text-sm ${canView ? "text-slate-300" : "text-slate-500"}`}>{lesson.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.duration_seconds ? <span className="text-[11px] text-slate-600">{fmtSec(lesson.duration_seconds)}</span> : null}
                      {canView ? <Unlock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-slate-600" />}
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
      // Paid — open Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { setEnrollError("Failed to load payment gateway. Please try again."); setEnrollLoading(false); return; }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Math.round(Number(data.amount) * 100),
        currency: data.currency || "INR",
        name: "Brainwave.ai",
        description: data.course_title || course.title,
        order_id: data.razorpay_order_id,
        prefill: { name: user?.full_name || "", email: user?.email || "" },
        theme: { color: "#4F8EF7" },
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
        setEnrollError(resp.error?.description || "Payment failed. Please try again.");
        setEnrollLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      if (msg === "Already enrolled") { setEnrolled(true); router.push(`/learn/${course.slug}`); }
      else setEnrollError(msg);
      setEnrollLoading(false);
    }
  }

  // ─── Buy card ─────────────────────────────────────────────────────────────
  const BuyCard = () => (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0C1526] overflow-hidden shadow-2xl shadow-black/40">
      {/* Thumbnail preview */}
      <div className="relative aspect-video bg-[#080E1D] group cursor-pointer">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-14 w-14 text-blue-500/30" /></div>
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/35">
          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
            <Play className="h-6 w-6 text-[#0C1526] ml-1 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-extrabold text-3xl ${isFree ? "text-emerald-400" : "text-white"}`}>{price}</span>
        </div>
        <p className="text-slate-500 text-xs mb-5">{isFree ? "Free forever. No credit card required." : "One-time payment · Lifetime access."}</p>

        <AnimatePresence>
          {enrollSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-medium">
              <Check className="h-5 w-5 mx-auto mb-1" /> Enrolled! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        {enrolled ? (
          <Link href={`/learn/${course.slug}`}>
            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(16,185,129,0.35)" }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-base shadow-lg flex items-center justify-center gap-2">
              <Play className="h-5 w-5 fill-current" /> Go to Course
            </motion.button>
          </Link>
        ) : (
          <motion.button onClick={handleEnroll} disabled={enrollLoading || checkingEnroll}
            whileHover={!enrollLoading ? { scale: 1.02, boxShadow: "0 0 35px rgba(79,142,247,0.4)" } : {}}
            whileTap={!enrollLoading ? { scale: 0.98 } : {}}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-bold text-base shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {enrollLoading ? (
              <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing…</>
            ) : <>{isFree ? "Enrol for Free" : `Buy for ${price}`}<ArrowRight className="h-4 w-4" /></>}
          </motion.button>
        )}

        {enrollError && <p className="mt-3 text-red-400 text-xs text-center leading-relaxed">{enrollError}</p>}
        {!isAuthenticated() && (
          <p className="mt-3 text-slate-500 text-xs text-center">
            <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link> to enrol
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button onClick={() => setWishlist(!wishlist)}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-slate-400 hover:text-white hover:border-white/15 flex items-center justify-center gap-2 text-sm transition-all">
            <Heart className={`h-4 w-4 ${wishlist ? "fill-red-400 text-red-400" : ""}`} />
            {wishlist ? "Saved" : "Wishlist"}
          </button>
          <button className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-slate-400 hover:text-white hover:border-white/15 flex items-center justify-center gap-2 text-sm transition-all">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        {/* Includes */}
        <div className="mt-5 pt-4 border-t border-white/[0.05] space-y-2.5">
          <p className="text-white font-semibold text-xs uppercase tracking-wide mb-3">This course includes</p>
          {[
            { icon: Video, text: `${fmtMin(course.total_duration_minutes)} on-demand video` },
            { icon: BookOpen, text: `${totalLessons} lessons · ${course.total_chapters} chapters` },
            { icon: Globe, text: "Full lifetime access" },
            { icon: Zap, text: "Mobile & desktop access" },
            ...(course.certificate_enabled ? [{ icon: Award, text: "Certificate of completion" }] : []),
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs text-slate-400">
              <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />{text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060B18]">
      {/* Hero */}
      <div className="relative bg-[#080E1D] border-b border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.05] via-transparent to-violet-600/[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-5 flex-wrap">
              <Link href="/courses" className="hover:text-slate-300 transition-colors">Courses</Link>
              {course.category && <><span>/</span><span className="text-slate-400">{course.category}</span></>}
              <span>/</span>
              <span className="text-slate-300 truncate max-w-[200px]">{course.title}</span>
            </div>

            {course.category && (
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4">{course.category}</span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">{course.title}</h1>
            {course.short_description && <p className="text-slate-400 text-base leading-relaxed mb-6 max-w-2xl">{course.short_description}</p>}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-6">
              {Number(course.avg_rating) > 0 && (
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(course.avg_rating)) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />)}
                  <span className="text-amber-400 font-bold ml-1">{Number(course.avg_rating).toFixed(1)}</span>
                  <span className="text-slate-500">({course.review_count?.toLocaleString()} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-slate-400"><Users className="h-4 w-4" />{course.enrolled_count?.toLocaleString()} students</div>
              {course.total_duration_minutes > 0 && <div className="flex items-center gap-1 text-slate-400"><Clock className="h-4 w-4" />{fmtMin(course.total_duration_minutes)}</div>}
              {course.difficulty_level && <div className="flex items-center gap-1 text-slate-400"><BarChart3 className="h-4 w-4" />{course.difficulty_level}</div>}
              {course.language && <div className="flex items-center gap-1 text-slate-400"><Globe className="h-4 w-4" />{course.language}</div>}
            </div>

            {/* Teacher */}
            {course.teacher && (
              <div className="flex items-center gap-2.5">
                {course.teacher.avatar_url
                  ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20" />
                  : <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center"><span className="text-white font-bold text-sm">{course.teacher.full_name.charAt(0)}</span></div>
                }
                <div>
                  <p className="text-slate-400 text-xs">Created by</p>
                  <p className="text-blue-400 text-sm font-semibold">{course.teacher.full_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left */}
          <div className="flex-1 min-w-0 space-y-6 pb-24 lg:pb-0">

            {/* What you'll learn */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0C1526] p-6">
              <h2 className="text-xl font-bold text-white mb-5">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-blue-400" strokeWidth={2.5} />
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0C1526] p-6">
              <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {(course.difficulty_level === "Beginner"
                  ? ["No prior experience required — we start from zero", "A computer with internet access", "Enthusiasm and willingness to practice daily"]
                  : ["Basic programming knowledge is recommended", "Familiarity with the language used in this course", "A computer with internet access and a curious mind"]
                ).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <span className="text-slate-600 mt-0.5">•</span>{req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            {course.description && (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0C1526] p-6">
                <h2 className="text-xl font-bold text-white mb-4">About this course</h2>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{course.description}</p>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {course.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-400">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Curriculum */}
            {course.chapters && course.chapters.length > 0 && (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0C1526] p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <h2 className="text-xl font-bold text-white">Course curriculum</h2>
                  <span className="text-slate-500 text-xs">{course.chapters.length} chapters · {totalLessons} lessons · {fmtMin(course.total_duration_minutes)}</span>
                </div>
                <div className="space-y-2">
                  {course.chapters.map((ch, i) => <ChapterRow key={ch.id} chapter={ch} index={i} isEnrolled={enrolled} />)}
                </div>
              </div>
            )}

            {/* Instructor */}
            {course.teacher && (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0C1526] p-6">
                <h2 className="text-xl font-bold text-white mb-5">Your instructor</h2>
                <div className="flex items-start gap-5 flex-wrap">
                  {course.teacher.avatar_url
                    ? <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-blue-500/20 shrink-0" />
                    : <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0"><span className="text-white font-extrabold text-2xl">{course.teacher.full_name.charAt(0)}</span></div>
                  }
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-bold text-lg">{course.teacher.full_name}</h3>
                    {course.teacher.teacher_profile?.expertise_areas && (
                      <p className="text-blue-400 text-sm mb-3">{course.teacher.teacher_profile.expertise_areas.join(", ")}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                      {course.teacher.teacher_profile?.credibility_score && (
                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{Number(course.teacher.teacher_profile.credibility_score).toFixed(1)} instructor rating</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrolled_count?.toLocaleString()} students</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />Expert verified</span>
                    </div>
                    {course.teacher.teacher_profile?.bio && (
                      <p className="text-slate-400 text-sm leading-relaxed">{course.teacher.teacher_profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Platform features */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0C1526] p-6">
              <h2 className="text-xl font-bold text-white mb-5">Brainwave exclusive features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: MessageSquare, title: "AI Tutor", desc: "Answers trained on this exact course — available 24/7", color: "from-blue-500 to-blue-600" },
                  { icon: Video, title: "Live Doubt Sessions", desc: "Book 1-on-1 video calls with the instructor", color: "from-violet-500 to-violet-600" },
                  { icon: Users, title: "Course Community", desc: "Discuss, post doubts, and collaborate with peers", color: "from-cyan-500 to-cyan-600" },
                  { icon: Shield, title: "Progress Monitoring", desc: "AI tracks your pace and keeps you on schedule", color: "from-emerald-500 to-emerald-600" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-[18px] w-[18px] text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right (sticky) */}
          <div className="hidden lg:block w-[340px] xl:w-[370px] shrink-0">
            <div className="sticky top-[76px]">
              <BuyCard />
              <div className="mt-4 p-4 rounded-xl border border-white/[0.05] bg-[#0C1526] text-center">
                <Shield className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">30-Day Money-Back Guarantee</p>
                <p className="text-slate-500 text-xs mt-1">Not satisfied? Full refund, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080E1D]/95 backdrop-blur-xl border-t border-white/[0.07] px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <p className={`font-extrabold text-xl shrink-0 ${isFree ? "text-emerald-400" : "text-white"}`}>{price}</p>
          {enrolled ? (
            <Link href={`/learn/${course.slug}`} className="flex-1">
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold flex items-center justify-center gap-2">
                <Play className="h-4 w-4 fill-current" /> Go to Course
              </button>
            </Link>
          ) : (
            <button onClick={handleEnroll} disabled={enrollLoading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {enrollLoading ? "Processing…" : isFree ? "Enrol Free" : `Buy ${price}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
