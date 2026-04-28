"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Sparkles,
  User,
  X,
  LogOut,
  Search,
  GraduationCap,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const publicLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Features", href: "/features" },
  { label: "For Teachers", href: "/for-teachers" },
  { label: "Pricing", href: "/pricing" },
];

const studentLinks = [
  { label: "Browse", href: "/courses" },
  { label: "My Learning", href: "/dashboard" },
  { label: "Search", href: "/search" },
  { label: "Alerts", href: "/notifications" },
];

const teacherLinks = [
  { label: "Studio", href: "/teacher/dashboard" },
  { label: "Courses", href: "/teacher/courses" },
  { label: "Earnings", href: "/teacher/earnings" },
];

function ProductContextBar({ pathname }: { pathname: string }) {
  const group =
    pathname.startsWith("/teacher")
      ? {
          label: "Teacher Studio",
          links: [
            { href: "/teacher/dashboard", text: "Overview" },
            { href: "/teacher/courses", text: "Courses" },
            { href: "/teacher/earnings", text: "Earnings" },
          ],
        }
      : pathname.startsWith("/admin")
        ? { label: "Operations", links: [{ href: "/admin/dashboard", text: "Dashboard" }] }
        : pathname.startsWith("/dashboard") || pathname.startsWith("/learn") || pathname.startsWith("/notifications") || pathname.startsWith("/profile")
          ? {
              label: "Learning Hub",
              links: [
                { href: "/dashboard", text: "Dashboard" },
                { href: "/courses", text: "Browse" },
                { href: "/notifications", text: "Alerts" },
              ],
            }
          : null;

  if (!group) return null;

  return (
    <div className="bw-shell -mt-1 pb-3">
      <div className="bw-card-soft flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="bw-chip">{group.label}</span>
          <p className="bw-muted text-sm">Focused workflows with denser navigation and faster access to key actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {group.links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isTeacher } = useAuthStore();

  const authed = isAuthenticated();
  const teacher = authed && isTeacher();
  const student = authed && !teacher && user?.role !== "admin";

  const centerLinks = useMemo(() => {
    if (teacher) return teacherLinks;
    if (student) return studentLinks;
    return publicLinks;
  }, [student, teacher]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "BW";

  const dashboardHref =
    user?.role === "teacher" ? "/teacher/dashboard" : user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <>
      <header className="sticky top-0 z-50 pt-4">
        <div className="bw-shell">
          <div
            className={cn(
              "pointer-events-auto rounded-[24px] border-2 px-4 py-3 transition-all duration-300 sm:px-5",
              scrolled ? "shadow-md" : "shadow-sm"
            )}
            style={{
              background: "var(--bg-base)",
              borderColor: "var(--border-strong)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-black bg-brand-primary text-black shadow-[3px_3px_0_#111111]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold uppercase text-ink-heading">Brainwave.ai</p>
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">Neo learning platform</p>
                  </div>
                </Link>
                <span className="hidden xl:inline-flex bw-chip">
                  {teacher ? "Teacher Studio" : student ? "Student Hub" : "Learn Boldly"}
                </span>
              </div>

              <nav className="hidden items-center gap-1 rounded-full border-2 border-black bg-white p-1 shadow-[3px_3px_0_#111111] lg:flex">
                {centerLinks.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-full border-2 border-transparent px-4 py-2 text-sm font-extrabold uppercase transition",
                        active ? "border-black bg-brand-primary text-black" : "text-ink-muted hover:border-black hover:bg-[#8ed8ff] hover:text-ink-heading"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden lg:flex items-center gap-2">
                {student ? (
                  <>
                    <Link href="/search" className="bw-action-secondary !rounded-full !px-4 !py-2.5">
                      <Search className="h-4 w-4" />
                      Search
                    </Link>
                    <Link href="/notifications" className="bw-action-secondary !rounded-full !px-4 !py-2.5">
                      <Bell className="h-4 w-4" />
                      Updates
                    </Link>
                  </>
                ) : null}

                {teacher ? (
                  <>
                    <Link href="/teacher/courses/new" className="bw-action-secondary !rounded-full !px-4 !py-2.5">
                      <GraduationCap className="h-4 w-4" />
                      New Course
                    </Link>
                    <Link href="/teacher/onboarding" className="bw-action-primary !rounded-full !px-4 !py-2.5">
                      Verification
                    </Link>
                  </>
                ) : null}

                {!authed ? (
                  <>
                    <Link href="/login" className="bw-action-secondary !rounded-full !px-4 !py-2.5">
                      Sign in
                    </Link>
                    <Link href="/register" className="bw-action-primary !rounded-full !px-4 !py-2.5">
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-3 rounded-full border-2 border-black bg-white px-2.5 py-2 pr-3 text-left shadow-[3px_3px_0_#111111] transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[#8ed8ff] text-sm font-black text-black">
                        {initials}
                      </div>
                      <div className="max-w-[140px]">
                        <p className="truncate text-sm font-extrabold text-ink-heading">{user?.full_name}</p>
                        <p className="truncate text-xs font-bold uppercase text-ink-muted">{user?.role}</p>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-ink-muted transition", dropdownOpen && "rotate-180")} />
                    </button>

                    {dropdownOpen ? (
                      <div className="absolute right-0 top-full mt-3 w-64 rounded-[20px] border-2 border-black bg-white p-2 shadow-[5px_5px_0_#111111]">
                        <div className="rounded-[16px] border-2 border-black bg-[#fff4d6] px-4 py-3">
                          <p className="truncate text-sm font-extrabold text-ink-heading">{user?.full_name}</p>
                          <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                        </div>
                        <div className="mt-2 space-y-1">
                          {[
                            { href: dashboardHref, icon: LayoutDashboard, label: "Dashboard" },
                            { href: "/profile", icon: User, label: "Profile" },
                            { href: "/courses", icon: BookOpen, label: teacher ? "Browse marketplace" : "Browse courses" },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href + label}
                              href={href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-bold text-ink-muted transition hover:bg-[#8ed8ff] hover:text-ink-heading"
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-[#ffd6d6]"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-white text-ink-body shadow-[3px_3px_0_#111111] lg:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {mobileOpen ? (
              <div className="mt-4 rounded-[20px] border-2 border-black bg-white p-3 shadow-[4px_4px_0_#111111] lg:hidden">
                <div className="grid gap-1">
                  {centerLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-[14px] px-4 py-3 text-sm font-extrabold uppercase transition",
                        pathname === item.href ? "bg-brand-primary text-black" : "text-ink-body hover:bg-[#8ed8ff]"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-3 grid gap-2">
                  {authed ? (
                    <>
                      <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="bw-action-secondary !justify-start !rounded-xl !px-4 !py-3">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setMobileOpen(false)} className="bw-action-secondary !justify-start !rounded-xl !px-4 !py-3">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button type="button" onClick={handleLogout} className="bw-action-secondary !justify-start !rounded-xl !px-4 !py-3 text-rose-600">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="bw-action-secondary !justify-start !rounded-xl !px-4 !py-3">
                        Sign in
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)} className="bw-action-primary !justify-start !rounded-xl !px-4 !py-3">
                        Get started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <ProductContextBar pathname={pathname} />
      </header>
      <div className="h-4" />
    </>
  );
}
