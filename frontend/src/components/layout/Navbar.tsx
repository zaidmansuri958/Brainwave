"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  Bell,
  GraduationCap,
  LogOut,
  Menu,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { notifApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "teacher") return "/teacher/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  const navLinks = [
    { href: "/courses", label: "Courses", show: true },
    { href: getDashboardLink(), label: "Dashboard", show: isAuthenticated() },
    {
      href: "/teacher/courses/new",
      label: "Create Course",
      show: user?.role === "teacher",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/courses") return pathname === "/courses" || pathname.startsWith("/courses/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#030014]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/20"
          : "bg-[#030014]/80 backdrop-blur-2xl border-b border-white/[0.06]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl group"
          >
            <div className="relative">
              <GraduationCap className="h-7 w-7 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-white font-bold tracking-tight">
              Brainwave.ai
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((link) => link.show)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(link.href)
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated() ? (
              <>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 flex items-center justify-center"
                    >
                      <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </motion.span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={cn(
                      "flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all duration-200",
                      profileOpen
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.06]"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                          {user?.full_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
                        profileOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/30 border border-white/[0.08] py-1.5 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                          <p className="text-sm font-semibold text-white truncate">
                            {user?.full_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="h-4 w-4 text-gray-500" />
                            Profile
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setProfileOpen(false);
                              window.location.href = "/";
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ThemeToggle />

                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2"
                >
                  Log In
                </Link>
                <Button asChild variant="shimmer" size="sm" className="rounded-xl px-5">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative p-2 rounded-xl text-gray-400 hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-white/[0.06] space-y-1">
                {navLinks
                  .filter((link) => link.show)
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-indigo-500/10 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}

                {isAuthenticated() && (
                  <>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        window.location.href = "/";
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                )}

                {!isAuthenticated() && (
                  <div className="pt-2 space-y-2 px-4">
                    <Link
                      href="/login"
                      className="block py-2.5 text-center rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      Log In
                    </Link>
                    <Button asChild variant="shimmer" className="w-full rounded-xl">
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
