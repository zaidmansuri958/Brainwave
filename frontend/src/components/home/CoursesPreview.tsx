"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

const PLACEHOLDER_COURSES: Course[] = [
  { id:"1", slug:"ml-fundamentals",      title:"Machine Learning Fundamentals",    category:"Data Science",   teacher_name:"Dr. Amit Kumar",    rating:4.9, total_students:12400, price:999  },
  { id:"2", slug:"web-dev-bootcamp",     title:"Full-Stack Web Dev Bootcamp",       category:"Programming",    teacher_name:"Priya Sharma",       rating:4.8, total_students:8900,  price:1299 },
  { id:"3", slug:"jee-advanced-maths",   title:"JEE Advanced Mathematics",          category:"Competitive",    teacher_name:"Prof. R. Gupta",     rating:4.9, total_students:21000, price:799  },
  { id:"4", slug:"ui-ux-design",         title:"UI/UX Design Masterclass",          category:"Design",         teacher_name:"Sneha Kapoor",       rating:4.7, total_students:5600,  price:1499 },
  { id:"5", slug:"python-data-science",  title:"Python for Data Science",           category:"Data Science",   teacher_name:"Rahul Verma",        rating:4.8, total_students:15000, price:899  },
  { id:"6", slug:"ca-foundation",        title:"CA Foundation Complete Course",     category:"Finance",        teacher_name:"CA Anita Singh",     rating:4.9, total_students:9800,  price:1099 },
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    fetch(`${apiBase}/courses?sort=popular&limit=6&status=published`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const list = data?.courses || [];
        setCourses(list.length > 0 ? list : PLACEHOLDER_COURSES);
      })
      .catch(() => setCourses(PLACEHOLDER_COURSES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={ref} className="bg-[#FAFAF9] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
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

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
