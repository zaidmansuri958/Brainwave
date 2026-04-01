"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import {
  Users, BookOpen, DollarSign, TrendingUp, CheckCircle, XCircle, Star, Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

  const { data: pendingTeachers } = useQuery({
    queryKey: ["pending-teachers"],
    queryFn: () => adminApi.pendingTeachers().then((r) => r.data),
  });

  const { data: pendingCourses } = useQuery({
    queryKey: ["pending-courses"],
    queryFn: () => adminApi.pendingCourses().then((r) => r.data),
  });

  const verifyTeacher = useMutation({
    mutationFn: ({ teacherId, status }: { teacherId: string; status: string }) =>
      adminApi.verifyTeacher(teacherId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-teachers"] }),
  });

  const featureCourse = useMutation({
    mutationFn: ({ courseId, featured }: { courseId: string; featured: boolean }) =>
      adminApi.featureCourse(courseId, featured),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-courses"] }),
  });

  const statCards = [
    { label: "Total Users",    value: stats?.total_users || 0,                    icon: Users,      color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Total Courses",  value: stats?.total_courses || 0,                  icon: BookOpen,   color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Total Revenue",  value: formatPrice(stats?.total_revenue || 0),     icon: DollarSign, color: "text-emerald-600",bg: "bg-emerald-50"},
    { label: "Enrollments",    value: stats?.total_enrollments || 0,              icon: TrendingUp, color: "text-amber-600",  bg: "bg-amber-50"  },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display font-extrabold text-2xl text-gray-900 mb-8">Admin Dashboard</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Teachers */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-gray-900 font-semibold">Pending Teacher Verifications</h2>
                  <p className="text-gray-500 text-sm">{pendingTeachers?.length || 0} pending</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {!pendingTeachers?.length ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No pending verifications</div>
                  ) : (
                    pendingTeachers.map((teacher: any) => (
                      <div key={teacher.id} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                          {teacher.user?.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{teacher.user?.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{teacher.user?.email}</p>
                          {teacher.expertise_areas?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{teacher.expertise_areas.join(", ")}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => verifyTeacher.mutate({ teacherId: teacher.id, status: "approved" })}
                            className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => verifyTeacher.mutate({ teacherId: teacher.id, status: "rejected" })}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Courses */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-gray-900 font-semibold">Published Courses Management</h2>
                  <p className="text-gray-500 text-sm">Feature or manage visibility</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {!pendingCourses?.length ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No courses available</div>
                  ) : (
                    pendingCourses.slice(0, 8).map((course: any) => (
                      <div key={course.id} className="p-4 flex items-center gap-4">
                        <div className="w-12 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                          <p className="text-xs text-gray-400">by {course.teacher?.full_name}</p>
                        </div>
                        <button
                          onClick={() => featureCourse.mutate({ courseId: course.id, featured: !course.is_featured })}
                          className={`p-2 rounded-lg transition-colors ${
                            course.is_featured
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                          title={course.is_featured ? "Unfeature" : "Feature"}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            {stats && (
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.active_teachers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active Teachers</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.active_students || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active Students</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.certificates_issued || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Certificates Issued</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_refunds || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending Refunds</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
