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
          <Link href="/teacher/students" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-sky-700">
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
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-32 animate-pulse rounded-xl border border-gray-200/10 bg-black/5" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-xl border border-gray-200 border-dashed bg-white px-6 py-16 text-center shadow-sm">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className=" text-2xl  uppercase tracking-tight text-gray-900">No enrolled students yet</p>
                <p className="mt-2 text-sm font-bold text-gray-500">When students enroll, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student: any) => (
                  <div key={student.student_id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-200 bg-blue-100 text-2xl  text-black shadow-sm">
                          {(student.name || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className=" text-xl  uppercase tracking-tight text-gray-900">{student.name}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-gray-600">
                            <Mail className="h-4 w-4" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-block rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold  ${student.risk_level === "high" ? "bg-orange-500 text-white" : student.risk_level === "medium" ? "bg-yellow-300 text-black" : "bg-green-100 text-black"}`}>
                          {student.risk_level} risk
                        </span>
                        <span className="inline-block rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black ">
                          {student.progress_percent}% complete
                        </span>
                        <button
                          onClick={() => teacherApi.nudge(params.id, student.student_id)}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-pink-100 px-5 py-2 text-xs font-semibold text-black  transition-transform hover:-translate-y-1 hover:shadow-sm"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Send nudge
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 h-3 overflow-hidden rounded-full border border-gray-200 bg-slate-100">
                      <div className="h-full border-r-2 border-black bg-yellow-300" style={{ width: `${Math.max(student.progress_percent || 0, 4)}%` }} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                      <span>Enrolled: {formatDate(student.enrolled_at)}</span>
                      <span>•</span>
                      <span>Last active: {student.last_active ? formatDate(student.last_active) : "Not yet"}</span>
                      {student.risk_level === "high" ? (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-orange-500">
                            <AlertTriangle className="h-4 w-4" />
                            Needs attention
                          </span>
                        </>
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
