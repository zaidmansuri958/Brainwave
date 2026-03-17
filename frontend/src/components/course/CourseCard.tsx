"use client";

import Link from "next/link";
import { Star, Users, Clock, BookOpen, Play } from "lucide-react";
import { formatPrice, formatDuration, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="flex items-center gap-1">
      <span className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
        ))}
        {hasHalf && (
          <span className="relative">
            <Star className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
            <span className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            </span>
          </span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
        ))}
      </span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {Number(rating).toFixed(1)}
      </span>
      <span className="text-xs text-gray-400">({count})</span>
    </span>
  );
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary-400" />
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Play className="h-4 w-4 fill-white" />
              View Course
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {course.price === 0 && (
              <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Free
              </Badge>
            )}
            {course.category && (
              <Badge variant="secondary" className="text-[10px] shadow-sm">
                {course.category}
              </Badge>
            )}
          </div>
          {course.difficulty_level && (
            <Badge variant="outline" className="absolute top-2 right-2 text-[10px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
              {course.difficulty_level}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
            {course.title}
          </h3>
          {course.short_description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {course.short_description}
            </p>
          )}

          {/* Teacher */}
          {course.teacher && (
            <div className="flex items-center gap-2 mt-3">
              <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                {course.teacher.avatar_url ? (
                  <img
                    src={course.teacher.avatar_url}
                    alt={course.teacher.full_name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-primary-600 dark:text-primary-300">
                    {getInitials(course.teacher.full_name)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {course.teacher.full_name}
              </span>
            </div>
          )}

          {/* Rating */}
          <div className="mt-3">
            <StarRating rating={course.avg_rating} count={course.review_count} />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrolled_count.toLocaleString()} students
            </span>
            {course.total_duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(course.total_duration_minutes)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.total_chapters} chapters
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span
              className={cn(
                "font-bold text-lg",
                course.price === 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-900 dark:text-white"
              )}
            >
              {formatPrice(Number(course.price), course.currency)}
            </span>
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Enroll Now &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
