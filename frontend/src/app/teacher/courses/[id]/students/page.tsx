"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Mail, ShieldAlert, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { teacherApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PanelCard, PanelHero, PanelPage, SectionHeader } from "@/components/panels/PanelPrimitives";

function riskTone(risk: string) {
  if (risk === "high") return "border-rose-200 bg-rose-50 text-rose-700";
  if (risk === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function TeacherCourseStudentsPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-course-students", params.id],
    queryFn: () => teacherApi.students(params.id).then((r) => r.data),
  });

  const students = data?.students || [];
  const atRisk = students.filter((student: any) => student.risk_level === "high");

  return (
    <div className="min-h-screen">
      <Navbar />
      <PanelPage>
        <div className="mb-5">
          <Link href="/teacher/students" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-700">
            <ArrowLeft className="h-4 w-4" />
            Back to student overview
          </Link>
        </div>

        <PanelHero
          eyebrow="Faculty Panel"
          title="Course student roster."
          description="Progress, engagement risk, and last activity are grouped together here so the teacher can intervene quickly."
          chips={[`${students.length} students`, `${atRisk.length} high-risk learners`]}
        />

        <section className="mt-8">
          <PanelCard>
            <SectionHeader title="Learners" description="Live roster derived directly from the course-level teacher API." />
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-[1.25rem] bg-slate-100" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/80 px-6 py-14 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 text-lg font-bold text-slate-900">No enrolled students yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student: any) => (
                  <div key={student.student_id} className="rounded-[1.4rem] border border-slate-200 bg-white/85 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                          {(student.name || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-950">{student.name}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="h-4 w-4" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${riskTone(student.risk_level)}`}>
                          {student.risk_level} risk
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          {student.progress_percent}% complete
                        </span>
                        <button
                          onClick={() => teacherApi.nudge(params.id, student.student_id)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Send nudge
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500" style={{ width: `${Math.max(student.progress_percent || 0, 4)}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                      <span>Enrolled {formatDate(student.enrolled_at)}</span>
                      <span>Last active {student.last_active ? formatDate(student.last_active) : "Not yet"}</span>
                      {student.risk_level === "high" ? (
                        <span className="inline-flex items-center gap-1 text-rose-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Needs attention
                        </span>
                      ) : null}
                    </div>
                  </div>
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
