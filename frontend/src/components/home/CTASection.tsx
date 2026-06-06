"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingUp, Play } from "lucide-react";
export function CTASection() {
  return (
    <section className="py-16 mx-4 sm:mx-6 lg:mx-8 mb-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-violet-700 to-purple-800 px-8 py-14 lg:px-16">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute left-1/2 bottom-0 h-48 w-48 rounded-full bg-violet-400/30 blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                Ready to Transform<br />Your Future?
              </h2>
              <p className="text-violet-200 text-base mb-8 leading-relaxed">
                Join thousands of learners who are already building skills and achieving their dreams.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors shadow-lg">
                  Start Learning Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/courses"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
                  Explore Courses
                </Link>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-violet-200">
                {["No credit card required", "Cancel anytime", "Learn at your own pace"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-300" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative h-56 w-56 lg:h-64 lg:w-64">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                {/* Student figure */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-amber-200" />
                  <div className="h-20 w-28 rounded-t-2xl bg-violet-400/60" />
                </div>
                {/* Floating elements */}
                <div className="absolute -top-2 -right-4 bg-white rounded-xl p-2.5 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold text-gray-800">+92% Growth</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-4 bg-white rounded-xl p-2.5 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <Play className="h-4 w-4 text-violet-600 fill-violet-600" />
                    <span className="text-xs font-bold text-gray-800">1K+ Lessons</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
