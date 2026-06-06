"use client";

import Link from "next/link";
import { ArrowRight, Bot, Video, Brain, Award, Play, TrendingUp, CheckCircle } from "lucide-react";

export function HeroSection() {
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
              <Link href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200">
                Start Learning Free <ArrowRight className="h-4 w-4" />
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
          <div className="relative flex items-center justify-center">
            {/* Main circle bg */}
            <div className="relative h-[420px] w-[420px] lg:h-[480px] lg:w-[480px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-100 to-violet-50" />

              {/* Student figure placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Body */}
                  <div className="flex flex-col items-center">
                    {/* Head */}
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 shadow-lg mb-2" />
                    {/* Hoodie body */}
                    <div className="h-32 w-40 rounded-t-3xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg flex items-end justify-center pb-4">
                      {/* Laptop */}
                      <div className="h-16 w-24 rounded-lg bg-gray-800 border-2 border-gray-700 relative">
                        <div className="absolute inset-1 rounded bg-blue-400/20 flex items-center justify-center">
                          <div className="text-[8px] text-white font-mono opacity-70">{'{ code }'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              {/* AI Tutor card */}
              <div className="absolute left-0 top-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-36">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">AI Tutor</span>
                </div>
                <div className="bg-violet-50 rounded-lg p-2 text-[10px] text-violet-700">
                  Hello! How can I help you today?
                </div>
              </div>

              {/* Live Class card */}
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-40">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-5 w-5 rounded bg-violet-600 flex items-center justify-center">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Live</span>
                  <span className="ml-auto text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">LIVE</span>
                </div>
                <p className="text-[10px] font-semibold text-gray-700">Data Structures in Python</p>
                <p className="text-[9px] text-gray-400">by Arjun Patel</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3].map(i => <div key={i} className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border border-white" />)}
                  <span className="text-[9px] text-gray-400 ml-1">+320</span>
                </div>
              </div>

              {/* Quiz completed */}
              <div className="absolute right-0 bottom-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-36">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] font-semibold text-gray-700">Quiz Completed</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-1">Your Score</p>
                <p className="text-2xl font-extrabold text-violet-600">92%</p>
              </div>

              {/* Progress card */}
              <div className="absolute left-0 bottom-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-36">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-700">Progress</span>
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">75%</p>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-violet-500 rounded-full" />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">Keep it up! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
