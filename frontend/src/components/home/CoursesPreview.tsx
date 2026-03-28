"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Users, Clock, ArrowRight, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
  price: number;
  rating_avg?: number;
  total_ratings?: number;
  enrolled_count?: number;
  total_duration_minutes?: number;
  teacher?: { full_name: string };
  category?: string;
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const price =
    course.price === 0
      ? "Free"
      : `₹${course.price.toLocaleString("en-IN")}`;

  const duration = course.total_duration_minutes
    ? course.total_duration_minutes >= 60
      ? `${Math.floor(course.total_duration_minutes / 60)}h ${course.total_duration_minutes % 60}m`
      : `${course.total_duration_minutes}m`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border border-white/[0.06] bg-[#0C1526] overflow-hidden hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/40 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-[#0F1E3C] to-[#0A1228] overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-blue-400/60" />
            </div>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              course.price === 0
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                : "bg-[#0C1526]/90 text-white border border-white/10 backdrop-blur-sm"
            }`}
          >
            {price}
          </span>
        </div>
        {/* Category */}
        {course.category && (
          <div className="absolute top-3 left-3">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 backdrop-blur-sm">
              {course.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-100 transition-colors">
          {course.title}
        </h3>

        {course.teacher && (
          <p className="text-slate-600 text-xs mb-3">{course.teacher.full_name}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {course.rating_avg && course.rating_avg > 0 ? (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-slate-300 font-medium">
                {course.rating_avg.toFixed(1)}
              </span>
              {course.total_ratings ? `(${course.total_ratings})` : ""}
            </span>
          ) : null}
          {course.enrolled_count ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.enrolled_count.toLocaleString()}
            </span>
          ) : null}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </span>
          )}
        </div>
      </div>

      {/* Hover overlay link */}
      <Link
        href={`/courses/${course.slug}`}
        className="absolute inset-0 z-10"
        aria-label={course.title}
      />
    </motion.div>
  );
}

export function CoursesPreview({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-24 bg-[#080E1D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="inline-block text-blue-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Featured Courses
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Start learning today
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-white font-medium transition-colors group"
          >
            View all courses
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.slice(0, 6).map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>

        {/* Mobile "view all" link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            View all courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
