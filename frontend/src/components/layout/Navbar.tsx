"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Bell, BookOpen, GraduationCap, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { notifApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <GraduationCap className="h-7 w-7" />
            <span>Brainwave.ai</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/courses" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium transition-colors">
              Courses
            </Link>
            {isAuthenticated() && (
              <Link href={getDashboardLink()} className="text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium transition-colors">
                Dashboard
              </Link>
            )}
            {user?.role === "teacher" && (
              <Link href="/teacher/courses/new" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium transition-colors">
                Create Course
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {user?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); window.location.href = "/"; }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <Link href="/courses" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              Courses
            </Link>
            {isAuthenticated() && (
              <Link href={getDashboardLink()} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                Dashboard
              </Link>
            )}
            {!isAuthenticated() && (
              <>
                <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Log In</Link>
                <Link href="/register" className="block mx-4 py-2 bg-primary-600 text-white text-center rounded-lg font-medium">Get Started</Link>
              </>
            )}
            {isAuthenticated() && (
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
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
