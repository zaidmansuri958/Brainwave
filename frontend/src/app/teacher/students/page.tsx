"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { teacherApi } from "@/lib/api";
import { MetricCard, PanelCard, PanelHero, PanelPage, SectionHeader } from "@/components/panels/PanelPrimitives";

export default function TeacherStudentsOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherApi.myCourses().then((r) => r.data),
  });

  const courses = data || [];
  const totalStudents = courses.reduce((sum: number, course: any) => sum + Number(course.enrolled_count || 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PanelPage>
        <PanelHero
          eyebrow="Faculty Panel"
          title="Student roster overview."
          description="The current backend exposes student lists per course, so this page acts as a fast launchpad into each course roster instead of pretending there is one unified API."
          chips={[`${courses.length} courses`, `${totalStudents} total students`]}
        />

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <MetricCard icon={BookOpen} label="Courses" value={courses.length} hint="Published and draft products you manage" tone="blue" />
          <MetricCard icon={Users} label="Students" value={totalStudents} hint="Aggregated from enrolled counts across courses" tone="violet" />
        </section>

        <section className="mt-8">
          <PanelCard>
            <SectionHeader title="Browse by course" description="Open a roster to view student-level progress and risk." />
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-32 animate-pulse rounded-[1.25rem] bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {courses.map((course: any) => (
                  <Link
                    key={course.id}
                    href={`/teacher/courses/${course.id}/students`}
                    className="rounded-[1.4rem] border border-slate-200 bg-white/85 p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{course.status}</p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">{course.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{Number(course.enrolled_count || 0)} students enrolled</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                      Open roster
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </PanelCard>
        </section>
      </PanelPage>
      <Footer />
    </div>
  );
}
