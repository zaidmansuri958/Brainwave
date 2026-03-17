"use client";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi, certApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import Link from "next/link";
import { BookOpen, Award, Search, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: enrolledData, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => enrollmentApi.myCourses().then((r) => r.data),
  });

  const { data: certData } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certApi.myCertificates().then((r) => r.data),
  });

  const courses = enrolledData?.courses || [];
  const certificates = certData?.certificates || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-primary-100 dark:bg-primary-900/40 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{courses.length}</p>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-xl">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{certificates.length}</p>
              <p className="text-sm text-gray-500">Certificates</p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-xl">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {courses.filter((c: any) => c.course?.enrolled_count > 0).length}
              </p>
              <p className="text-sm text-gray-500">Courses in Progress</p>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>
            <Link href="/courses" className="text-primary-600 text-sm font-semibold hover:text-primary-700">
              Browse more →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No courses yet</h3>
              <p className="text-gray-500 mt-1 mb-4">Start learning with India's best teachers</p>
              <Link
                href="/courses"
                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((item: any) => (
                <div key={item.enrollment_id} className="relative">
                  <CourseCard course={item.course} />
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/learn/${item.course.slug}`}
                      className="flex-1 text-center bg-primary-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                >
                  <Award className="h-8 w-8 text-amber-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{cert.course_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">by {cert.teacher_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(cert.issued_at).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/verify/${cert.id}`}
                      className="flex-1 text-center text-xs bg-amber-600 text-white py-1.5 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                      Verify
                    </Link>
                    {cert.pdf_url && (
                      <a
                        href={cert.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs border border-amber-300 text-amber-700 py-1.5 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
