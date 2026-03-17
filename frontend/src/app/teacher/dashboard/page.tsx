"use client";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import {
  Users, BookOpen, DollarSign, AlertTriangle, Plus,
  TrendingUp, Bell, CheckCircle
} from "lucide-react";
import { formatPrice, getRiskEmoji } from "@/lib/utils";

export default function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => teacherApi.dashboard().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "My Earnings", value: formatPrice(data?.my_earnings || 0), icon: <DollarSign />, color: "text-green-600 bg-green-50" },
    { label: "Total Students", value: (data?.total_students || 0).toLocaleString(), icon: <Users />, color: "text-blue-600 bg-blue-50" },
    { label: "Active Courses", value: data?.active_courses || 0, icon: <BookOpen />, color: "text-primary-600 bg-primary-50" },
    { label: "Pending Payout", value: formatPrice(data?.pending_payout || 0), icon: <TrendingUp />, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
          <Link
            href="/teacher/courses/new"
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" /> New Course
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.color}`}>
                <span className="h-5 w-5">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* At-Risk Students */}
          {data?.at_risk_students?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="font-bold text-gray-900 dark:text-white">Students At Risk</h2>
                <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                  {data.at_risk_students.length}
                </span>
              </div>
              <div className="space-y-3">
                {data.at_risk_students.slice(0, 5).map((student: any) => (
                  <div key={student.student_id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{student.student_name}</p>
                      <p className="text-xs text-gray-500">{student.course_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{getRiskEmoji(student.risk_level)}</span>
                      <Link
                        href={`/teacher/courses/${student.course_id}/students`}
                        className="text-xs text-primary-600 font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Enrollments */}
          {data?.recent_enrollments?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary-600" />
                <h2 className="font-bold text-gray-900 dark:text-white">Recent Enrollments</h2>
              </div>
              <div className="space-y-3">
                {data.recent_enrollments.slice(0, 8).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold text-sm">{e.student_name?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.student_name}</p>
                      <p className="text-xs text-gray-500 truncate">enrolled in {e.course_title}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { href: "/teacher/courses", label: "My Courses", icon: "📚" },
            { href: "/teacher/courses/new", label: "Create Course", icon: "➕" },
            { href: "/teacher/earnings", label: "Earnings", icon: "💰" },
            { href: "/teacher/doubt-sessions", label: "Doubt Sessions", icon: "🎯" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">{link.icon}</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{link.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
