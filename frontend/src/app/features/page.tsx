"use client";

import Link from "next/link";
import { BarChart3, Brain, GraduationCap, Shield, Sparkles, Wallet, Video, HelpCircle, Award, BookOpen, Users, Cpu } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI Course Creation",
    desc: "Upload materials and AI auto-generates chapters, lessons, summaries, quizzes, and thumbnails — in minutes.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Video,
    title: "Live Sessions",
    desc: "Host Jitsi-powered live classes with recording, screen sharing, and up to 100 participants.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: HelpCircle,
    title: "Doubt Sessions",
    desc: "Bookable 1-on-1 or group doubt clearing sessions — with Razorpay payment built in.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Award,
    title: "Certificates",
    desc: "Auto-issue verifiable digital certificates when students complete courses.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track student progress, quiz scores, engagement rates, and earnings in real time.",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Razorpay-powered payments with instant payouts, refund management, and invoicing.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: BookOpen,
    title: "Mock Tests",
    desc: "Timed mock exams with multi-section support, auto-scoring, and detailed review.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Course discussion boards with Q&A, teacher moderation, and AI-assisted answers.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    desc: "Contextual AI chatbot per course — answers questions based on actual lesson content.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="page-container text-center max-w-2xl mx-auto">
          <span className="section-eyebrow">Platform Features</span>
          <h1 className="section-title mt-3">Everything for modern education</h1>
          <p className="section-subtitle mx-auto mt-4">
            A complete LMS built for AI-first educators and ambitious learners across India.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register" className="btn btn-lg btn-primary">Get started free <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/courses" className="btn btn-lg btn-secondary">Browse courses</Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 card-hover">
                <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="page-container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to experience it?</h2>
          <p className="text-blue-200 mb-6">Join thousands of students and educators on Brainwave.</p>
          <Link href="/register" className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 font-semibold border-0">
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
