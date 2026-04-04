"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FileEdit, LayoutList, ImageIcon, Percent } from "lucide-react";

export function CourseManageNav({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/teacher/courses/${courseId}`;
  const tabs: { href: string; label: string; icon: React.ElementType }[] = [
    { href: `${base}/edit`, label: "Details", icon: FileEdit },
    { href: `${base}/curriculum`, label: "Curriculum & quizzes", icon: LayoutList },
    { href: `${base}/thumbnails`, label: "Thumbnails", icon: ImageIcon },
    { href: `${base}/promotions`, label: "Promotions", icon: Percent },
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-1 rounded-2xl border border-gray-100/90 bg-white/90 p-1.5 shadow-card backdrop-blur-sm">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
              active ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId="course-manage-nav-pill"
                className="absolute inset-0 rounded-xl bg-indigo-600 shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
