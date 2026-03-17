"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.get().then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notifApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notifApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notificationItems = notifications?.notifications || [];
  const unreadCount = notifications?.unread_count ?? notificationItems.filter((n: any) => !n.is_read).length;

  const notifTypeStyles: Record<string, string> = {
    enrollment: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    certificate: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    risk_alert: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    course_update: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    live_session: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  };

  return (
    <div className="app-shell flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-200 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : !notificationItems.length ? (
          <div className="glass-panel text-center py-24">
            <Bell className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-300 text-lg font-semibold">No notifications yet</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notificationItems.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                  notif.is_read
                    ? "opacity-80"
                    : "hover:border-primary-300 dark:hover:border-primary-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                  )}
                  <div className={`flex-1 ${notif.is_read ? "ml-5" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notifTypeStyles[notif.type] || notifTypeStyles.default
                      }`}>
                        {notif.type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(notif.created_at)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{notif.message}</p>
                    {notif.extra_data?.action_url && (
                      <a
                        href={notif.extra_data.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-600 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-200 mt-1 inline-block"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
