"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FileEdit, LayoutList, ImageIcon, Percent, Users } from "lucide-react";

export function CourseManageNav({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/teacher/courses/${courseId}`;
  const tabs: { href: string; label: string; icon: React.ElementType }[] = [
    { href: `${base}/edit`, label: "Details", icon: FileEdit },
    { href: `${base}/curriculum`, label: "Curriculum & quizzes", icon: LayoutList },
    { href: `${base}/students`, label: "Students", icon: Users },
    { href: `${base}/thumbnails`, label: "Thumbnails", icon: ImageIcon },
    { href: `${base}/promotions`, label: "Promotions", icon: Percent },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:-translate-y-1 ${
              active ? "text-black" : "text-slate-600 hover:text-black"
            }`}
          >
            {active && (
              <motion.span
                layoutId="course-manage-nav-pill"
                className="absolute inset-0 rounded-full border-4 border-black bg-[#ffe500] shadow-[4px_4px_0_#111111]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {!active && (
              <span
                className="absolute inset-0 rounded-full border-4 border-black bg-white shadow-[4px_4px_0_#111111]"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-5 w-5" strokeWidth={3} />
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
