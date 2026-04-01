"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Plus, Edit, Eye, Archive, Star, Users, BookOpen, Loader2, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft:      "bg-amber-50 text-amber-700 border border-amber-100",
  processing: "bg-blue-50 text-blue-700 border border-blue-100",
  published:  "bg-emerald-50 text-emerald-700 border border-emerald-100",
  archived:   "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function TeacherCoursesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherApi.myCourses().then((r) => r.data),
  });

  const archiveCourse = useMutation({
    mutationFn: (courseId: string) => teacherApi.archiveCourse(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-courses"] }),
  });

  const courses = data || [];

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">My Courses</h1>
            <p className="text-gray-400 text-sm mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/teacher/courses/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-button-indigo"
          >
            <Plus className="h-4 w-4" /> New Course
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first course and let AI build it for you</p>
            <Link
              href="/teacher/courses/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-button-indigo"
            >
              <Sparkles className="h-4 w-4" /> Create with AI
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course: any) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card flex flex-col sm:flex-row gap-4"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-40 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${statusColors[course.status] || statusColors.draft}`}>
                      {course.status}
                    </span>
                    {course.is_featured && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">Featured</span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-lg truncate">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mt-1">{course.description}</p>

                  <div className="flex flex-wrap gap-5 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {course.enrolled_count || 0} students
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {course.avg_rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="font-semibold text-gray-900">{formatPrice(course.price)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/teacher/courses/${course.id}/edit`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Link>
                  {course.status !== "archived" && (
                    <button
                      onClick={() => {
                        if (confirm("Archive this course? Students will lose access.")) {
                          archiveCourse.mutate(course.id);
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
