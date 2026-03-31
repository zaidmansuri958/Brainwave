import Link from "next/link";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

interface CourseCardProps {
  course: {
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
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Data Science":  "bg-indigo-50 text-indigo-700",
  "Programming":   "bg-violet-50 text-violet-700",
  "Competitive":   "bg-amber-50 text-amber-700",
  "Design":        "bg-rose-50 text-rose-700",
  "Finance":       "bg-emerald-50 text-emerald-700",
  "default":       "bg-gray-100 text-gray-600",
};

export function CourseCard({ course }: CourseCardProps) {
  const badgeClass = CATEGORY_COLORS[course.category ?? ""] ?? CATEGORY_COLORS["default"];

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-50 relative overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
          )}
          {course.category && (
            <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
              {course.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-indigo-700 transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.teacher_name && (
            <p className="text-xs text-gray-400 mb-3">{course.teacher_name}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            {course.rating && (
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {course.rating.toFixed(1)}
              </span>
            )}
            {course.total_students && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course.total_students >= 1000
                  ? `${(course.total_students / 1000).toFixed(0)}k`
                  : course.total_students}
              </span>
            )}
            {course.total_duration_seconds && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(course.total_duration_seconds)}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="font-display font-bold text-gray-900 text-lg">
              {course.price === 0 ? "Free" : course.price ? formatPrice(course.price) : "Free"}
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
              Enroll now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
