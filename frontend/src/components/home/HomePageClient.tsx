"use client";

import Link from "next/link";
import {
  Brain,
  BookOpen,
  Award,
  Shield,
  Users,
  Zap,
  Star,
  ArrowRight,
  GraduationCap,
  Upload,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { AnimatedText } from "@/components/ui/animated-text";
import { FadeIn } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { GlowCard } from "@/components/ui/glow-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Marquee } from "@/components/ui/marquee";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/CourseCard";

const features = [
  {
    icon: Brain,
    title: "AI Course Builder",
    description:
      "Just record yourself teaching. Our AI automatically creates chapters, quizzes, and summaries.",
    color: "rgba(99,102,241,0.35)",
  },
  {
    icon: BookOpen,
    title: "Per-Course AI Chatbot",
    description:
      "Every course comes with an AI assistant trained on course material. Ask anything, anytime.",
    color: "rgba(59,130,246,0.35)",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description:
      "Earn certificates upon course completion. Share a link — anyone can verify instantly.",
    color: "rgba(16,185,129,0.35)",
  },
  {
    icon: Shield,
    title: "Student Risk Prediction",
    description:
      "AI monitors engagement and alerts teachers before students drop out.",
    color: "rgba(245,158,11,0.35)",
  },
  {
    icon: Users,
    title: "Course Community",
    description:
      "Every course has a community group. Post doubts, get answers from teachers and AI.",
    color: "rgba(168,85,247,0.35)",
  },
  {
    icon: Zap,
    title: "Live Doubt Sessions",
    description:
      "Book 1-on-1 or group sessions with teachers. Integrated video — no Zoom needed.",
    color: "rgba(236,72,153,0.35)",
  },
];

const stats = [
  {
    target: 500,
    suffix: "+",
    label: "Courses",
    icon: BookOpen,
    color: "rgba(99,102,241,0.35)",
  },
  {
    target: 50000,
    suffix: "+",
    label: "Students",
    icon: Users,
    color: "rgba(59,130,246,0.35)",
  },
  {
    target: 200,
    suffix: "+",
    label: "Expert Teachers",
    icon: GraduationCap,
    color: "rgba(16,185,129,0.35)",
  },
  {
    target: 10000,
    suffix: "+",
    label: "Certificates Issued",
    icon: Award,
    color: "rgba(168,85,247,0.35)",
  },
];

const partners = [
  "IIT Delhi",
  "BITS Pilani",
  "NIT Trichy",
  "Anna University",
  "Delhi University",
  "IIM Ahmedabad",
  "IISc Bangalore",
  "JNU",
];

const howItWorks = [
  {
    step: 1,
    icon: Upload,
    title: "Teacher Uploads",
    description:
      "Upload your lecture recordings, notes, or slides. No tech skills needed.",
  },
  {
    step: 2,
    icon: Brain,
    title: "AI Processes",
    description:
      "Our AI generates chapters, quizzes, summaries, and a course-specific chatbot.",
  },
  {
    step: 3,
    icon: GraduationCap,
    title: "Students Learn",
    description:
      "Students enroll, learn with AI assistance, and earn verified certificates.",
  },
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
      "I just uploaded my recordings and Brainwave created an entire course. Now 3,000+ students learn from me online.",
    bg: "bg-purple-500",
  },
  {
    name: "Ananya Iyer",
    role: "UPSC Aspirant, Chennai",
    initials: "AI",
    rating: 5,
    quote:
      "The per-course AI chatbot understands context perfectly. It\u2019s like having a personal tutor for every subject.",
    bg: "bg-pink-500",
  },
  {
    name: "Vikram Patel",
    role: "MBA Student, IIM Ahmedabad",
    initials: "VP",
    rating: 4,
    quote:
      "The verified certificates from Brainwave helped me stand out in placements. Recruiters loved the QR verification.",
    bg: "bg-blue-500",
  },
  {
    name: "Meera Reddy",
    role: "Math Teacher, Hyderabad",
    initials: "MR",
    rating: 5,
    quote:
      "Student risk prediction alerted me about 12 students about to drop. I reached out and all 12 completed the course.",
    bg: "bg-emerald-500",
  },
  {
    name: "Arjun Singh",
    role: "Engineering Student, BITS Pilani",
    initials: "AS",
    rating: 5,
    quote:
      "Live doubt sessions are incredible. I got my complex analysis doubt cleared in 10 minutes flat. No more waiting!",
    bg: "bg-amber-500",
  },
];

