"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Users, BookOpen, DollarSign, TrendingUp, CheckCircle, XCircle, Star, Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, gradient: "from-blue-500 to-cyan-500" },
    { label: "Total Courses", value: stats?.total_courses || 0, icon: BookOpen, gradient: "from-violet-500 to-purple-600" },
    { label: "Total Revenue", value: formatPrice(stats?.total_revenue || 0), icon: DollarSign, gradient: "from-emerald-500 to-green-600" },
    { label: "Enrollments", value: stats?.total_enrollments || 0, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {statCards.map((card) => (
                <div key={card.label} className="glass-card p-5 card-hover">
                  <div className={`inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${card.gradient} items-center justify-center text-white mb-3`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-border/50">
                  <h2 className="text-foreground font-bold">Pending Teacher Verifications</h2>
                  <p className="text-muted-foreground text-sm">{pendingTeachers?.length || 0} pending</p>
                </div>
                <div className="divide-y divide-border/30">
                  {!pendingTeachers?.length ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No pending verifications</div>
                  ) : (
                    pendingTeachers.map((teacher: any) => (
                      <div key={teacher.id} className="p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {teacher.user?.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{teacher.user?.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{teacher.user?.email}</p>
                          {teacher.expertise_areas?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {teacher.expertise_areas.slice(0, 3).map((area: string) => (
                                <Badge key={area} variant="default" className="text-[10px] py-0 px-1.5">{area}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => verifyTeacher.mutate({ teacherId: teacher.id, status: "approved" })}
                            className="h-9 w-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-500 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => verifyTeacher.mutate({ teacherId: teacher.id, status: "rejected" })}
                            className="h-9 w-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors"
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

              <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-border/50">
                  <h2 className="text-foreground font-bold">Published Courses Management</h2>
                  <p className="text-muted-foreground text-sm">Feature or manage visibility</p>
                </div>
                <div className="divide-y divide-border/30">
                  {!pendingCourses?.length ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No courses available</div>
                  ) : (
                    pendingCourses.slice(0, 8).map((course: any) => (
                      <div key={course.id} className="p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                        <div className="w-12 h-8 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{course.title}</p>
                          <p className="text-xs text-muted-foreground">by {course.teacher?.full_name}</p>
                        </div>
                        <button
                          onClick={() => featureCourse.mutate({ courseId: course.id, featured: !course.is_featured })}
                          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                            course.is_featured
                              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                          title={course.is_featured ? "Unfeature" : "Feature"}
                        >
                          <Star className={`h-4 w-4 ${course.is_featured ? "fill-amber-500" : ""}`} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {stats && (
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Teachers", value: stats.active_teachers || 0 },
                  { label: "Active Students", value: stats.active_students || 0 },
                  { label: "Certificates Issued", value: stats.certificates_issued || 0 },
                  { label: "Pending Refunds", value: stats.pending_refunds || 0 },
                ].map((item) => (
                  <div key={item.label} className="glass-card p-5 text-center card-hover">
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
