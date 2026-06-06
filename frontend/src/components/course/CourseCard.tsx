import Link from "next/link";
import { BookOpen, Clock, Star, Users, ArrowRight } from "lucide-react";
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
  "Data Science": "bg-blue-100 text-blue-700",
  Programming:    "bg-green-100 text-green-700",
  Competitive:    "bg-orange-100 text-orange-700",
  Design:         "bg-pink-100 text-pink-700",
  Finance:        "bg-yellow-100 text-yellow-700",
  Mathematics:    "bg-purple-100 text-purple-700",
};

export function CourseCard({ course }: CourseCardProps) {
  const catClass = CATEGORY_COLORS[course.category ?? ""] || "bg-gray-100 text-gray-600";

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <div className="card card-hover h-full flex flex-col overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 shrink-0">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-300" />
            </div>
          )}
          {course.category && (
            <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${catClass}`}>
              {course.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          {course.teacher_name && (
            <p className="text-xs text-gray-400 mt-1">By {course.teacher_name}</p>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {course.rating ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                {course.rating.toFixed(1)}
              </span>
            ) : null}
            {course.total_students ? (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.total_students >= 1000
                  ? `${(course.total_students / 1000).toFixed(1)}k`
                  : course.total_students}
              </span>
            ) : null}
            {course.total_duration_seconds ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(course.total_duration_seconds)}
              </span>
            ) : null}
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="text-base font-bold text-gray-900">
              {course.price === 0 || !course.price ? "Free" : formatPrice(course.price)}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
              Enroll <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
