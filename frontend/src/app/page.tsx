import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import { BookOpen, Brain, Award, Shield, Users, Zap, Star, ArrowRight, GraduationCap } from "lucide-react";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary-200" />
              <span className="text-primary-200 font-semibold">India's AI-Powered Learning Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Learn from India's Best Teachers.{" "}
              <span className="text-primary-200">Powered by AI.</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl">
              Teachers upload their recordings — AI creates the course. Students get an AI chatbot, 
              live sessions, and verified certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
              >
                Browse Courses <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register?role=teacher"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Teach on Brainwave
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-primary-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Everything You Need to Learn or Teach
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
              Built for India — from non-technical teachers to ambitious students.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Popular Courses
              </h2>
              <Link
                href="/courses"
                className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
              >
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

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of students learning with AI-powered courses.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
          >
            Start Learning Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
