"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
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

/** Shown only when API returns zero courses — clearly labeled as examples, not live inventory. */
const DEMO_COURSES: Course[] = [
  { id: "demo-1", slug: "ml-fundamentals", title: "Machine Learning Fundamentals", category: "Data Science", teacher_name: "Dr. Amit Kumar", rating: 4.9, total_students: 12400, price: 999 },
  { id: "demo-2", slug: "web-dev-bootcamp", title: "Full-Stack Web Dev Bootcamp", category: "Programming", teacher_name: "Priya Sharma", rating: 4.8, total_students: 8900, price: 1299 },
  { id: "demo-3", slug: "jee-advanced-maths", title: "JEE Advanced Mathematics", category: "Competitive", teacher_name: "Prof. R. Gupta", rating: 4.9, total_students: 21000, price: 799 },
  { id: "demo-4", slug: "ui-ux-design", title: "UI/UX Design Masterclass", category: "Design", teacher_name: "Sneha Kapoor", rating: 4.7, total_students: 5600, price: 1499 },
  { id: "demo-5", slug: "python-data-science", title: "Python for Data Science", category: "Data Science", teacher_name: "Rahul Verma", rating: 4.8, total_students: 15000, price: 899 },
  { id: "demo-6", slug: "ca-foundation", title: "CA Foundation Complete Course", category: "Finance", teacher_name: "CA Anita Singh", rating: 4.9, total_students: 9800, price: 1099 },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex justify-between mt-4">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function CoursesPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [courses, setCourses] = useState<Course[]>([]);
  const [phase, setPhase] = useState<"loading" | "live" | "demo" | "error">("loading");

  const load = () => {
    setPhase("loading");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    fetch(`${apiBase}/courses?sort=popular&limit=6&status=published`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
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
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section ref={ref} className="bg-[#FAFAF9] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
              className="eyebrow mb-3"
            >
              Top courses
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="font-display font-extrabold text-gray-900 tracking-[-0.025em] leading-[1.04]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Learn from the best.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all courses <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {phase === "loading" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-6 py-8 text-center max-w-lg mx-auto">
            <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">Couldn&apos;t load courses</p>
            <p className="text-sm text-gray-600 mt-1">Check your connection or try again in a moment.</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold shadow-button-indigo"
            >
              Retry
            </button>
          </div>
        )}

        {(phase === "live" || phase === "demo") && (
          <>
            {phase === "demo" && (
              <p className="text-sm text-gray-600 mb-4 max-w-2xl">
                <span className="font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-lg px-2 py-0.5 mr-2">Examples</span>
                No published courses yet. These cards show sample listings only — links may not resolve until teachers publish.
              </p>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.07 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
