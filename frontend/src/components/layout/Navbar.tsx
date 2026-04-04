"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Zap, Menu, X, ChevronDown, LayoutDashboard,
  User, LogOut, GraduationCap, BookOpen, Sparkles, Video,
  Award, Search, FileStack, ClipboardList, CalendarClock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// Links shown when no one is logged in (or teacher is logged in)
const publicLinks = [
  { label: "Courses",      href: "/courses"       },
  { label: "Features",     href: "/features"      },
  { label: "For Teachers", href: "/for-teachers"  },
  { label: "Pricing",      href: "/pricing"       },
];

// Links shown in the centre when a student is logged in
const studentLinks = [
  { label: "Browse Courses", href: "/courses"   },
  { label: "My Learning",    href: "/dashboard" },
  { label: "Materials",      href: "/catalog/materials" },
  { label: "Mock tests",     href: "/catalog/mock-tests" },
  { label: "Search",         href: "/search"    },
  { label: "Features",       href: "/features"  },
];

export function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router      = useRouter();
  const pathname    = usePathname();

  const { user, logout, isAuthenticated, isTeacher } = useAuthStore();
  const authed  = isAuthenticated();
  const student = authed && !isTeacher();

  // Pick the right centre links
  const centerLinks = student ? studentLinks : publicLinks;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => { logout(); setDropdownOpen(false); router.push("/"); };

  const initials = user?.full_name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  const dashboardHref = isTeacher() ? "/teacher/dashboard" : "/dashboard";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <nav
          className="w-full max-w-6xl h-14 flex items-center justify-between px-5 rounded-2xl pointer-events-auto transition-all duration-500"
          style={{
            background: scrolled
              ? "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(200,230,255,0.08) 50%, rgba(255,255,255,0.10) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(180,220,255,0.06) 50%, rgba(255,255,255,0.08) 100%)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(120,180,255,0.12)"
              : "0 4px 24px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.20) inset, 0 0 0 1px rgba(120,180,255,0.08)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 0 12px rgba(99,102,241,0.5), 0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-[0.95rem] tracking-tight text-gray-900">
              Brainwave<span className="text-indigo-500">.ai</span>
            </span>
          </Link>

          {/* Centre links */}
          <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {centerLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-1.5 text-[0.82rem] font-semibold rounded-xl transition-all duration-150 whitespace-nowrap ${
                    active
                      ? "text-indigo-700 bg-indigo-50/80 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {authed && user ? (
              <div ref={dropdownRef} className="relative flex items-center gap-2">
                {/* Student quick actions */}
                {student && (
                  <Link
                    href="/courses"
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Enroll Now
                  </Link>
                )}

                {/* Teacher quick actions */}
                {isTeacher() && (
                  <>
                    <Link
                      href={dashboardHref}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-white/60 transition-all flex items-center gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <Link
                      href="/teacher/courses/new"
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> New Course
                    </Link>
                  </>
                )}

                {/* Avatar dropdown */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-white/60 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background: student ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  >
                    {initials}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 z-50 overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role} account</p>
                    </div>

                    <div className="py-1">
                      {student ? (
                        // Student dropdown links
                        <>
                          {[
                            { href: "/dashboard",  icon: LayoutDashboard, label: "My Dashboard"     },
                            { href: "/profile",    icon: User,            label: "Profile"           },
                            { href: "/courses",    icon: BookOpen,        label: "Browse Courses"    },
                            { href: "/dashboard",  icon: Award,           label: "My Certificates"  },
                            { href: "/search",     icon: Search,          label: "Search"            },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={label}
                              href={href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-gray-400" />{label}
                            </Link>
                          ))}
                        </>
                      ) : (
                        // Teacher dropdown links
                        <>
                          {[
                            { href: "/teacher/dashboard",       icon: LayoutDashboard, label: "Dashboard"      },
                            { href: "/profile",                 icon: User,            label: "Profile"         },
                            { href: "/teacher/courses",         icon: GraduationCap,   label: "My Courses"     },
                            { href: "/teacher/study-materials", icon: FileStack,       label: "Study materials"  },
                            { href: "/teacher/mock-tests",      icon: ClipboardList,   label: "Mock tests"      },
                            { href: "/teacher/availability",    icon: CalendarClock,   label: "Doubt slots"     },
                            { href: "/teacher/live-sessions",   icon: Video,           label: "Live Sessions"   },
                            { href: "/teacher/courses/new",     icon: Sparkles,        label: "Create Course"  },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-gray-400" />{label}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-white/60 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.15) inset",
                  }}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="absolute top-20 left-4 right-4 rounded-2xl pointer-events-auto overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            }}
          >
            <div className="px-3 py-3 space-y-0.5">
              {centerLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 px-3 py-3">
              {authed && user ? (
                <div className="space-y-0.5">
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: student ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link href={dashboardHref} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link href="/profile"      className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileOpen(false)}>Profile</Link>
                  {student && (
                    <Link href="/dashboard" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileOpen(false)}>My Certificates</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl">Sign out</button>
                </div>
              ) : (
                <div className="flex gap-2 px-1">
                  <Link href="/login"    className="flex-1 py-2.5 text-sm font-semibold text-center text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  <Link href="/register" className="flex-1 py-2.5 text-sm font-bold text-center text-white rounded-xl" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} onClick={() => setMobileOpen(false)}>Get started</Link>
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
