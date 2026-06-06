"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Video,
  HelpCircle, DollarSign, BarChart2, Bell, Award, Search,
  FileText, Settings, LogOut, ChevronRight, Shield,
  Sparkles, ClipboardList, Play, Package,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const studentNav: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard",       icon: LayoutDashboard },
  { label: "My Courses",      href: "/enrollments",     icon: BookOpen },
  { label: "Browse Courses",  href: "/courses",         icon: Search },
  { label: "Mock Tests",      href: "/catalog/mock-tests", icon: ClipboardList },
  { label: "Study Materials", href: "/catalog/materials",  icon: FileText },
  { label: "Notifications",   href: "/notifications",   icon: Bell },
  { label: "Certificates",    href: "/certificates",    icon: Award },
  { label: "Profile",         href: "/profile",         icon: Settings },
];

const teacherNav: NavItem[] = [
  { label: "Dashboard",       href: "/teacher/dashboard",     icon: LayoutDashboard },
  { label: "My Courses",      href: "/teacher/courses",       icon: BookOpen },
  { label: "Students",        href: "/teacher/students",      icon: Users },
  { label: "Live Sessions",   href: "/teacher/live-sessions", icon: Video },
  { label: "Doubt Sessions",  href: "/teacher/doubt-sessions",icon: HelpCircle },
  { label: "Earnings",        href: "/teacher/earnings",      icon: DollarSign },
  { label: "Analytics",       href: "/teacher/analytics",     icon: BarChart2 },
  { label: "Profile",         href: "/profile",               icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard",   href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Teachers",    href: "/admin/teachers",  icon: GraduationCap },
  { label: "Courses",     href: "/admin/courses",   icon: BookOpen },
  { label: "Payments",    href: "/admin/payments",  icon: DollarSign },
  { label: "Refunds",     href: "/admin/refunds",   icon: Package },
];

function NavSection({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`dash-sidebar-item ${active ? "active" : ""}`}
          >
            <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`} style={{ width: 18, height: 18 }} />
            <span>{item.label}</span>
            {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-blue-400" style={{ width: 14, height: 14 }} />}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isTeacher } = useAuthStore();

  const isAdmin = user?.role === "admin";
  const isTeacherUser = isTeacher?.() ?? false;

  const navItems = isAdmin ? adminNav : isTeacherUser ? teacherNav : studentNav;
  const roleLabel = isAdmin ? "Admin" : isTeacherUser ? "Teacher Studio" : "Learning Hub";
  const roleColor = isAdmin ? "bg-purple-100 text-purple-700" : isTeacherUser ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700";

  const initials = user?.full_name
    ?.split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "BW";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside
      className="flex flex-col"
      style={{
        width: "var(--sidebar-width, 260px)",
        minWidth: "var(--sidebar-width, 260px)",
        background: "var(--sidebar-bg, #fff)",
        borderRight: "1px solid var(--sidebar-border, #E5E7EB)",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900 leading-tight">Brainwave</p>
          <p className="text-[11px] text-gray-400 font-medium">{roleLabel}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <NavSection items={navItems} pathname={pathname} />
      </div>

      {/* User section */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 cursor-pointer mb-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
              : initials
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.full_name || "User"}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email || ""}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>
            {isAdmin ? "Admin" : isTeacherUser ? "Teacher" : "Student"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
