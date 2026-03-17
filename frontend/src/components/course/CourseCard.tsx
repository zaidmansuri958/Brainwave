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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {/* Thumbnail */}
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
          {course.price === 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              FREE
            </span>
          )}
          {course.difficulty_level && (
            <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {course.difficulty_level}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {course.category && (
            <span className="text-xs text-primary-600 font-semibold uppercase tracking-wide">
              {course.category}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          {course.short_description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {course.short_description}
            </p>
          )}

          {/* Teacher */}
          {course.teacher && (
            <p className="text-xs text-gray-500 mt-2">by {course.teacher.full_name}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {Number(course.avg_rating).toFixed(1)}
              <span className="text-gray-400">({course.review_count})</span>
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

          {/* Price */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              {formatPrice(Number(course.price), course.currency)}
            </span>
            <span className="text-xs text-gray-400">{course.total_chapters} chapters</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
