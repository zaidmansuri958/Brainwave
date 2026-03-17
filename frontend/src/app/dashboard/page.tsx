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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        {/* Gradient Welcome Banner */}
        <FadeIn>
          <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWNkgyVjRoMzR6TTIgMzR2LTJoMzR2Mkg0MHYySDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-bold text-white">
                  Welcome back, {user?.full_name?.split(" ")[0]}!
                </h1>
                <span className="text-3xl md:text-4xl animate-bounce inline-block">👋</span>
              </div>
              <p className="text-primary-100 mt-2 text-base md:text-lg max-w-xl">
                Continue your learning journey and track your progress across all enrolled courses.
              </p>
            </div>
          </section>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Cards */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-12 relative z-10">
              {/* Enrolled Courses */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{courses.length}</p>
                    <p className="text-sm text-muted-foreground font-medium">Enrolled Courses</p>
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{certificates.length}</p>
                    <p className="text-sm text-muted-foreground font-medium">Certificates Earned</p>
                  </div>
                </CardContent>
              </Card>

              {/* In Progress */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {courses.filter((c: any) => c.course?.enrolled_count > 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          {/* Quick Actions Bar */}
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => router.push("/courses")}
              >
                <Compass className="h-4 w-4" />
                Browse Courses
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => {
                  const el = document.getElementById("certificates-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Award className="h-4 w-4" />
                My Certificates
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => router.push("/profile")}
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </div>
          </FadeIn>

          <Separator />

          {/* My Courses */}
          <FadeIn delay={0.3}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">My Courses</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {courses.length > 0
                      ? `You have ${courses.length} enrolled course${courses.length !== 1 ? "s" : ""}`
                      : "Start your learning journey today"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="gap-1 text-primary-600 hover:text-primary-700 font-semibold"
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
                      <Skeleton className="h-44 w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-muted">
                  <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No courses yet
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((item: any, idx: number) => (
                    <FadeIn key={item.enrollment_id} delay={idx * 0.05}>
                      <div className="relative">
                        <CourseCard course={item.course} />
                        <div className="mt-2">
                          <Button
                            className="w-full rounded-lg font-semibold"
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
                <Separator className="mb-8" />
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground">My Certificates</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    You&apos;ve earned {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert: any, idx: number) => (
                    <FadeIn key={cert.id} delay={idx * 0.05}>
                      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-gray-900 dark:to-orange-950/30 ring-1 ring-amber-200/50 dark:ring-amber-800/30">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                              <Award className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {cert.course_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                by {cert.teacher_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(cert.issued_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                              onClick={() => router.push(`/verify/${cert.id}`)}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Verify
                            </Button>
                            {cert.pdf_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30 rounded-lg"
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
                        </CardContent>
                      </Card>
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
