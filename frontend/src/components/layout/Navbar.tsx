"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Bell, GraduationCap, LogOut, Menu, User, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { notifApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative group text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium py-1"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-blue-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
    </Link>
  );
}

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setProfileOpen(false);
    if (profileOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [profileOpen]);

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
    <>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`pointer-events-auto rounded-2xl border transition-all duration-300 w-full max-w-5xl ${
            scrolled
              ? "bg-[#070D1E]/92 backdrop-blur-2xl border-white/10 shadow-2xl shadow-black/40"
              : "bg-[#070D1E]/75 backdrop-blur-xl border-white/8 shadow-lg shadow-black/20"
          }`}
        >
          <div className="px-5 sm:px-6">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                  <GraduationCap className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
                </div>
                <span className="font-bold text-[1.05rem] text-white tracking-tight">
                  Brainwave<span className="text-blue-400">.ai</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                <NavLink href="/courses">Courses</NavLink>
                {isAuthenticated() && <NavLink href={getDashboardLink()}>Dashboard</NavLink>}
                {user?.role === "teacher" && <NavLink href="/teacher/courses/new">Create</NavLink>}
              </div>

              {/* Right */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated() ? (
                  <>
                    <Link
                      href="/notifications"
                      className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/6"
                    >
                      <Bell className="h-[18px] w-[18px]" />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                      )}
                    </Link>

                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-white/6 transition-colors border border-transparent hover:border-white/8"
                      >
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="h-7 w-7 rounded-full object-cover ring-2 ring-blue-500/30" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{user?.full_name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                        )}
                        <span className="text-slate-300 text-xs font-medium">{user?.full_name?.split(" ")[0]}</span>
                      </button>

                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0C1526]/98 backdrop-blur-2xl border border-white/8 shadow-2xl shadow-black/50 overflow-hidden"
                          >
                            <div className="px-4 py-3 border-b border-white/5">
                              <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <div className="py-1">
                              <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setProfileOpen(false)}>
                                <User className="h-4 w-4 text-slate-500" /> Profile
                              </Link>
                              <button onClick={() => { logout(); setProfileOpen(false); window.location.href = "/"; }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full">
                                <LogOut className="h-4 w-4" /> Sign Out
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-3 py-2">Sign In</Link>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link href="/register" className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-shadow">
                        <Sparkles className="h-3 w-3" />
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/5 rounded-b-2xl"
              >
                <div className="px-4 py-3 space-y-1">
                  <Link href="/courses" className="block px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm" onClick={() => setMobileOpen(false)}>Courses</Link>
                  {isAuthenticated() && <Link href={getDashboardLink()} className="block px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
                  {!isAuthenticated() && (
                    <div className="pt-1 space-y-2">
                      <Link href="/login" className="block px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                      <Link href="/register" className="block py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-center rounded-xl text-sm font-semibold" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                    </div>
                  )}
                  {isAuthenticated() && <button onClick={() => { logout(); window.location.href = "/"; }} className="block w-full text-left px-3 py-2.5 text-red-400 hover:bg-red-500/5 rounded-xl transition-colors text-sm">Sign Out</button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
      {/* Spacer: navbar height (56px) + top offset (12px) */}
      <div className="h-[68px]" aria-hidden="true" />
    </>
  );
}
