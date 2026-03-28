import Link from "next/link";
import { Star, Users, Clock, BookOpen, Play } from "lucide-react";
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
    teacher?: { full_name: string; avatar_url?: string };
  };
}

const levelColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Advanced: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

export function CourseCard({ course }: CourseCardProps) {
  const levelStyle = levelColors[course.difficulty_level || ""] || "text-slate-400 bg-slate-400/10 border-slate-400/20";
  const price = formatPrice(Number(course.price), course.currency);
  const isFree = Number(course.price) === 0;

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="relative rounded-2xl border border-white/[0.07] bg-[#0C1526] overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1.5">

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-[#0A1020]">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F1E3C] to-[#0A1228]">
              <BookOpen className="h-10 w-10 text-blue-500/40" />
            </div>
          )}

          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-5 w-5 text-[#0C1526] ml-0.5 fill-current" />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {isFree ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-lg">
                FREE
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0C1526]/90 text-white border border-white/10 backdrop-blur-sm">
                {price}
              </span>
            )}
            {course.difficulty_level && (
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${levelStyle}`}>
                {course.difficulty_level}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {course.category && (
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2">
              {course.category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-bold text-sm text-white leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors duration-200 mb-2">
            {course.title}
          </h3>

          {/* Description */}
          {course.short_description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {course.short_description}
            </p>
          )}

          {/* Teacher */}
          {course.teacher && (
            <div className="flex items-center gap-2 mb-3">
              {course.teacher.avatar_url ? (
                <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-white">{course.teacher.full_name.charAt(0)}</span>
                </div>
              )}
              <span className="text-xs text-slate-500 truncate">{course.teacher.full_name}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            {Number(course.avg_rating) > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="text-slate-300 font-semibold">{Number(course.avg_rating).toFixed(1)}</span>
                <span className="text-slate-600">({course.review_count?.toLocaleString()})</span>
              </span>
            )}
            {course.enrolled_count > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {course.enrolled_count >= 1000
                  ? `${(course.enrolled_count / 1000).toFixed(1)}k`
                  : course.enrolled_count.toLocaleString()}
              </span>
            )}
            {course.total_duration_minutes > 0 && (
              <span className="flex items-center gap-1 ml-auto">
                <Clock className="h-3 w-3" />
                {formatDuration(course.total_duration_minutes)}
              </span>
            )}
          </div>

          {/* Price + chapters footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
            <span className={`font-extrabold text-base ${isFree ? "text-emerald-400" : "text-white"}`}>
              {isFree ? "Free" : price}
            </span>
            <span className="text-[11px] text-slate-600">
              {course.total_chapters} chapters
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