interface HomePageClientProps {
  featuredCourses: any[];
}

export function HomePageClient({ featuredCourses }: HomePageClientProps) {
  return (
    <>
      {/* Hero Section */}
      <Spotlight className="relative min-h-[90vh] flex items-center bg-gray-950 text-white">
        <FloatingParticles
          count={15}
          colors={[
            "rgba(99,102,241,0.12)",
            "rgba(168,85,247,0.10)",
            "rgba(59,130,246,0.08)",
          ]}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-gray-300">
                  India&apos;s AI-Powered Learning Platform
                </span>
              </div>
            </FadeIn>

            <AnimatedText
              text={"Learn from India\u2019s Best Teachers."}
              className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight justify-center"
              delay={0.2}
              as="h1"
            />

            <div className="mt-2 text-4xl sm:text-5xl md:text-7xl font-bold">
              <GradientText>Powered by AI.</GradientText>
            </div>

            <FadeIn delay={0.6} className="mt-6">
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Teachers upload their recordings — AI creates the course.
                Students get an AI chatbot, live sessions, and verified
                certificates.
              </p>
            </FadeIn>

            <FadeIn delay={0.8} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="shimmer" size="lg" asChild>
                  <Link
                    href="/courses"
                    className="gap-2 text-base px-8 py-6 rounded-xl"
                  >
                    Browse Courses <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link
                    href="/register?role=teacher"
                    className="gap-2 text-base px-8 py-6 rounded-xl"
                  >
                    Teach on Brainwave
                  </Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </Spotlight>

      {/* Trusted By Marquee */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <p className="text-center text-xs uppercase tracking-widest text-gray-400 font-medium">
            Trusted by students from top institutions
          </p>
        </div>
        <Marquee speed={30} pauseOnHover>
          {partners.map((name) => (
            <span
              key={name}
              className="mx-8 text-lg font-semibold text-gray-400 dark:text-gray-500 whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <GlowCard glowColor={stat.color}>
                  <div className="text-center py-2">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary-500" />
                    <AnimatedCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {stat.label}
                    </p>
                  </div>
                </GlowCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Everything You Need to{" "}
                <GradientText>Learn or Teach</GradientText>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
                Built for India — from non-technical teachers to ambitious
                students.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <GlowCard glowColor={feature.color} className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </GlowCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                How It <GradientText>Works</GradientText>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">
                Three steps to transform education
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px -translate-y-1/2">
              <div className="w-full h-px bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300 dark:from-primary-700 dark:via-primary-500 dark:to-primary-700" />
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {howItWorks.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.2}>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 mb-6 ring-4 ring-primary-100 dark:ring-primary-800/30">
                    <step.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center md:left-1/2 md:ml-6 md:right-auto">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Popular Courses
                </h2>
                <Button variant="outline" asChild>
                  <Link href="/courses" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course: any, i: number) => (
                <FadeIn key={course.id} delay={i * 0.1}>
                  <CourseCard course={course} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Loved by <GradientText>Students &amp; Teachers</GradientText>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">
                Hear from our community across India
              </p>
            </div>
          </FadeIn>
        </div>
        <Marquee speed={35} pauseOnHover>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="w-[350px] shrink-0 mx-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </Marquee>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient bg-gray-950" />
        <FloatingParticles
          count={10}
          colors={[
            "rgba(99,102,241,0.15)",
            "rgba(168,85,247,0.12)",
            "rgba(236,72,153,0.10)",
          ]}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to{" "}
              <GradientText>Start Your Learning Journey</GradientText>?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students learning with AI-powered courses from
              India&apos;s best educators.
            </p>
            <Button variant="shimmer" size="lg" asChild>
              <Link
                href="/register"
                className="gap-2 text-base px-10 py-6 rounded-xl"
              >
                Start Learning Free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
