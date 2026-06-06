"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";

interface Course {
  id: string;
  slug: string;
  title: string;
  thumbnail_url?: string;
  teacher_name?: string;
  rating?: number;
  total_students?: number;
  total_duration_seconds?: number;
  price?: number;
  category?: string;
}


export function CoursesPreview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [phase, setPhase] = useState<"loading" | "live" | "empty" | "error">("loading");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    setPhase("loading");
    fetch(`${apiBase}/courses?sort=popular&limit=4&status=published`)
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        const list = (data?.courses || []) as Course[];
        if (list.length > 0) {
          setCourses(list);
          setPhase("live");
        } else {
          setCourses([]);
          setPhase("empty");
        }
      })
      .catch(() => {
        setCourses([]);
        setPhase("error");
      });
  }, []);

  return (
    <section className="section-padding bg-gray-50">
      <div className="page-container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="section-eyebrow">Top Courses</span>
            <h2 className="section-title">Popular learning paths</h2>
          </div>
          <Link href="/courses" className="btn btn-md btn-secondary hidden sm:flex items-center gap-2 shrink-0">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {phase === "loading" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-gray-100 rounded-t-xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : phase === "error" ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-gray-500">Could not load courses right now. <Link href="/courses" className="text-blue-600 font-medium">Browse catalog →</Link></p>
          </div>
        ) : phase === "empty" ? (
          <div className="card p-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No courses published yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link href="/courses" className="btn btn-md btn-secondary inline-flex items-center gap-2">
            View all courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
