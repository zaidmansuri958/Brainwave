"use client";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi, certApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import Link from "next/link";
import { BookOpen, Award, Search, GraduationCap, Sparkles, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { user } = useAuthStore();

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-glow">
              {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {user?.full_name?.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">Continue your learning journey</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="glass-card p-5 flex items-center gap-4 card-hover">
            <div className="h-12 w-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4 card-hover">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Certificates</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4 card-hover">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courses.filter((c: any) => c.course?.enrolled_count > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              My Courses
            </h2>
            <Link href="/courses" className="text-primary-500 text-sm font-semibold hover:text-primary-600 flex items-center gap-1 transition-colors">
              Browse more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card aspect-[4/3] animate-pulse">
                  <div className="h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No courses yet</h3>
              <p className="text-muted-foreground mt-1 mb-6">Start learning with the best teachers</p>
              <Link href="/courses">
                <Button variant="gradient" className="rounded-2xl">
                  Browse Courses <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((item: any) => (
                <div key={item.enrollment_id}>
                  <CourseCard course={item.course} />
                  <div className="mt-3">
                    <Link href={`/learn/${item.course.slug}`}>
                      <Button variant="gradient" size="sm" className="w-full rounded-xl">
                        Continue Learning <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {certificates.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              My Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert: any) => (
                <div key={cert.id} className="glass-card p-5 card-hover">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{cert.course_name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">by {cert.teacher_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/verify/${cert.id}`} className="flex-1">
                      <Button variant="glass" size="sm" className="w-full text-amber-600 dark:text-amber-400">
                        Verify
                      </Button>
                    </Link>
                    {cert.pdf_url && (
                      <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="glass" size="sm" className="w-full">
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
