"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileEdit, LayoutList, ImageIcon, Percent, Users } from "lucide-react";

export function CourseManageNav({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/teacher/courses/${courseId}`;
  const tabs = [
    { href: `${base}/edit`,       label: "Details",            icon: FileEdit   },
    { href: `${base}/curriculum`, label: "Curriculum & Quizzes", icon: LayoutList },
    { href: `${base}/students`,   label: "Students",           icon: Users      },
    { href: `${base}/thumbnails`, label: "Thumbnails",         icon: ImageIcon  },
    { href: `${base}/promotions`, label: "Promotions",         icon: Percent    },
  ];

  return (
    <div className="flex items-center gap-0 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href}
            className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              active ? "text-violet-600" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
