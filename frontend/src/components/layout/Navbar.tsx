"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Bell, BookOpen, GraduationCap, LogOut, Menu, User, X, Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { notifApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled
        ? "glass-navbar shadow-lg"
        : "bg-background/50 backdrop-blur-sm border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              <span className="gradient-text">Brainwave</span>
              <span className="text-muted-foreground">.ai</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/courses"
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
              Courses
            </Link>
            <Link
              href="/search"
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
              <Search className="h-4 w-4 inline-block mr-1.5" />
              Search
            </Link>
            {isAuthenticated() && (
              <Link
                href={getDashboardLink()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              >
                Dashboard
              </Link>
            )}
            {user?.role === "teacher" && (
              <Link
                href="/teacher/courses/new"
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              >
                Create Course
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated() ? (
              <>
                <Link
                  href="/notifications"
                  className="relative h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                >
                  <Bell className="h-[1.2rem] w-[1.2rem]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 gradient-bg text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-glow">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-accent transition-all duration-200"
                  >
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      profileOpen && "rotate-180"
                    )} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-glass-lg py-2 z-50 animate-slide-up">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="text-sm font-semibold text-foreground">{user?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <Link
                            href={getDashboardLink()}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <BookOpen className="h-4 w-4" /> Dashboard
                          </Link>
                        </div>
                        <div className="border-t border-border/50 p-1">
                          <button
                            onClick={() => { logout(); setProfileOpen(false); window.location.href = "/"; }}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 w-full rounded-xl transition-colors"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border/50 space-y-1 animate-slide-up">
            <Link
              href="/courses"
              className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <BookOpen className="h-4 w-4" /> Courses
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Search className="h-4 w-4" /> Search
            </Link>
            {isAuthenticated() && (
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-border/50 mt-2">
              {!isAuthenticated() ? (
                <div className="flex flex-col gap-2 px-4">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="gradient" className="w-full">Get Started</Button>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => { logout(); window.location.href = "/"; }}
                  className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 w-full rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
