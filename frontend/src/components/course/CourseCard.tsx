import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock, Star, Users } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { CourseMetaRow, StatusBadge } from "@/components/ui/app-shell";

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

const CATEGORY_TONES: Record<string, "info" | "success" | "warning" | "neutral"> = {
  "Data Science": "info",
  Programming: "info",
  Competitive: "warning",
  Design: "success",
  Finance: "success",
};

export function CourseCard({ course }: CourseCardProps) {
  const categoryTone = CATEGORY_TONES[course.category ?? ""] || "neutral";

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <div className="bw-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]">
        <div className="relative aspect-[1.2] overflow-hidden bg-[#fff4d6]">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ffe500_0%,#fff4d6_48%,#8ed8ff_100%)]">
              <div className="rounded-[18px] border-2 border-black bg-white p-4 shadow-[4px_4px_0_#111111]">
                <BookOpen className="h-10 w-10 text-slate-900" />
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            {course.category ? <StatusBadge tone={categoryTone}>{course.category}</StatusBadge> : <span />}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-slate-700 shadow-[2px_2px_0_#111111] transition group-hover:bg-slate-950 group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="rounded-[1.25rem] border-2 border-black bg-white p-3 shadow-[3px_3px_0_#111111]">
              <CourseMetaRow
                items={[
                  course.rating ? (
                    <span key="rating" className="inline-flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {course.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span key="rating" className="text-slate-400">New</span>
                  ),
                  course.total_students ? (
                    <span key="students" className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.total_students >= 1000 ? `${(course.total_students / 1000).toFixed(1)}k` : course.total_students}
                    </span>
                  ) : (
                    <span key="students" className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Fresh cohort
                    </span>
                  ),
                  course.total_duration_seconds ? (
                    <span key="duration" className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(course.total_duration_seconds)}
                    </span>
                  ) : (
                    <span key="duration" className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Self-paced
                    </span>
                  ),
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Course experience</p>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold uppercase leading-snug text-slate-950 transition group-hover:text-[#ff6b00]">
            {course.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {course.teacher_name ? `By ${course.teacher_name}` : "Instructor-led premium learning path"}
          </p>

          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Price</p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase text-slate-950">
                {course.price === 0 ? "Free" : course.price ? formatPrice(course.price) : "Free"}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border-2 border-black bg-[#ffe500] px-4 py-2 text-sm font-extrabold uppercase text-black transition group-hover:bg-[#ff6b00] group-hover:text-white">
              View details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
