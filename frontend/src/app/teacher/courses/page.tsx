"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import Link from "next/link";
import { Plus, Edit, Eye, Archive, Star, Users, BookOpen, Loader2, Sparkles, ListTree } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/ui/app-shell";

const statusTone: Record<string, "warning" | "info" | "success" | "neutral"> = {
  draft: "warning",
  processing: "info",
  published: "success",
  archived: "neutral",
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
    <div className="bw-page flex min-h-screen flex-col">
      <Navbar />

      <main className="bw-shell w-full max-w-6xl flex-1 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase text-gray-900">My Courses</h1>
            <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-gray-500">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/teacher/courses/new" className="neo-primary-btn px-4 py-2.5 text-sm">
            <Plus className="h-4 w-4" /> New Course
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff6b00]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="neo-panel-soft py-24 text-center">
            <div className="neo-icon-badge mx-auto mb-5 h-16 w-16 bg-[#ffe500] text-black">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase text-gray-900">No courses yet</h2>
            <p className="mb-6 mt-2 text-sm text-gray-500">Create your first course and let AI build it for you</p>
            <Link href="/teacher/courses/new" className="neo-primary-btn px-6 py-3 text-sm">
              <Sparkles className="h-4 w-4" /> Create with AI
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course: any) => (
              <div key={course.id} className="neo-panel flex flex-col gap-4 p-5 sm:flex-row">
                <div className="w-full flex-shrink-0 overflow-hidden rounded-[18px] border-2 border-black bg-[#fff4d6] sm:w-40">
                  <div className="h-24 w-full">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={statusTone[course.status] || "warning"}>{course.status}</StatusBadge>
                    {course.is_featured ? <StatusBadge tone="warning">Featured</StatusBadge> : null}
                  </div>
                  <h3 className="font-display text-lg font-bold uppercase text-gray-900">{course.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description}</p>

                  <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {course.enrolled_count || 0} students
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {course.avg_rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="font-extrabold uppercase text-gray-900">{formatPrice(course.price)}</span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                  <Link href={`/teacher/courses/${course.id}/curriculum`} className="neo-primary-btn px-3.5 py-2 text-xs">
                    <ListTree className="h-3.5 w-3.5" /> Curriculum
                  </Link>
                  <Link href={`/teacher/courses/${course.id}/edit`} className="neo-secondary-btn px-3.5 py-2 text-xs">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <Link href={`/courses/${course.slug}`} target="_blank" className="neo-secondary-btn px-3.5 py-2 text-xs">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Link>
                  {course.status !== "archived" ? (
                    <button
                      onClick={() => {
                        if (confirm("Archive this course? Students will lose access.")) {
                          archiveCourse.mutate(course.id);
                        }
                      }}
                      className="neo-danger-btn px-3.5 py-2 text-xs"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  ) : null}
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
