"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot, Video, Brain, Award, Play } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function HeroSection() {
  const { isAuthenticated, user } = useAuthStore();
  const ctaHref = isAuthenticated()
    ? user?.role === "teacher" ? "/teacher/dashboard" : "/dashboard"
    : "/register";

  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-violet-50 blur-3xl opacity-60 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-orange-50 blur-3xl opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-100 px-4 py-1.5 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-violet-500" />
              <span className="text-sm font-semibold text-violet-700">AI-Powered Learning Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-4">
              Learn Smarter.<br />
              <span className="relative text-violet-600">
                Achieve Anything.
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none">
                  <path d="M2 6C60 2 120 1 180 2.5C240 4 280 5 298 6" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-md">
              From AI-powered courses and live classes to real doubt sessions and verified certificates — everything you need to master new skills and get ahead in your career.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link href={ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200">
                {isAuthenticated() ? "Go to Dashboard" : "Start Learning Free"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/courses"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600">
                  <Play className="h-3 w-3 text-white fill-white" />
                </div>
                Explore Courses
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Bot, label: "AI Tutor", sub: "24/7" },
                { icon: Video, label: "Live Classes", sub: "Learn Live" },
                { icon: Brain, label: "Smart Quizzes", sub: "Practice & Improve" },
                { icon: Award, label: "Certificates", sub: "Boost Your Resume" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Illustration */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[580px] lg:max-w-[640px]">
              {/* Soft glow behind image */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-violet-200 to-violet-100 blur-3xl opacity-70" />
              <Image
                src="/images/hero-student.png"
                alt="Student learning with AI on Brainwave"
                width={640}
                height={640}
                className="relative object-contain w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
