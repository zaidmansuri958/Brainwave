import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import {
  BookOpen, Brain, Award, Shield, Users, Zap, ArrowRight,
  GraduationCap, Sparkles, Play, CheckCircle, Star
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
      icon: <Brain className="h-6 w-6" />,
      title: "AI Course Builder",
      description: "Just record yourself teaching. Our AI automatically creates chapters, quizzes, and summaries.",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Per-Course AI Chatbot",
      description: "Every course comes with an AI assistant trained on course material. Ask anything, anytime.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Verified Certificates",
      description: "Earn certificates upon course completion. Share a link \u2014 anyone can verify instantly.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Student Risk Prediction",
      description: "AI monitors engagement and alerts teachers before students drop out.",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Course Community",
      description: "Every course has a community group. Post doubts, get answers from teachers and AI.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Live Doubt Sessions",
      description: "Book 1-on-1 or group sessions with teachers. Integrated video \u2014 no Zoom needed.",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  const stats = [
    { label: "Courses", value: "500+", icon: <BookOpen className="h-5 w-5" /> },
    { label: "Students", value: "50,000+", icon: <Users className="h-5 w-5" /> },
    { label: "Teachers", value: "200+", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Certificates", value: "10,000+", icon: <Award className="h-5 w-5" /> },
  ];

  const steps = [
    {
      step: "01",
      title: "Record Your Lessons",
      description: "Teachers simply upload their video recordings. No technical skills needed.",
      icon: <Play className="h-6 w-6" />,
    },
    {
      step: "02",
      title: "AI Creates the Course",
      description: "Our AI generates chapters, transcripts, quizzes, and searchable summaries.",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      step: "03",
      title: "Students Learn & Earn",
      description: "Students enroll, learn with AI chatbot assistance, and earn verified certificates.",
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern dark:bg-hero-pattern-dark" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-[120px] animate-float-delayed" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-muted-foreground">
                India&apos;s AI-Powered Learning Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight animate-slide-up">
              Learn from the Best.{" "}
              <span className="gradient-text">Powered by AI.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed animate-slide-up-delayed">
              Teachers upload recordings &mdash; AI creates the course. Students get an AI chatbot,
              live sessions, and verified certificates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-slide-up-delayed">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 gradient-bg text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-glow hover:shadow-glow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200"
              >
                Browse Courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register?role=teacher"
                className="inline-flex items-center justify-center gap-2 glass px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              >
                Teach on Brainwave
              </Link>
            </div>

            {/* Trusted badges */}
            <div className="flex items-center justify-center gap-4 mt-10 text-sm text-muted-foreground animate-fade-in">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Free to Start
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> 4.8/5 Rating
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary-500" /> Verified Certificates
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card text-center px-4 py-5 card-hover">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary-500/10 text-primary-500 mb-3">
                  {stat.icon}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.02] to-transparent dark:via-primary-500/[0.04]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Everything You Need to{" "}
              <span className="gradient-text">Learn or Teach</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for India &mdash; from non-technical teachers to ambitious students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 card-hover group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-4">
              How it Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Three Steps to{" "}
              <span className="gradient-text">Transform Education</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={item.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-500/30 to-transparent" />
                )}
                <div className="glass-card p-8 text-center card-hover">
                  <div className="text-5xl font-black gradient-text opacity-20 mb-4">{item.step}</div>
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-bg text-white mb-5 shadow-glow">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.02] to-transparent dark:via-primary-500/[0.04]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="inline-flex items-center rounded-full bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-4">
                  Popular
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Trending <span className="gradient-text">Courses</span>
                </h2>
              </div>
              <Link
                href="/courses"
                className="hidden md:inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-primary-500 font-semibold"
              >
                View All Courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials / Social Proof */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Loved by <span className="gradient-text">Students & Teachers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "The AI chatbot understands my course material perfectly. Students get instant answers even when I'm not available.",
                name: "Dr. Priya Sharma",
                role: "Physics Teacher",
                rating: 5,
              },
              {
                quote: "I just uploaded my recordings and the AI created a complete course with chapters, quizzes, and summaries. Incredible!",
                name: "Rajesh Kumar",
                role: "Mathematics Teacher",
                rating: 5,
              },
              {
                quote: "The verified certificate helped me land my first internship. Employers trust Brainwave certificates.",
                name: "Ananya Patel",
                role: "Computer Science Student",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="glass-card p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-12 md:p-16 text-center">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to start your learning journey?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students learning with AI-powered courses. Free to get started.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-xl"
              >
                Start Learning Free <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
