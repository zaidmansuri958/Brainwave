"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Plus, Edit, Eye, Archive, Star, Users, BookOpen, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-gray-600 text-gray-200",
  processing: "bg-yellow-900 text-yellow-400",
  published: "bg-green-900 text-green-400",
  archived: "bg-red-900 text-red-400",
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
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Courses</h1>
            <p className="text-gray-400 mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/teacher/courses/new"
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> New Course
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400">No courses yet</h2>
            <p className="text-gray-500 mt-2">Create your first course to get started</p>
            <Link
              href="/teacher/courses/new"
              className="inline-flex items-center gap-2 mt-6 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Course
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <div className="w-full sm:w-40 h-24 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[course.status] || "bg-gray-700 text-gray-300"}`}>
                      {course.status}
                    </span>
                    {course.is_featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900 text-yellow-400">Featured</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg truncate">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mt-1">{course.description}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {course.enrollment_count || 0} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" /> {course.avg_rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="font-semibold text-white">{formatPrice(course.price)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/teacher/courses/${course.id}/edit`}
                    className="flex items-center gap-1.5 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </Link>
                  {course.status !== "archived" && (
                    <button
                      onClick={() => {
                        if (confirm("Archive this course? Students will lose access.")) {
                          archiveCourse.mutate(course.id);
                        }
                      }}
                      className="flex items-center gap-1.5 text-sm text-red-400 bg-red-900/20 hover:bg-red-900/40 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
