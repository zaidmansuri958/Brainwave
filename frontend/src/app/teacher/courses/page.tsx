"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import Link from "next/link";
import { Plus, Edit, Eye, Archive, Star, Users, BookOpen, Loader2, Sparkles, ListTree, MoreVertical } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DashboardLayout, SectionCard, Badge } from "@/components/layout/DashboardLayout";

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
  const published = courses.filter((c: any) => c.status === "published").length;
  const drafts    = courses.filter((c: any) => c.status === "draft").length;

  const statusVariant = (s: string): "success" | "warning" | "info" | "neutral" => {
    if (s === "published") return "success";
    if (s === "draft")     return "warning";
    if (s === "processing") return "info";
    return "neutral";
  };

  return (
    <DashboardLayout
      title="My Courses"
      subtitle={`${courses.length} courses · ${published} published · ${drafts} draft`}
      breadcrumbs={[{ label: "Teacher Studio" }, { label: "Courses" }]}
      actions={
        <Link href="/teacher/courses/new" className="dash-btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Course
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No courses yet</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
            Create your first AI-powered course. Upload your materials and let AI build the curriculum.
          </p>
          <Link href="/teacher/courses/new" className="dash-btn-primary inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Create with AI
          </Link>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Students</th>
                <th>Rating</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: any) => (
                <tr key={course.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 shrink-0 flex items-center justify-center">
                        {course.thumbnail_url
                          ? <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                          : <BookOpen className="h-4 w-4 text-white/70" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{course.category || "Uncategorized"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <Badge variant={statusVariant(course.status)}>{course.status}</Badge>
                      {course.is_featured && <Badge variant="warning">★ Featured</Badge>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{course.enrolled_count || 0}</span>
                    </div>
                  </td>
                  <td>
                    {course.avg_rating > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{Number(course.avg_rating).toFixed(1)}</span>
                      </div>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </td>
                  <td className="font-semibold text-gray-800 text-sm">{formatPrice(course.price)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/teacher/courses/${course.id}/edit`}
                        className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <Link href={`/teacher/courses/${course.id}/curriculum`}
                        className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                        <ListTree className="h-3.5 w-3.5" /> Curriculum
                      </Link>
                      <Link href={`/courses/${course.slug}`} target="_blank"
                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {course.status !== "archived" && (
                        <button
                          type="button"
                          onClick={() => { if (confirm("Archive this course?")) archiveCourse.mutate(course.id); }}
                          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
