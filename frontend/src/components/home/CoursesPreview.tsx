"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { SectionHeader } from "@/components/ui/app-shell";

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

const DEMO_COURSES: Course[] = [
  { id: "demo-1", slug: "ml-fundamentals", title: "Machine Learning Fundamentals", category: "Data Science", teacher_name: "Dr. Amit Kumar", rating: 4.9, total_students: 12400, price: 999 },
  { id: "demo-2", slug: "web-dev-bootcamp", title: "Full-Stack Web Dev Bootcamp", category: "Programming", teacher_name: "Priya Sharma", rating: 4.8, total_students: 8900, price: 1299 },
  { id: "demo-3", slug: "jee-advanced-maths", title: "JEE Advanced Mathematics", category: "Competitive", teacher_name: "Prof. R. Gupta", rating: 4.9, total_students: 21000, price: 799 },
  { id: "demo-4", slug: "ui-ux-design", title: "UI/UX Design Masterclass", category: "Design", teacher_name: "Sneha Kapoor", rating: 4.7, total_students: 5600, price: 1499 },
];

function SkeletonCard() {
  return <div className="bw-card h-[320px] animate-pulse bg-white/70" />;
}

export function CoursesPreview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [phase, setPhase] = useState<"loading" | "live" | "demo" | "error">("loading");

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
          setCourses(DEMO_COURSES);
          setPhase("demo");
        }
      })
      .catch(() => {
        setCourses([]);
        setPhase("error");
      });
  }, []);

  return (
    <section className="bg-transparent py-14">
      <div className="bw-shell">
        <SectionHeader
          eyebrow="Course Catalog"
          title="Discover courses that feel easy to scan and hard to ignore."
          description="The catalog shifts to bold cards, stronger labels, and clearer price and category signals while keeping the same data and flow."
          action={<Link href="/courses" className="bw-action-secondary">Browse All Courses <ArrowRight className="h-4 w-4" /></Link>}
        />

        {phase === "loading" ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        ) : phase === "error" ? (
          <div className="mt-8 rounded-[1.5rem] border-2 border-black bg-[#ffd6d6] p-8 text-center shadow-[5px_5px_0_#111111]">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-600" />
            <p className="mt-4 font-display text-xl font-bold uppercase text-slate-950">Couldn&apos;t load courses</p>
            <p className="mt-2 text-sm text-slate-600">The layout is ready, but course data could not be fetched just now.</p>
          </div>
        ) : (
          <>
            {phase === "demo" ? (
              <p className="mt-6 inline-flex rounded-full border-2 border-black bg-[#ffe500] px-3 py-1 text-xs font-extrabold uppercase text-black shadow-[2px_2px_0_#111111]">
                Showing demo examples until published courses are available.
              </p>
            ) : null}
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <div className="[&>*]:!bg-white">
                    <CourseCard course={course} />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
