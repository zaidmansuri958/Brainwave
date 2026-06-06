"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, ChevronRight, TrendingUp } from "lucide-react";
import { teacherApi } from "@/lib/api";
import { DashboardLayout, SectionCard, MetricCard, Badge } from "@/components/layout/DashboardLayout";

export default function TeacherStudentsOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherApi.myCourses().then((r) => r.data),
  });

  const courses = data || [];
  const totalStudents = courses.reduce((sum: number, c: any) => sum + Number(c.enrolled_count || 0), 0);

  return (
    <DashboardLayout
      title="Students"
      subtitle="View and manage students across all your courses."
      breadcrumbs={[{ label: "Teacher Studio" }, { label: "Students" }]}
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard label="Total Students" value={totalStudents} icon={Users} color="blue" />
        <MetricCard label="Active Courses" value={courses.length} icon={BookOpen} color="green" />
      </div>

      <SectionCard
        title="Students by Course"
        subtitle="Click a course to view its full student roster"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-50 rounded-xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No courses yet. Create a course to see students.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/teacher/courses/${course.id}/students`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group"
              >
                <div className="h-12 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 shrink-0 flex items-center justify-center">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    : <BookOpen className="h-4 w-4 text-white/70" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={course.status === "published" ? "success" : "warning"}>{course.status}</Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-gray-900">{course.enrolled_count || 0}</p>
                  <p className="text-xs text-gray-400">students</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
