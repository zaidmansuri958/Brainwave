"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  Award,
  Users,
  Zap,
  Star,
  ArrowRight,
  GraduationCap,
  Upload,
  BarChart3,
  MessageSquare,
  Play,
  FileText,
  Presentation,
  Video,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bot,
  Shield,
  Globe,
  Clock,
  CheckCircle2,
  Mic,
  Monitor,
} from "lucide-react";
import { AnimatedText } from "@/components/ui/animated-text";
import { FadeIn } from "@/components/ui/fade-in";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GlowCard } from "@/components/ui/glow-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Marquee } from "@/components/ui/marquee";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedGridBg } from "@/components/ui/animated-grid-bg";
import { Meteors } from "@/components/ui/meteors";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { RippleEffect } from "@/components/ui/ripple-effect";
import { OrbitAnimation } from "@/components/ui/orbit-animation";

/* ─────────────────── DATA ─────────────────── */

const institutions = [
  "IIT Delhi",
  "IIT Bombay",
  "BITS Pilani",
  "NIT Trichy",
  "Anna University",
  "Delhi University",
  "IIM Ahmedabad",
  "IISc Bangalore",
  "JNU New Delhi",
  "VIT Vellore",
  "SRM Chennai",
  "IIIT Hyderabad",
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "B.Tech Student, IIT Delhi",
    initials: "PS",
    rating: 5,
    quote:
      "Brainwave\u2019s AI chatbot is a game-changer. It answered my doubts at 2 AM before my exam. I scored 95% in Data Structures!",
    bg: "bg-indigo-500",
  },
  {
    name: "Rajesh Kumar",
    role: "Physics Teacher, Kota",
    initials: "RK",
    rating: 5,
    quote:
      "I just uploaded my recordings and Brainwave created an entire course with quizzes. Now 3,000+ students learn from me online.",
    bg: "bg-purple-500",
  },
  {
    name: "Ananya Iyer",
    role: "UPSC Aspirant, Chennai",
    initials: "AI",
    rating: 5,
    quote:
      "The per-course AI chatbot understands context perfectly. It\u2019s like having a personal tutor for every single subject I study.",
    bg: "bg-pink-500",
  },
  {
    name: "Vikram Patel",
    role: "MBA Student, IIM Ahmedabad",
    initials: "VP",
    rating: 5,
    quote:
      "The verified certificates from Brainwave helped me stand out in campus placements. Recruiters loved the QR verification feature.",
    bg: "bg-blue-500",
  },
  {
    name: "Meera Reddy",
    role: "Math Teacher, Hyderabad",
    initials: "MR",
    rating: 5,
    quote:
      "Student risk prediction alerted me about 12 students about to drop out. I reached out and all 12 completed the course!",
    bg: "bg-emerald-500",
  },
  {
    name: "Arjun Singh",
    role: "Engineering Student, BITS Pilani",
    initials: "AS",
    rating: 5,
    quote:
      "Live doubt sessions are incredible. I got my complex analysis doubt cleared in 10 minutes flat. No more waiting for office hours!",
    bg: "bg-amber-500",
  },
  {
    name: "Kavitha Nair",
    role: "Science Teacher, Kochi",
    initials: "KN",
    rating: 5,
    quote:
      "The AI course builder saved me 100+ hours. I uploaded my lecture videos and got a structured course with auto-generated quizzes.",
    bg: "bg-cyan-500",
  },
  {
    name: "Rohit Mehta",
    role: "CA Aspirant, Mumbai",
    initials: "RM",
    rating: 5,
    quote:
      "I passed my CA Inter on my first attempt using Brainwave courses. The AI-generated summaries and practice quizzes were invaluable.",
    bg: "bg-rose-500",
  },
];

const faqData = [
  {
    question: "Is Brainwave.ai really free to start?",
    answer:
      "Yes! Students can browse courses, use the AI chatbot, and earn certificates completely free. Teachers can create and publish courses at no cost. We only charge a small platform fee on paid course transactions.",
  },
  {
    question: "How does the AI Course Builder work?",
    answer:
      "Simply upload your lecture recordings (video/audio), PDFs, or presentations. Our AI automatically transcribes content, structures it into chapters and lessons, generates quizzes, creates summaries, and even builds a course-specific chatbot \u2014 all in minutes.",
  },
  {
    question: "Are the certificates really verified?",
    answer:
      "Absolutely. Every certificate gets a unique ID and QR code. Anyone can verify its authenticity on our public verification page. Certificates are generated as professional PDFs and stored securely.",
  },
  {
    question: "Can I teach on Brainwave without technical skills?",
    answer:
      "Yes! Our platform is designed for non-technical teachers. Just record yourself teaching on your phone, upload the video, and our AI handles everything else \u2014 from course structuring to quiz generation.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Our AI supports content in English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, and Gujarati. We\u2019re actively adding support for more Indian languages.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 7-day refund policy on all paid courses. If you\u2019re not satisfied with a course, you can request a full refund within 7 days of purchase. No questions asked.",
  },
];

