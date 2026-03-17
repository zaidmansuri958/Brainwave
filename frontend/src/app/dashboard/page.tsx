"use client";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi, certApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import Link from "next/link";
import {
  BookOpen,
  Award,
  Search,
  GraduationCap,
  Compass,
  Bell,
  User,
  TrendingUp,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";
import { RippleEffect } from "@/components/ui/ripple-effect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: enrolledData, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => enrollmentApi.myCourses().then((r) => r.data),
  });

  const { data: certData } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certApi.myCertificates().then((r) => r.data),
  });

  const courses = enrolledData?.courses || [];
  const certificates = certData?.certificates || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#030014]">
      <Navbar />
      <main className="flex-1 w-full">
        {/* Dark Hero Section */}
        <FadeIn>
          <section className="relative overflow-hidden">
            {/* Mesh gradient background */}
            <div className="absolute inset-0 bg-[#030014]">
              <div className="absolute top-0 left-1/4 h-[400px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
              <div className="absolute top-0 right-1/4 h-[300px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-[600px] rounded-full bg-indigo-500/5 blur-[80px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <p className="text-gray-400 text-sm mb-2">Welcome back</p>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Hello,{" "}
                <GradientText className="text-3xl md:text-5xl font-bold">
                  {user?.full_name?.split(" ")[0] || "Learner"}
                </GradientText>
                <span className="ml-3 inline-block animate-bounce text-3xl md:text-4xl">👋</span>
              </h1>
              <p className="text-gray-400 mt-3 text-base md:text-lg max-w-xl">
                Continue your learning journey and track your progress across all enrolled courses.
              </p>
            </div>
          </section>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Cards */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-6 relative z-10">
              {/* Enrolled Courses */}
              <div className="group bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all" />
                  <div className="relative h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{courses.length}</p>
                  <p className="text-sm text-gray-400 font-medium">Enrolled Courses</p>
                </div>
              </div>

              {/* Certificates */}
              <div className="group bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-500/30 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl group-hover:bg-amber-500/30 transition-all" />
                  <div className="relative h-14 w-14 rounded-2xl bg-amber-600/20 border border-amber-500/20 flex items-center justify-center">
                    <Award className="h-7 w-7 text-amber-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{certificates.length}</p>
                  <p className="text-sm text-gray-400 font-medium">Certificates Earned</p>
                </div>
              </div>

              {/* In Progress */}
              <div className="group bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:bg-emerald-500/30 transition-all" />
                  <div className="relative h-14 w-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {courses.filter((c: any) => c.course?.enrolled_count > 0).length}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">In Progress</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 rounded-xl bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-indigo-500/30"
                onClick={() => router.push("/courses")}
              >
                <Compass className="h-4 w-4 text-indigo-400" />
                Browse Courses
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-amber-500/30"
                onClick={() => {
                  const el = document.getElementById("certificates-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Award className="h-4 w-4 text-amber-400" />
                My Certificates
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-purple-500/30"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-4 w-4 text-purple-400" />
                Notifications
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-emerald-500/30"
                onClick={() => router.push("/profile")}
              >
                <User className="h-4 w-4 text-emerald-400" />
                Profile
              </Button>
            </div>
          </FadeIn>

          <div className="border-t border-white/5" />

          {/* My Courses */}
          <FadeIn delay={0.3}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">My Courses</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {courses.length > 0
                      ? `You have ${courses.length} enrolled course${courses.length !== 1 ? "s" : ""}`
                      : "Start your learning journey today"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="gap-1 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-semibold"
                  onClick={() => router.push("/courses")}
                >
                  Browse more
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-44 w-full rounded-xl bg-white/5" />
                      <Skeleton className="h-4 w-3/4 bg-white/5" />
                      <Skeleton className="h-4 w-1/2 bg-white/5" />
                      <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="relative text-center py-16 rounded-2xl border border-white/10 bg-gray-900/30 overflow-hidden">
                  <div className="absolute inset-0">
                    <RippleEffect color="rgba(99,102,241,0.06)" count={3} />
                  </div>
                  <div className="relative z-10">
                    <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      No courses yet
                    </h3>
                    <p className="text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
                      Explore our catalog and start learning with India&apos;s best teachers today!
                    </p>
                    <Button
                      variant="shimmer"
                      size="lg"
                      className="rounded-xl"
                      onClick={() => router.push("/courses")}
                    >
                      <Compass className="h-5 w-5 mr-2" />
                      Browse Courses
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((item: any, idx: number) => (
                    <FadeIn key={item.enrollment_id} delay={idx * 0.05}>
                      <div className="relative">
                        <CourseCard course={item.course} />
                        <div className="mt-2">
                          <Button
                            className="w-full rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => router.push(`/learn/${item.course.slug}`)}
                          >
                            Continue Learning →
                          </Button>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Certificates Section */}
          {certificates.length > 0 && (
            <FadeIn delay={0.4}>
              <div id="certificates-section">
                <div className="border-t border-white/5 mb-8" />
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">My Certificates</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    You&apos;ve earned {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert: any, idx: number) => (
                    <FadeIn key={cert.id} delay={idx * 0.05}>
                      <div className="group bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg group-hover:bg-amber-500/30 transition-all" />
                              <div className="relative h-12 w-12 rounded-xl bg-amber-600/20 border border-amber-500/20 flex items-center justify-center">
                                <Award className="h-6 w-6 text-amber-400" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-white truncate">
                                {cert.course_name}
                              </h3>
                              <p className="text-sm text-gray-400">
                                by {cert.teacher_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(cert.issued_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 rounded-lg"
                              onClick={() => router.push(`/verify/${cert.id}`)}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Verify
                            </Button>
                            {cert.pdf_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 rounded-lg"
                                asChild
                              >
                                <a
                                  href={cert.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-3.5 w-3.5 mr-1.5" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
