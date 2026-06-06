"use client";

import { useAuthStore } from "@/stores/authStore";
import { DashboardSidebar } from "./DashboardSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function DashboardLayout({ children, title, subtitle, actions, breadcrumbs }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    fetch(`${apiBase}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUnreadCount(d.unread_count || 0); })
      .catch(() => {});
  }, [pathname]);

  const initials = user?.full_name?.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase() || "BW";

  return (
    <div className="dash-layout flex h-screen overflow-hidden" style={{ fontFamily: "var(--font-sans, Inter, system-ui)" }}>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header
          className="flex shrink-0 items-center justify-between px-6 bg-white border-b border-gray-100"
          style={{ height: "var(--header-height, 64px)" }}
        >
          {/* Left: breadcrumbs */}
          <div className="flex items-center gap-1 text-sm">
            {(breadcrumbs || []).map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                {b.href ? (
                  <Link href={b.href} className="text-gray-400 hover:text-gray-600 transition-colors">{b.label}</Link>
                ) : (
                  <span className="text-gray-700 font-medium">{b.label}</span>
                )}
              </span>
            ))}
          </div>

          {/* Right: search + notification + user */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                style={{ fontFamily: "var(--font-sans)" }}
              />
            </div>

            {/* Notifications */}
            <Link href="/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-semibold text-gray-800 leading-tight">{user?.full_name || "User"}</p>
                <p className="text-[11px] text-gray-400 capitalize">{user?.role || "member"}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  : initials
                }
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Page header */}
          {(title || actions) && (
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                {title && <h1 className="text-xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3 shrink-0 ml-4">{actions}</div>}
            </div>
          )}
          <div className="px-6 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* Reusable sub-components for pages using DashboardLayout */

export function MetricCard({
  label, value, icon: Icon, trend, trendLabel, color = "blue", suffix = ""
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red";
  suffix?: string;
}) {
  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    red:    "bg-red-50 text-red-600",
  };

  return (
    <div className="dash-metric-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {trendLabel && <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>}
    </div>
  );
}

export function SectionCard({
  title, subtitle, action, children, className = ""
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`dash-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            {title && <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Badge({
  children, variant = "neutral"
}: {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
}) {
  const cls: Record<string, string> = {
    success: "dash-badge dash-badge-success",
    warning: "dash-badge dash-badge-warning",
    danger:  "dash-badge dash-badge-danger",
    info:    "dash-badge dash-badge-info",
    neutral: "dash-badge dash-badge-neutral",
    purple:  "dash-badge bg-purple-50 text-purple-700",
  };
  return <span className={cls[variant]}>{children}</span>;
}
