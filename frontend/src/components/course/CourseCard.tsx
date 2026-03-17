import Link from "next/link";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
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

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="glass-card overflow-hidden card-hover">
        <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/30 dark:to-violet-900/30">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center opacity-60">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex gap-2">
            {course.price === 0 && (
              <Badge variant="success" className="shadow-sm">FREE</Badge>
            )}
            {course.difficulty_level && (
              <span className="glass text-[11px] font-semibold px-2.5 py-1 rounded-full text-foreground">
                {course.difficulty_level}
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          {course.category && (
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
              {course.category}
            </span>
          )}
          <h3 className="font-semibold text-foreground mt-1.5 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {course.title}
          </h3>
          {course.short_description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {course.short_description}
            </p>
          )}

          {course.teacher && (
            <div className="flex items-center gap-2 mt-3">
              {course.teacher.avatar_url ? (
                <img src={course.teacher.avatar_url} alt={course.teacher.full_name} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="h-5 w-5 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">{course.teacher.full_name.charAt(0)}</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">by {course.teacher.full_name}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-foreground">{Number(course.avg_rating).toFixed(1)}</span>
              <span>({course.review_count})</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrolled_count.toLocaleString()}
            </span>
            {course.total_duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(course.total_duration_minutes)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="font-bold text-foreground text-lg">
              {formatPrice(Number(course.price), course.currency)}
            </span>
            <span className="text-xs text-muted-foreground">{course.total_chapters} chapters</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
