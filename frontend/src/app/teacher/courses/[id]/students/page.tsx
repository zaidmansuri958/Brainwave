"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Users, Mail, Bell, Clock, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { teacherApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    high:   "bg-red-50   text-red-700   border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low:    "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${map[level] ?? map.low}`}>
      {level === "high" && <AlertTriangle className="h-3 w-3" />}
      {level} risk
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-violet-500" : value >= 20 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(value, 2)}%` }} />
    </div>
  );
}

export default function TeacherCourseStudentsPage({ params }: { params: { id: string } }) {
  const [nudging, setNudging] = useState<string | null>(null);
  const [search,  setSearch]  = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-course-students", params.id],
    queryFn:  () => teacherApi.students(params.id).then(r => r.data),
  });

  const { data: course } = useQuery({
    queryKey: ["teacher-course", params.id],
    queryFn:  () => teacherApi.getCourse(params.id).then(r => r.data),
  });

  const allStudents: any[] = data?.students || [];
  const students = allStudents.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const atRisk   = allStudents.filter(s => s.risk_level === "high").length;
  const avgProg  = allStudents.length ? Math.round(allStudents.reduce((s, st) => s + (st.progress_percent || 0), 0) / allStudents.length) : 0;

  const handleNudge = async (studentId: string) => {
    setNudging(studentId);
    try {
      await teacherApi.nudge(params.id, studentId);
      toast({ title: "Nudge sent!", description: "Student will receive a notification." });
    } catch {
      toast({ title: "Couldn't send nudge", variant: "destructive" });
    } finally {
      setNudging(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Students" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "My Courses", href: "/teacher/courses" }, { label: "Students" }]}>
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={course?.title || "Students"}
      subtitle="Monitor progress, engagement and at-risk learners"
      breadcrumbs={[
        { label: "Teacher",    href: "/teacher/dashboard" },
        { label: "My Courses", href: "/teacher/courses"   },
        { label: "Students"                                },
      ]}
    >
      <div className="max-w-4xl py-6">
        <CourseManageNav courseId={params.id} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Users,        label: "Total Students",   value: allStudents.length, iconBg: "bg-blue-50",   iconColor: "text-blue-600"  },
            { icon: AlertTriangle,label: "At-Risk Students", value: atRisk,             iconBg: "bg-red-50",    iconColor: "text-red-500"   },
            { icon: TrendingUp,   label: "Avg Completion",   value: `${avgProg}%`,      iconBg: "bg-green-50",  iconColor: "text-green-600" },
          ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        {allStudents.length > 5 && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-5 shadow-sm">
            <Users className="h-4 w-4 text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent" />
          </div>
        )}

        {/* Students list */}
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 mb-4">
              <Users className="h-7 w-7 text-violet-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">
              {search ? "No students match your search" : "No enrolled students yet"}
            </p>
            <p className="text-sm text-gray-500">
              {search ? "Try a different name or email" : "Students will appear here once they enroll."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student: any) => (
              <div key={student.student_id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                  student.risk_level === "high"
                    ? "border-red-200 hover:border-red-300"
                    : "border-gray-200 hover:border-violet-200 hover:shadow-md"
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Left — avatar + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 text-sm font-bold ${
                      student.risk_level === "high" ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"
                    }`}>
                      {(student.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right — badges + nudge */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <RiskBadge level={student.risk_level || "low"} />
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                      (student.progress_percent || 0) >= 80
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {student.progress_percent || 0}% done
                    </span>
                    <button onClick={() => handleNudge(student.student_id)} disabled={nudging === student.student_id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-[11px] font-bold px-3 py-1.5 transition-colors disabled:opacity-50">
                      {nudging === student.student_id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Bell className="h-3 w-3" />}
                      Nudge
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <ProgressBar value={student.progress_percent || 0} />
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Enrolled {formatDate(student.enrolled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last active: {student.last_active ? formatDate(student.last_active) : "Never"}
                  </span>
                  {student.risk_level === "high" && (
                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                      <AlertTriangle className="h-3 w-3" /> Needs attention
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