/* ─────────────────── COMPONENT ─────────────────── */

interface HomePageClientProps {
  featuredCourses: any[];
}

export function HomePageClient({ featuredCourses }: HomePageClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ═══════════ SECTION 1: HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center bg-[#030014] text-white overflow-hidden">
        <AnimatedGridBg className="opacity-40" />
        <Meteors count={7} />
        <FloatingParticles
          count={20}
          colors={[
            "rgba(99,102,241,0.15)",
            "rgba(168,85,247,0.12)",
            "rgba(236,72,153,0.10)",
            "rgba(59,130,246,0.10)",
          ]}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
          <div className="max-w-5xl mx-auto text-center">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-10 shine-border">
                <span className="text-lg">🚀</span>
                <span className="text-sm text-gray-300 font-medium">
                  India&apos;s #1 AI-Powered Learning Platform
                </span>
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              </div>
            </FadeIn>

            <AnimatedText
              text="Transform How India"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight justify-center"
              delay={0.15}
              as="h1"
            />
            <AnimatedText
              text="Learns & Teaches"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight justify-center mt-1"
              delay={0.35}
              as="h2"
            />
            <div className="mt-3 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
              <FadeIn delay={0.55}>
                <GradientText className="leading-[1.2]">with AI</GradientText>
              </FadeIn>
            </div>

            <FadeIn delay={0.7} className="mt-8">
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Teachers upload their recordings — AI creates structured courses with
                chatbots, quizzes, and certificates. Students learn smarter with
                personalized AI assistance.
              </p>
            </FadeIn>

            <FadeIn delay={0.85} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="shimmer" size="lg" asChild>
                  <Link
                    href="/register"
                    className="gap-2 text-base px-8 py-6 rounded-xl"
                  >
                    Start Learning Free <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link
                    href="/courses"
                    className="gap-2 text-base px-8 py-6 rounded-xl"
                  >
                    <Play className="h-5 w-5" /> Watch Demo
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={1.0} className="mt-14">
              <div className="relative inline-flex flex-col items-center">
                <RippleEffect
                  color="rgba(99,102,241,0.08)"
                  count={3}
                  className="absolute -inset-10"
                />
                <div className="relative flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-blue-500", "bg-emerald-500"].map(
                      (bg, i) => (
                        <div
                          key={i}
                          className={`w-9 h-9 rounded-full ${bg} border-2 border-[#030014] flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {["S", "A", "R", "P", "K"][i]}
                        </div>
                      )
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-semibold">
                      Trusted by 50,000+ students
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030014] to-transparent" />
      </section>

      {/* ═══════════ SECTION 2: LOGO CLOUD / PARTNERS ═══════════ */}
      <section className="relative py-16 bg-[#030014] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="glow-line mb-10" />

        <div className="relative max-w-7xl mx-auto px-4 mb-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Trusted by students from
          </p>
        </div>

        <Marquee speed={30} pauseOnHover>
          {institutions.map((name) => (
            <span
              key={name}
              className="mx-10 text-xl md:text-2xl font-bold text-gray-500/60 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </Marquee>

        <div className="mt-6" />

        <Marquee speed={25} pauseOnHover direction="right">
          {[...institutions].reverse().map((name) => (
            <span
              key={`r-${name}`}
              className="mx-10 text-xl md:text-2xl font-bold text-gray-600/40 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </Marquee>

        <div className="glow-line mt-10" />
      </section>

      {/* ═══════════ SECTION 3: STATS BAR ═══════════ */}
      <section className="relative py-20 bg-[#030014]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[400px] rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-8 md:p-12 shine-border">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                {[
                  { value: 500, suffix: "+", label: "Courses", icon: BookOpen },
                  { value: 50000, suffix: "+", label: "Students", icon: Users },
                  { value: 200, suffix: "+", label: "Expert Teachers", icon: GraduationCap },
                  { value: 10000, suffix: "+", label: "Certificates", icon: Award },
                ].map((stat, i) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="h-7 w-7 mx-auto mb-3 text-indigo-400" />
                    <div className="flex items-baseline justify-center gap-1">
                      <NumberTicker
                        value={stat.value}
                        className="text-3xl md:text-4xl font-bold text-white"
                        delay={i * 0.15}
                      />
                      <span className="text-2xl md:text-3xl font-bold text-indigo-400">
                        {stat.suffix}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ SECTION 4: BENTO FEATURES GRID ═══════════ */}
      <section className="relative py-28 bg-[#030014] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Everything You Need to{" "}
                <GradientText>Learn or Teach</GradientText>
              </h2>
              <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
                Built for India &mdash; from non-technical teachers to ambitious
                students preparing for UPSC, JEE, NEET, and beyond.
              </p>
            </div>
          </FadeIn>

          <BentoGrid className="auto-rows-[minmax(220px,1fr)]">
            {/* Card 1: AI Course Builder (2 cols) */}
            <BentoCard
              colSpan={2}
              icon={<Brain className="h-5 w-5" />}
              title="AI Course Builder"
              description="Upload recordings, PDFs, or slides. AI structures everything into chapters, quizzes, and summaries automatically."
            >
              <div className="mt-4 rounded-lg bg-black/40 border border-white/[0.06] p-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Transcribing video... done</span>
                </div>
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Generating 12 chapters... done</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Creating quizzes for Chapter 3...</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>Building AI chatbot index...</span>
                </div>
              </div>
            </BentoCard>

            {/* Card 2: Per-Course AI Chatbot */}
            <BentoCard
              icon={<Bot className="h-5 w-5" />}
              title="Per-Course AI Chatbot"
              description="Every course comes with an AI assistant trained on the course material. Ask anything, 24/7."
            >
              <div className="mt-4 space-y-2">
                <div className="flex justify-end">
                  <div className="rounded-xl rounded-br-sm bg-indigo-600/30 border border-indigo-500/20 px-3 py-2 text-xs text-gray-200 max-w-[85%]">
                    Explain binary search trees
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-xl rounded-bl-sm bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-xs text-gray-300 max-w-[85%]">
                    A BST is a tree where each node&apos;s left children are smaller and right children are larger...
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Card 3: Verified Certificates */}
            <BentoCard
              icon={<Award className="h-5 w-5" />}
              title="Verified Certificates"
              description="Earn certificates on completion. Share a link &mdash; anyone can verify with a QR code."
            >
              <div className="mt-4 flex items-center justify-center">
                <div className="relative w-32 h-24 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/[0.08] flex flex-col items-center justify-center">
                  <Award className="h-8 w-8 text-indigo-400 mb-1" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    VERIFIED
                  </span>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Card 4: Student Risk Prediction */}
            <BentoCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Student Risk Prediction"
              description="AI monitors engagement and alerts teachers before students drop out."
            >
              <div className="mt-4 flex items-end gap-1.5 h-16">
                {[65, 45, 80, 30, 70, 55, 90, 40].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${h}%`,
                      backgroundColor:
                        h < 40
                          ? "rgba(239,68,68,0.5)"
                          : h < 60
                          ? "rgba(245,158,11,0.5)"
                          : "rgba(34,197,94,0.5)",
                    }}
                  />
                ))}
              </div>
            </BentoCard>

            {/* Card 5: Course Community */}
            <BentoCard
              icon={<Users className="h-5 w-5" />}
              title="Course Community"
              description="Every course has a community. Post doubts, get answers from teachers and peers."
            >
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-blue-500"].map(
                    (bg, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full ${bg} border-2 border-gray-950 flex items-center justify-center text-white text-[10px] font-bold`}
                      >
                        {["A", "B", "C", "D"][i]}
                      </div>
                    )
                  )}
                </div>
                <span className="text-xs text-gray-500">+2.4k members</span>
              </div>
            </BentoCard>

            {/* Card 6: Live Doubt Sessions (2 cols) */}
            <BentoCard
              colSpan={2}
              icon={<Zap className="h-5 w-5" />}
              title="Live Doubt Sessions"
              description="Book 1-on-1 or group sessions with teachers. Integrated video &mdash; no Zoom needed."
            >
              <div className="mt-4 rounded-lg bg-black/40 border border-white/[0.06] p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Live Session
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-400">LIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Prof. Kumar", "Student A", "Student B"].map((name, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded bg-gray-800/80 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <Monitor className="h-4 w-4 text-gray-500 mx-auto mb-0.5" />
                        <span className="text-[9px] text-gray-500">{name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      {/* ═══════════ SECTION 5: HOW IT WORKS ═══════════ */}
      <section className="relative py-28 bg-[#030014] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                How It <GradientText>Works</GradientText>
              </h2>
              <p className="text-gray-400 mt-4 text-lg">
                Three steps to transform education
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-px -translate-y-1/2 z-0">
              <div className="w-full h-px bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50" />
            </div>

            {/* Step 1: Upload */}
            <FadeIn delay={0}>
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 text-center z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white text-sm font-bold mb-6">
                  1
                </div>
                <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
                  <Upload className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Teacher Uploads
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Upload your lecture recordings, notes, or slides. No technical skills needed.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[
                    { icon: FileText, label: "PDF", color: "text-red-400 bg-red-400/10" },
                    { icon: Presentation, label: "PPT", color: "text-orange-400 bg-orange-400/10" },
                    { icon: Video, label: "MP4", color: "text-blue-400 bg-blue-400/10" },
                  ].map((ft) => (
                    <Badge
                      key={ft.label}
                      variant="outline"
                      className={`border-white/10 ${ft.color} gap-1 px-3 py-1`}
                    >
                      <ft.icon className="h-3 w-3" />
                      {ft.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Step 2: AI Processes */}
            <FadeIn delay={0.2}>
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 text-center z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white text-sm font-bold mb-6">
                  2
                </div>
                <div className="flex justify-center mb-5">
                  <OrbitAnimation
                    radius={50}
                    duration={15}
                    orbitItems={[
                      { icon: <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> },
                      { icon: <MessageSquare className="h-3.5 w-3.5 text-purple-400" /> },
                      { icon: <BookOpen className="h-3.5 w-3.5 text-pink-400" /> },
                      { icon: <Award className="h-3.5 w-3.5 text-cyan-400" /> },
                    ]}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-400" />
                    </div>
                  </OrbitAnimation>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI Processes
                </h3>
                <p className="text-gray-400 text-sm">
                  Our AI generates chapters, quizzes, summaries, and a course-specific chatbot.
                </p>
              </div>
            </FadeIn>

            {/* Step 3: Students Learn */}
            <FadeIn delay={0.4}>
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 text-center z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white text-sm font-bold mb-6">
                  3
                </div>
                <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center mx-auto mb-5">
                  <GraduationCap className="h-7 w-7 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Students Learn
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Students enroll, learn with AI assistance, and earn verified certificates.
                </p>
                <div className="flex justify-center items-center gap-3">
                  <div className="flex -space-x-2">
                    {["bg-indigo-500", "bg-purple-500", "bg-pink-500"].map((bg, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full ${bg} border-2 border-gray-950`}
                      />
                    ))}
                  </div>
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 6: PLATFORM PREVIEW ═══════════ */}
      <section className="relative py-28 bg-gradient-to-b from-[#030014] via-[#050020] to-[#030014] overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Experience the{" "}
                <GradientText>Future of Learning</GradientText>
              </h2>
              <p className="text-gray-400 mt-4 text-lg max-w-xl mx-auto">
                A world-class platform built for Indian educators and learners
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative">
              {/* Browser mockup */}
              <div className="rounded-xl border border-white/[0.08] bg-gray-950/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-indigo-500/5">
                {/* Browser toolbar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="flex-1 mx-4">
                    <div className="w-full max-w-md mx-auto h-6 rounded-md bg-white/[0.05] border border-white/[0.06] flex items-center px-3">
                      <span className="text-[10px] text-gray-500">
                        brainwave.ai/courses/machine-learning
                      </span>
                    </div>
                  </div>
                </div>

                {/* Browser content */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Video player area */}
                    <div className="col-span-12 md:col-span-8">
                      <div className="aspect-video rounded-lg bg-gray-900 border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                        <div className="relative text-center">
                          <Play className="h-12 w-12 text-white/30 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Machine Learning — Lesson 3
                          </p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                          <div className="h-full w-[35%] bg-indigo-500 rounded-r" />
                        </div>
                      </div>

                      {/* Chapter list below player */}
                      <div className="mt-4 space-y-2">
                        {["Introduction to ML", "Linear Regression", "Neural Networks"].map(
                          (ch, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                                i === 2
                                  ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                                  : "bg-white/[0.02] border border-white/[0.04] text-gray-400"
                              }`}
                            >
                              <CheckCircle2
                                className={`h-3.5 w-3.5 ${
                                  i < 2 ? "text-green-400" : "text-gray-600"
                                }`}
                              />
                              <span>
                                Chapter {i + 1}: {ch}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 md:col-span-4 space-y-4">
                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs text-gray-300 font-medium">
                            AI Chatbot
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-[10px] text-gray-400">
                            What is gradient descent?
                          </div>
                          <div className="rounded-lg bg-indigo-500/10 px-3 py-2 text-[10px] text-gray-300">
                            Gradient descent is an optimization algorithm...
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4">
                        <span className="text-xs text-gray-300 font-medium">
                          Progress
                        </span>
                        <div className="mt-2 h-2 rounded-full bg-gray-800">
                          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          68% complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating feature badges */}
              <div className="hidden md:block">
                <Badge
                  className="absolute -left-4 top-1/4 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 gap-1.5 px-3 py-1.5 animate-float"
                  variant="outline"
                >
                  <Bot className="h-3 w-3" /> AI Chatbot
                </Badge>
                <Badge
                  className="absolute -right-4 top-1/3 border-purple-500/30 bg-purple-500/10 text-purple-300 gap-1.5 px-3 py-1.5 animate-float"
                  style={{ animationDelay: "1s" } as React.CSSProperties}
                  variant="outline"
                >
                  <Video className="h-3 w-3" /> Live Sessions
                </Badge>
                <Badge
                  className="absolute -left-2 bottom-1/4 border-pink-500/30 bg-pink-500/10 text-pink-300 gap-1.5 px-3 py-1.5 animate-float"
                  style={{ animationDelay: "2s" } as React.CSSProperties}
                  variant="outline"
                >
                  <BookOpen className="h-3 w-3" /> Quizzes
                </Badge>
                <Badge
                  className="absolute -right-2 bottom-1/5 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 gap-1.5 px-3 py-1.5 animate-float"
                  style={{ animationDelay: "3s" } as React.CSSProperties}
                  variant="outline"
                >
                  <Award className="h-3 w-3" /> Certificates
                </Badge>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ SECTION 7: TESTIMONIALS ═══════════ */}
      <section className="relative py-28 bg-[#030014] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Loved by{" "}
                <GradientText>Students &amp; Teachers</GradientText>
              </h2>
              <p className="text-gray-400 mt-4 text-lg">
                Hear from our community across India
              </p>
            </div>
          </FadeIn>
        </div>

        <Marquee speed={40} pauseOnHover>
          {testimonials.slice(0, 4).map((t) => (
            <div
              key={t.name}
              className="w-[400px] shrink-0 mx-3 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-full ${t.bg} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </Marquee>

        <div className="mt-6" />

        <Marquee speed={35} pauseOnHover direction="right">
          {testimonials.slice(4).map((t) => (
            <div
              key={t.name}
              className="w-[400px] shrink-0 mx-3 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-full ${t.bg} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ═══════════ SECTION 8: FAQ ═══════════ */}
      <section className="relative py-28 bg-[#030014] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Frequently Asked{" "}
                <GradientText>Questions</GradientText>
              </h2>
              <p className="text-gray-400 mt-4 text-lg">
                Everything you need to know about Brainwave.ai
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqData.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-sm font-medium text-white pr-4">
                      {faq.question}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                    )}
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: openFaq === i ? "200px" : "0px",
                      opacity: openFaq === i ? 1 : 0,
                    }}
                  >
                    <div className="px-6 pb-5">
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 9: CTA / FINAL ═══════════ */}
      <section className="relative py-32 overflow-hidden bg-[#030014]">
        <div className="absolute inset-0 mesh-gradient" />
        <Meteors count={5} />
        <FloatingParticles
          count={12}
          colors={[
            "rgba(99,102,241,0.15)",
            "rgba(168,85,247,0.12)",
            "rgba(236,72,153,0.10)",
          ]}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Ready to{" "}
              <GradientText>Transform</GradientText>
            </h2>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Future?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students learning with AI-powered courses from
              India&apos;s best educators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="shimmer" size="lg" asChild>
                <Link
                  href="/register"
                  className="gap-2 text-base px-10 py-6 rounded-xl"
                >
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link
                  href="/contact"
                  className="gap-2 text-base px-10 py-6 rounded-xl"
                >
                  <MessageSquare className="h-5 w-5" /> Talk to Us
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-gray-600">
              No credit card required &bull; Free forever &bull; Cancel anytime
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
