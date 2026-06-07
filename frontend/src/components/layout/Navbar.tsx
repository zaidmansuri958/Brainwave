"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, ChevronDown, LayoutDashboard, LogOut,
  Menu, Search, User, X, BookOpen,
  BarChart3, FileText, Star, ClipboardList, Package,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const coursesDropdown = [
  { label: "All Courses",     href: "/courses",                          icon: BookOpen      },
  { label: "Top Rated",       href: "/courses?sort=rating",              icon: Star          },
  { label: "Data Science",    href: "/courses?category=Data+Science",    icon: BarChart3     },
  { label: "Programming",     href: "/courses?category=Programming",     icon: FileText      },
  { label: "Mock Tests",      href: "/catalog/mock-tests",               icon: ClipboardList },
  { label: "Study Materials", href: "/catalog/materials",                icon: Package       },
];

const resourcesDropdown = [
  { label: "Blog",          href: "#" },
  { label: "Tutorials",     href: "#" },
  { label: "Webinars",      href: "#" },
  { label: "Documentation", href: "#" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isTeacher } = useAuthStore();

  const authed = isAuthenticated();
  const teacher = authed && isTeacher?.();
  const isAdmin = authed && user?.role === "admin";
  const dashboardHref = isAdmin ? "/admin/dashboard" : teacher ? "/teacher/dashboard" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(null);
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    fetch(`${apiBase}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUnreadCount(d.unread_count || 0); })
      .catch(() => {});
  }, [authed, pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    router.push("/");
  };

  const initials = user?.full_name?.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase() || "BW";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-200",
        scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4" ref={dropdownRef}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Brainwave"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
              priority
            />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Brainwave</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Courses dropdown */}
            <div className="relative">
              <button
                className={cn("flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  dropdownOpen === "courses" ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}
                onClick={() => setDropdownOpen(dropdownOpen === "courses" ? null : "courses")}
              >
                Courses <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen === "courses" && "rotate-180")} />
              </button>
              {dropdownOpen === "courses" && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5 z-50">
                  {coursesDropdown.map((item) => (
                    <Link key={item.label} href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                      onClick={() => setDropdownOpen(null)}>
                      <item.icon className="h-4 w-4 text-gray-400" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/for-teachers" className={cn("px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/for-teachers" ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}>
              For Teachers
            </Link>

            <Link href="/features" className={cn("px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/features" ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}>
              Community
            </Link>

            {/* Resources dropdown */}
            <div className="relative">
              <button
                className={cn("flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  dropdownOpen === "resources" ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}
                onClick={() => setDropdownOpen(dropdownOpen === "resources" ? null : "resources")}
              >
                Resources <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen === "resources" && "rotate-180")} />
              </button>
              {dropdownOpen === "resources" && (
                <div className="absolute top-full left-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5 z-50">
                  {resourcesDropdown.map((item) => (
                    <Link key={item.label} href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                      onClick={() => setDropdownOpen(null)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pricing" className={cn("px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/pricing" ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}>
              Pricing
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex relative">
              {searchOpen ? (
                <div className="flex items-center">
                  <input autoFocus type="text" placeholder="Search for courses, skills..."
                    className="w-56 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    onBlur={() => setSearchOpen(false)}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/search?q=${(e.target as HTMLInputElement).value}`)} />
                  <button className="ml-1 text-gray-400" onClick={() => setSearchOpen(false)}><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 hover:border-violet-300 hover:bg-violet-50 transition-colors w-52 whitespace-nowrap">
                  <Search className="h-4 w-4 shrink-0" />
                  <span className="truncate">Search courses, skills...</span>
                </button>
              )}
            </div>

            {authed ? (
              <>
                <Link href="/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold shrink-0">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        : initials}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.full_name}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", userDropdown && "rotate-180")} />
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg z-50">
                      <div className="px-4 py-2.5 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                      </div>
                      <Link href={dashboardHref} onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="h-4 w-4 text-gray-400" /> Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4 text-gray-400" /> Profile
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Log In
                </Link>
                <Link href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm">
                  Get Started Free
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {[
            { label: "Courses",         href: "/courses"              },
            { label: "Mock Tests",      href: "/catalog/mock-tests"   },
            { label: "Study Materials", href: "/catalog/materials"    },
            { label: "For Teachers",    href: "/for-teachers"         },
            { label: "Community",       href: "/features"             },
            { label: "Pricing",         href: "/pricing"              },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {link.label}
            </Link>
          ))}
          {!authed ? (
            <div className="pt-2 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50">Log In</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-full hover:bg-violet-700">Get Started</Link>
            </div>
          ) : (
            <Link href={dashboardHref} onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50">
              → Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
