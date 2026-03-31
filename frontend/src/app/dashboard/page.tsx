"use client";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi, certApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  BookOpen, Award, TrendingUp, Search, ArrowRight,
  Play, CheckCircle2, Clock, ExternalLink, Download,
  Sparkles, Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-display font-extrabold text-2xl text-gray-900 leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-2 bg-gray-100 rounded-full w-full mt-3" />
      </div>
    </div>
  );
}

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
  const inProgress = courses.filter((c: any) => c.progress > 0 && c.progress < 100);
  const completed = courses.filter((c: any) => c.progress >= 100);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* ── Welcome ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 leading-tight">
              Welcome back, {user?.full_name?.split(" ")[0] || "Learner"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Pick up where you left off.</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-button-indigo transition-colors"
          >
            <Search className="w-4 h-4" /> Browse courses
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={BookOpen}    label="Enrolled"   value={courses.length}      sub="total courses"           color="bg-indigo-50 text-indigo-600" />
          <StatCard icon={TrendingUp}  label="In Progress" value={inProgress.length}  sub="active learning"          color="bg-violet-50 text-violet-600" />
          <StatCard icon={CheckCircle2}label="Completed"  value={completed.length}    sub="courses finished"         color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Award}       label="Certificates" value={certificates.length} sub="blockchain verified"    color="bg-amber-50 text-amber-600" />
        </div>

        {/* ── AI Tutor Prompt Card ── */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-card p-5 mb-10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Your AI Tutor is ready</p>
            <p className="text-xs text-gray-500 mt-0.5">Ask anything about your enrolled courses — available 24/7.</p>
          </div>
          <Link
            href="/learn"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 flex-shrink-0"
          >
            Open tutor <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Continue Learning ── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-gray-900">Continue learning</h2>
            <Link href="/courses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Browse more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card text-center py-16 px-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 text-sm mb-6">Start learning with India&apos;s best teachers</p>
              <Link href="/courses" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-button-indigo transition-colors">
                Explore courses
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((item: any) => {
                const course = item.course || item;
                const progress = item.progress || 0;
                return (
                  <div key={item.enrollment_id || course.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-indigo-100 to-violet-100 relative">
                      {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                          <Play className="w-4 h-4 text-indigo-600 fill-indigo-600 ml-0.5" />
                        </div>
                      </div>
                      {progress > 0 && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/30">
                          <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm text-gray-900 leading-snug mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">by {course.teacher_name}</p>

                      {/* Progress */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>{progress}% complete</span>
                        {progress === 100 && <span className="text-emerald-600 font-semibold">Completed</span>}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                          style={{ width: `${Math.max(progress, 3)}%` }}
                        />
                      </div>

                      <Link
                        href={`/learn/${course.slug}`}
                        className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-xs hover:bg-indigo-700 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        {progress > 0 ? "Continue" : "Start learning"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Certificates ── */}
        {certificates.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-5">My certificates</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-amber-100 shadow-card p-5 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      Blockchain verified
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-gray-900 mb-1 line-clamp-2">{cert.course_name}</h3>
                  <p className="text-xs text-gray-500 mb-1">by {cert.teacher_name}</p>
                  <p className="text-xs text-gray-400 mb-4">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/verify/${cert.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Verify
                    </Link>
                    {cert.pdf_url && (
                      <a
                        href={cert.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-amber-200 text-amber-700 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
