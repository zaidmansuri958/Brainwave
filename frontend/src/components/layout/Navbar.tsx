"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, Menu, X, ChevronDown, LayoutDashboard, User, LogOut, GraduationCap, BookOpen, Sparkles, Video } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navLinks = [
  { label: "Courses",      href: "/courses" },
  { label: "Features",     href: "/features" },
  { label: "For Teachers", href: "/pricing" },
  { label: "Pricing",      href: "/pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const pathname = usePathname();

  const { user, logout, isAuthenticated, isTeacher } = useAuthStore();
  const authed = isAuthenticated();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  const dashboardHref = isTeacher() ? "/teacher/dashboard" : "/dashboard";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 pointer-events-none">
        <nav
          className={`max-w-6xl mx-auto h-[54px] rounded-2xl flex items-center justify-between px-5 pointer-events-auto transition-all duration-300 ${
            scrolled
              ? "shadow-[0_8px_40px_rgba(0,0,20,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "shadow-[0_4px_24px_rgba(0,0,20,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
          }`}
          style={{
            background: "rgba(7, 11, 26, 0.88)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(99,102,241,0.18)",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,20,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(99,102,241,0.12)"
              : "0 4px 24px rgba(0,0,20,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(99,102,241,0.08)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-[0.95rem] tracking-tight text-white">
              Brainwave<span className="text-indigo-400">.ai</span>
            </span>
          </Link>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-1.5 text-[0.82rem] font-semibold rounded-xl transition-all duration-150 ${
                    active
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/8"
                  }`}
                  style={!active ? undefined : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {authed && user ? (
              <div ref={dropdownRef} className="relative flex items-center gap-2">
                {/* Quick action links for logged-in users */}
                <Link
                  href={dashboardHref}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white rounded-xl hover:bg-white/8 transition-all flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                {isTeacher() && (
                  <Link
                    href="/teacher/courses/new"
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    New Course
                  </Link>
                )}

                {/* Avatar dropdown */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-white/8 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-gray-800 shadow-[0_16px_48px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden"
                    style={{ background: "rgba(10,14,30,0.97)", backdropFilter: "blur(20px)" }}>
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role} account</p>
                    </div>
                    <div className="py-1">
                      {[
                        { href: dashboardHref, icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/profile",    icon: User,            label: "Profile" },
                        ...(isTeacher() ? [
                          { href: "/teacher/courses",        icon: GraduationCap, label: "My Courses" },
                          { href: "/teacher/live-sessions",  icon: Video,         label: "Live Sessions" },
                        ] : [
                          { href: "/courses", icon: BookOpen, label: "Browse Courses" },
                        ]),
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <Icon className="w-4 h-4 text-gray-500" />{label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-white/[0.06] pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/8 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-500 rounded-xl hover:bg-indigo-400 transition-all shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="max-w-6xl mx-auto mt-2 rounded-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.6)] pointer-events-auto overflow-hidden"
            style={{ background: "rgba(7,11,26,0.97)", backdropFilter: "blur(24px)" }}
          >
            <div className="px-3 py-3 space-y-0.5">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/[0.06] px-3 py-3">
              {authed && user ? (
                <div className="space-y-0.5">
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link href={dashboardHref} className="block px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link href="/profile" className="block px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>Profile</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">Sign out</button>
                </div>
              ) : (
                <div className="flex gap-2 px-1">
                  <Link href="/login" className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-gray-300 border border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  <Link href="/register" className="flex-1 px-4 py-2.5 text-sm font-bold text-center text-white bg-indigo-500 rounded-xl hover:bg-indigo-400 transition-colors" onClick={() => setMobileOpen(false)}>Get started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="h-[72px]" />
    </>
  );
}
