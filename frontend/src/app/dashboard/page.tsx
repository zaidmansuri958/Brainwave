"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, BookOpen, ClipboardList, Play, Sparkles } from "lucide-react";
import { certApi, enrollmentApi, materialsApi, mockTestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell, ContentBand, EmptyStatePanel, MetricCard, SectionHeader, StatusBadge } from "@/components/ui/app-shell";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: enrolledData, isLoading: enrollmentsLoading, isError: enrollmentsError, refetch: refetchEnrollments } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => enrollmentApi.myCourses().then((response) => response.data),
  });

  const { data: certData } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certApi.myCertificates().then((response) => response.data),
  });

  const { data: materialPurchases } = useQuery({
    queryKey: ["my-material-purchases"],
    queryFn: () => materialsApi.myPurchases().then((response) => response.data),
  });

  const { data: mockPackages } = useQuery({
    queryKey: ["my-mock-packages"],
    queryFn: () => mockTestsApi.myPackages().then((response) => response.data),
  });

  const courses = enrollmentsError ? [] : enrolledData?.courses || [];
  const certificates = certData?.certificates || [];
  const materials = materialPurchases?.purchases || [];
  const mocks = mockPackages?.packages || [];

  const inProgress = courses.filter((course: any) => (course.progress || 0) > 0 && (course.progress || 0) < 100);
  const completed = courses.filter((course: any) => (course.progress || 0) >= 100);
  const continueCourse = [...inProgress].sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0))[0];

  return (
    <AppShell className="flex flex-col">
      <Navbar />
      <main className="bw-shell flex-1 space-y-6 pb-6">
        <ContentBand muted>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="eyebrow mb-4">Learning Hub</span>
              <h1 className="font-display text-4xl font-extrabold text-slate-950">
                Welcome back, {user?.full_name?.split(" ")[0] || "Learner"}.
              </h1>
              <p className="bw-muted mt-4 max-w-2xl text-sm leading-7 sm:text-base">
                Your learner home is now denser and more guided, with a clearer next action, stronger progress visibility,
                and faster access to practice, certificates, and AI support.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={continueCourse ? `/learn/${(continueCourse.course || continueCourse).slug}` : "/courses"} className="bw-action-primary">
                  <Play className="h-4 w-4" />
                  {continueCourse ? "Resume learning" : "Browse courses"}
                </Link>
                <Link href="/courses" className="bw-action-secondary">
                  <BookOpen className="h-4 w-4" />
                  Explore more
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bw-card bw-card-tint p-5">
                <div className="flex items-center justify-between">
                  <p className="bw-kicker">AI Tutor</p>
                  <StatusBadge tone="info">Always on</StatusBadge>
                </div>
                <p className="mt-4 font-display text-2xl font-extrabold text-slate-950">Ask about any enrolled course.</p>
                <p className="bw-muted mt-2 text-sm leading-7">
                  Summaries, concept explanations, revision help, and course-aware chat now surface more naturally across the learner experience.
                </p>
                <Link href="/courses" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  Open learning catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Enrolled" value={courses.length} detail="active learning paths" icon={BookOpen} accentClass="bg-indigo-50 text-indigo-600" />
                <MetricCard label="In progress" value={inProgress.length} detail="currently moving" icon={Play} accentClass="bg-sky-50 text-sky-600" />
                <MetricCard label="Certificates" value={certificates.length} detail="verified completions" icon={Award} accentClass="bg-amber-50 text-amber-600" />
              </div>
            </div>
          </div>
        </ContentBand>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <ContentBand className="h-full">
            <SectionHeader
              eyebrow="Continue Learning"
              title="Pick up exactly where you left off."
              action={
                <Link href="/courses" className="bw-action-secondary">
                  Browse more
                </Link>
              }
            />

            {enrollmentsLoading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="bw-card h-[250px] animate-pulse bg-white/70" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-6">
                <EmptyStatePanel title="No courses yet" description="Start learning with expert-led courses, AI tutoring, and progress-aware guidance." icon={BookOpen} action={<Link href="/courses" className="bw-action-primary">Explore courses</Link>} />
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {courses.slice(0, 4).map((item: any) => {
                  const course = item.course || item;
                  const progress = item.progress || 0;
                  return (
                    <div key={item.enrollment_id || course.id} className="bw-card overflow-hidden">
                      <div className="h-36 bg-gradient-to-br from-indigo-100 via-sky-50 to-amber-50">
                        {course.thumbnail_url ? <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{course.category || "Course"}</p>
                        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-slate-950">{course.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">By {course.teacher?.full_name || course.teacher_name || "Expert instructor"}</p>
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>{progress}% complete</span>
                            {progress >= 100 ? <StatusBadge tone="success">Completed</StatusBadge> : null}
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" style={{ width: `${Math.max(progress, 6)}%` }} />
                          </div>
                        </div>
                        <Link href={`/learn/${course.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
                          <Play className="h-4 w-4 fill-white" />
                          {progress > 0 ? "Continue" : "Start learning"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {enrollmentsError ? (
              <button type="button" onClick={() => refetchEnrollments()} className="mt-4 bw-action-secondary">
                Retry course load
              </button>
            ) : null}
          </ContentBand>

          <div className="grid gap-6">
            <ContentBand muted className="h-full">
              <SectionHeader eyebrow="Practice & Assets" title="Keep momentum with quick-access tools." />
              <div className="mt-6 grid gap-3">
                <div className="bw-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-950">AI support</p>
                      <p className="text-sm text-slate-500">Course-aware explanations and revision help.</p>
                    </div>
                  </div>
                </div>
                <div className="bw-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-950">{materials.length} study materials</p>
                      <p className="text-sm text-slate-500">Purchased resources and downloadable packs.</p>
                    </div>
                  </div>
                  <Link href="/catalog/materials" className="mt-4 inline-flex text-sm font-semibold text-indigo-700">
                    Open materials
                  </Link>
                </div>
                <div className="bw-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-950">{mocks.length} mock test packages</p>
                      <p className="text-sm text-slate-500">Revision and assessment shortcuts without extra hunting.</p>
                    </div>
                  </div>
                  <Link href="/catalog/mock-tests" className="mt-4 inline-flex text-sm font-semibold text-indigo-700">
                    Open practice
                  </Link>
                </div>
              </div>
            </ContentBand>

            {certificates.length > 0 ? (
              <ContentBand className="h-full">
                <SectionHeader eyebrow="Certificates" title="Your verified achievements" />
                <div className="mt-6 space-y-3">
                  {certificates.slice(0, 3).map((certificate: any) => (
                    <div key={certificate.id} className="bw-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-bold text-slate-950">{certificate.course_name}</p>
                          <p className="text-sm text-slate-500">By {certificate.teacher_name}</p>
                        </div>
                        <StatusBadge tone="success">Verified</StatusBadge>
                      </div>
                      <Link href={`/verify/${certificate.id}`} className="mt-3 inline-flex text-sm font-semibold text-indigo-700">
                        View certificate
                      </Link>
                    </div>
                  ))}
                </div>
              </ContentBand>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}
