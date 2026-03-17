"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Plus, Edit, Eye, Archive, Star, Users, BookOpen, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<string, "default" | "warning" | "success" | "danger"> = {
  draft: "default",
  processing: "warning",
  published: "success",
  archived: "danger",
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/teacher/courses/new">
            <Button variant="gradient" className="gap-2 rounded-2xl">
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No courses yet</h2>
            <p className="text-muted-foreground mt-2 mb-6">Create your first course to get started</p>
            <Link href="/teacher/courses/new">
              <Button variant="gradient" className="gap-2 rounded-2xl">
                <Plus className="h-4 w-4" /> Create Course
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course: any) => (
              <div key={course.id} className="glass-card p-5 flex flex-col sm:flex-row gap-4 card-hover">
                <div className="w-full sm:w-40 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={statusVariants[course.status] || "default"}>
                      {course.status}
                    </Badge>
                    {course.is_featured && (
                      <Badge variant="warning">Featured</Badge>
                    )}
                  </div>
                  <h3 className="text-foreground font-semibold text-lg truncate">{course.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{course.description}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {course.enrollment_count || 0} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" /> {course.avg_rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="font-semibold text-foreground">{formatPrice(course.price)}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Link href={`/teacher/courses/${course.id}/edit`}>
                    <Button variant="glass" size="sm" className="gap-1.5 w-full">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <Button variant="glass" size="sm" className="gap-1.5 w-full">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                  </Link>
                  {course.status !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm("Archive this course? Students will lose access.")) {
                          archiveCourse.mutate(course.id);
                        }
                      }}
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </Button>
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
