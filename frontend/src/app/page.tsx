import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  GraduationCap,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

async function getFeaturedCourses() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api/v1"}/courses?sort=popular&limit=6&status=published`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      title: "AI Course Builder",
      description: "Just record yourself teaching. Our AI automatically creates chapters, quizzes, and summaries.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary-600" />,
      title: "Per-Course AI Chatbot",
      description: "Every course comes with an AI assistant trained on course material. Ask anything, anytime.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: "Verified Certificates",
      description: "Earn certificates upon course completion. Share a link — anyone can verify instantly.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Student Risk Prediction",
      description: "AI monitors engagement and alerts teachers before students drop out.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: "Course Community",
      description: "Every course has a community group. Post doubts, get answers from teachers and AI.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: "Live Doubt Sessions",
      description: "Book 1-on-1 or group sessions with teachers. Integrated video — no Zoom needed.",
    },
  ];

  const stats = [
    { label: "Courses", value: "500+" },
    { label: "Students", value: "50,000+" },
    { label: "Teachers", value: "200+" },
    { label: "Certificates Issued", value: "10,000+" },
  ];

  return (
    <div className="app-shell flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-16 md:pb-20">
          <div className="glass-panel p-7 md:p-10 lg:p-12">
            <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-300">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">India&apos;s AI-powered learning platform</span>
            </div>
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 dark:text-white">
                  Learn Faster with
                  <span className="block text-primary-600 dark:text-primary-300">Modern AI Education</span>
                </h1>
                <p className="mt-5 text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
                  Teachers upload recordings, AI structures the entire course, and students get adaptive learning,
                  live support, and verifiable certificates.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/courses" className="modern-btn-primary px-7 py-3 text-base">
                    Browse Courses <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/register?role=teacher" className="modern-btn-secondary px-7 py-3 text-base">
                    Teach on Brainwave
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-card p-4">
                    <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">Professional, mentor-first course journeys</p>
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">AI generated summaries, quizzes, and context chat</p>
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">Certificate verification for hiring-ready outcomes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything You Need to Learn or Teach</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Built for India — from non-technical teachers to ambitious students.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card glass-card-hover p-6">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredCourses.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Popular Courses</h2>
              <Link href="/courses" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-panel p-8 md:p-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to start your learning journey?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
            Join thousands of students learning with AI-powered courses.
            </p>
            <Link href="/register" className="modern-btn-primary px-8 py-3 text-lg">
              Start Learning Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
