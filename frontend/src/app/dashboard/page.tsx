"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Play, Award, Package, TrendingUp, Clock, ChevronRight, ArrowRight, CheckCircle, ClipboardList, Timer, FileText } from "lucide-react";
import { certApi, enrollmentApi, materialsApi, mockTestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { DashboardLayout, MetricCard, SectionCard, Badge } from "@/components/layout/DashboardLayout";
import { formatPrice } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: enrolledData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => enrollmentApi.myCourses().then((r) => r.data),
  });

  const { data: certData } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certApi.myCertificates().then((r) => r.data),
  });

  const { data: materialPurchases } = useQuery({
    queryKey: ["my-material-purchases"],
    queryFn: () => materialsApi.myPurchases().then((r) => r.data),
  });

  const { data: mockPackages } = useQuery({
    queryKey: ["my-mock-packages"],
    queryFn: () => mockTestsApi.myPackages().then((r) => r.data),
  });

  const courses = enrolledData?.courses || [];
  const certificates = certData?.certificates || [];
  const materials = materialPurchases?.purchases || [];
  const mocks = mockPackages?.packages || [];

  const inProgress = courses.filter((c: any) => (c.progress || 0) > 0 && (c.progress || 0) < 100);
  const completed = courses.filter((c: any) => (c.progress || 0) >= 100);
  const continueCourse = inProgress.sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0))[0];

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Learner"} 👋`}
      subtitle="Here's your learning activity at a glance."
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Enrolled Courses"
          value={courses.length}
          icon={BookOpen}
          color="blue"
          trend={courses.length > 0 ? 12 : undefined}
          trendLabel="vs last month"
        />
        <MetricCard
          label="In Progress"
          value={inProgress.length}
          icon={Play}
          color="orange"
        />
        <MetricCard
          label="Completed"
          value={completed.length}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          label="Certificates"
          value={certificates.length}
          icon={Award}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Continue Learning */}
        <div className="xl:col-span-2 space-y-4">

          {/* Resume card */}
          {continueCourse && (
            <div className="dash-card p-5 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Continue Learning</span>
                  <h3 className="text-lg font-bold mt-1 leading-snug truncate">
                    {(continueCourse.course || continueCourse).title}
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 bg-blue-500/40 rounded-full h-1.5">
                      <div
                        className="bg-white rounded-full h-1.5 transition-all"
                        style={{ width: `${continueCourse.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-blue-100 shrink-0">{continueCourse.progress || 0}%</span>
                  </div>
                </div>
                <Link
                  href={`/learn/${(continueCourse.course || continueCourse).slug}`}
                  className="shrink-0 flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Play className="h-4 w-4" /> Resume
                </Link>
              </div>
            </div>
          )}

          {/* My Courses */}
          <SectionCard
            title="My Courses"
            action={
              <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Browse more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {enrollmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3 p-3">
                    <div className="h-14 w-20 bg-gray-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No courses yet</p>
                <Link href="/courses" className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700">
                  Browse courses <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {courses.slice(0, 5).map((item: any) => {
                  const course = item.course || item;
                  const progress = item.progress || 0;
                  return (
                    <Link
                      key={course.id || item.enrollment_id}
                      href={`/learn/${course.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="h-12 w-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                        {course.thumbnail_url
                          ? <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                          : <BookOpen className="h-5 w-5 text-white/80" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{course.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 bg-gray-100 rounded-full h-1">
                            <div className="bg-blue-500 rounded-full h-1" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{progress}%</span>
                        </div>
                      </div>
                      <Badge variant={progress >= 100 ? "success" : progress > 0 ? "info" : "neutral"}>
                        {progress >= 100 ? "Done" : progress > 0 ? "Active" : "Start"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                    </Link>
                  );
                })}
                {courses.length > 5 && (
                  <Link href="/enrollments" className="flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 font-medium hover:text-blue-700">
                    View all {courses.length} courses <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </SectionCard>

          {/* Mock Test Packages — purchased only */}
          <SectionCard
            title="My Mock Tests"
            action={
              <Link href="/catalog/mock-tests" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                Browse more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {mocks.length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No mock tests purchased yet</p>
                <Link href="/catalog/mock-tests" className="mt-3 inline-flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-700">
                  Explore mock tests <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mocks.slice(0, 4).map((pkg: any) => {
                  const papers = pkg.papers || [];
                  return (
                    <div
                      key={pkg.package_id}
                      className="rounded-xl border border-gray-100 overflow-hidden hover:border-violet-200 transition-colors"
                    >
                      {/* Package header */}
                      <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shrink-0">
                          <ClipboardList className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{pkg.title}</p>
                          <p className="text-[11px] text-gray-500">
                            {papers.length} paper{papers.length !== 1 ? "s" : ""}
                            {pkg.total_duration_minutes ? ` · ${pkg.total_duration_minutes} min total` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Owned
                        </span>
                      </div>

                      {/* Paper list */}
                      {papers.length > 0 && (
                        <div className="divide-y divide-gray-50">
                          {papers.slice(0, 3).map((p: any) => (
                            <Link
                              key={p.id}
                              href={`/mock-tests/take/${p.id}`}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50/40 transition-colors group"
                            >
                              <FileText className="h-4 w-4 text-violet-400 shrink-0" />
                              <span className="text-sm text-gray-700 truncate flex-1">{p.title}</span>
                              {p.time_limit_minutes ? (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                                  <Timer className="h-3 w-3" /> {p.time_limit_minutes}m
                                </span>
                              ) : null}
                              <span className="flex items-center gap-1 text-xs font-semibold text-violet-600 shrink-0">
                                Start <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </Link>
                          ))}
                          {papers.length > 3 && (
                            <p className="px-4 py-2 text-[11px] text-gray-400">+{papers.length - 3} more paper{papers.length - 3 !== 1 ? "s" : ""}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              {[
                { label: "Browse Courses", href: "/courses", icon: BookOpen, color: "text-blue-600 bg-blue-50" },
                { label: "Mock Tests", href: "/catalog/mock-tests", icon: Package, color: "text-orange-600 bg-orange-50" },
                { label: "Study Materials", href: "/catalog/materials", icon: TrendingUp, color: "text-green-600 bg-green-50" },
                { label: "My Certificates", href: "/certificates", icon: Award, color: "text-purple-600 bg-purple-50" },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gray-400" />
                </Link>
              ))}
            </div>
          </SectionCard>

          {/* Certificates */}
          <SectionCard
            title="Certificates"
            action={
              certificates.length > 0
                ? <Link href="/certificates" className="text-xs text-blue-600 font-medium">View all</Link>
                : undefined
            }
          >
            {certificates.length === 0 ? (
              <div className="text-center py-6">
                <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Complete courses to earn certificates</p>
              </div>
            ) : (
              <div className="space-y-2">
                {certificates.slice(0, 3).map((cert: any) => (
                  <div key={cert.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                      <Award className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">{cert.course_name}</p>
                      <p className="text-[11px] text-gray-400">{new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                    {cert.pdf_url && (
                      <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 font-medium shrink-0">
                        PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Study Materials */}
          <SectionCard
            title="Study Materials"
            action={
              <Link href="/catalog/materials" className="text-xs text-blue-600 font-medium">Browse</Link>
            }
          >
            {materials.length === 0 ? (
              <div className="text-center py-6">
                <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No purchases yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {materials.slice(0, 3).map((m: any) => (
                  <Link
                    key={m.product_id}
                    href={`/catalog/materials/${m.slug}`}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <div className="h-7 w-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">{m.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
