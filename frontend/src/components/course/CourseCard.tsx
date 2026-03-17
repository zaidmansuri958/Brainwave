import Link from "next/link";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    short_description?: string;
    thumbnail_url?: string;
    price: number;
    currency: string;
    category?: string;
    difficulty_level?: string;
    language?: string;
    enrolled_count: number;
    avg_rating: number;
    review_count: number;
    total_duration_minutes: number;
    total_chapters: number;
    teacher?: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="glass-card glass-card-hover overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/5 to-transparent" />
          {course.price === 0 && (
            <span className="absolute top-3 left-3 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold">
              FREE
            </span>
          )}
          {course.difficulty_level && (
            <span className="absolute top-3 right-3 bg-slate-900/65 text-white text-xs px-2 py-1 rounded-full">
              {course.difficulty_level}
            </span>
          )}
        </div>

        <div className="p-4">
          {course.category && (
            <span className="text-xs text-primary-600 dark:text-primary-300 font-semibold uppercase tracking-wide">
              {course.category}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 dark:text-white mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          {course.short_description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              {course.short_description}
            </p>
          )}

          {course.teacher && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">by {course.teacher.full_name}</p>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {Number(course.avg_rating).toFixed(1)}
              <span className="text-slate-400 dark:text-slate-500">({course.review_count})</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.enrolled_count.toLocaleString()}
            </span>
            {course.total_duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(course.total_duration_minutes)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
            <span className="font-bold text-slate-900 dark:text-white text-lg">
              {formatPrice(Number(course.price), course.currency)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{course.total_chapters} chapters</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
