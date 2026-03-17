"use client";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  Users, BookOpen, DollarSign, AlertTriangle, Plus,
  TrendingUp, Bell, CheckCircle, ArrowRight
} from "lucide-react";
import { formatPrice, getRiskEmoji } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => teacherApi.dashboard().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card h-28 animate-pulse">
                <div className="h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "My Earnings", value: formatPrice(data?.my_earnings || 0), icon: <DollarSign className="h-5 w-5" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Total Students", value: (data?.total_students || 0).toLocaleString(), icon: <Users className="h-5 w-5" />, gradient: "from-blue-500 to-cyan-500" },
    { label: "Active Courses", value: data?.active_courses || 0, icon: <BookOpen className="h-5 w-5" />, gradient: "from-violet-500 to-purple-600" },
    { label: "Pending Payout", value: formatPrice(data?.pending_payout || 0), icon: <TrendingUp className="h-5 w-5" />, gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your courses and students</p>
          </div>
          <Link href="/teacher/courses/new">
            <Button variant="gradient" className="gap-2 rounded-2xl">
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-5 card-hover">
              <div className={`inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data?.at_risk_students?.length > 0 && (
            <div className="glass-card p-6 border-red-500/20">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <h2 className="font-bold text-foreground">Students At Risk</h2>
                <Badge variant="danger" className="ml-auto">{data.at_risk_students.length}</Badge>
              </div>
              <div className="space-y-3">
                {data.at_risk_students.slice(0, 5).map((student: any) => (
                  <div key={student.student_id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors">
                    <div>
                      <p className="font-medium text-foreground text-sm">{student.student_name}</p>
                      <p className="text-xs text-muted-foreground">{student.course_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{getRiskEmoji(student.risk_level)}</span>
                      <Link
                        href={`/teacher/courses/${student.course_id}/students`}
                        className="text-xs text-primary-500 font-semibold hover:text-primary-400"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.recent_enrollments?.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-8 w-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary-500" />
                </div>
                <h2 className="font-bold text-foreground">Recent Enrollments</h2>
              </div>
              <div className="space-y-3">
                {data.recent_enrollments.slice(0, 8).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">{e.student_name?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{e.student_name}</p>
                      <p className="text-xs text-muted-foreground truncate">enrolled in {e.course_title}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { href: "/teacher/courses", label: "My Courses", icon: <BookOpen className="h-5 w-5" />, gradient: "from-violet-500 to-purple-600" },
            { href: "/teacher/courses/new", label: "Create Course", icon: <Plus className="h-5 w-5" />, gradient: "from-blue-500 to-cyan-500" },
            { href: "/teacher/live-sessions", label: "Live Sessions", icon: <Users className="h-5 w-5" />, gradient: "from-emerald-500 to-green-600" },
            { href: "/teacher/doubt-sessions", label: "Doubt Sessions", icon: <Bell className="h-5 w-5" />, gradient: "from-amber-500 to-orange-500" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass-card p-5 text-center card-hover group"
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <p className="text-sm font-semibold text-foreground">{link.label}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
