"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Bell, GraduationCap, LogOut, Menu, PlusCircle, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { notifApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!profileRef.current) return;
      if (event.target instanceof Node && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await notifApi.get();
      setNotifications(data.notifications, data.unread_count);
      return data;
    },
    enabled: isAuthenticated(),
    refetchInterval: 30000,
  });

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "teacher") return "/teacher/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  const navLinks = [
    { href: "/courses", label: "Courses" },
    ...(isAuthenticated() ? [{ href: getDashboardLink(), label: "Dashboard" }] : []),
    ...(user?.role === "teacher" ? [{ href: "/teacher/courses/new", label: "Create Course" }] : []),
  ];

  const navLinkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      pathname?.startsWith(href)
        ? "bg-primary-100/80 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
        : "text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300"
    );

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <GraduationCap className="h-7 w-7" />
            <span>Brainwave.ai</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated() ? (
              <>
                <Link href="/notifications" className="relative p-2 text-slate-500 hover:text-primary-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/65 px-2.5 py-1.5 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {user?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-panel p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-200/70 dark:border-slate-700/70">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.full_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); window.location.href = "/"; }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 font-medium transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="modern-btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/70 dark:border-slate-700/70 space-y-2">
            <div className="px-1 pb-2">
              <ThemeToggle />
            </div>
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={cn("block px-4 py-2 rounded-lg", navLinkClass(item.href))}>
                {item.label}
              </Link>
            ))}
            {!isAuthenticated() && (
              <>
                <Link href="/login" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  Log In
                </Link>
                <Link href="/register" className="mx-4 flex items-center justify-center gap-2 py-2.5 modern-btn-primary">
                  <PlusCircle className="h-4 w-4" />
                  Get Started
                </Link>
              </>
            )}
            {isAuthenticated() && (
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
