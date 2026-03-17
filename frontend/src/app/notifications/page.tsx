"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const notifTypeStyles: Record<string, string> = {
    enrollment: "bg-green-900/30 text-green-400",
    certificate: "bg-yellow-900/30 text-yellow-400",
    risk_alert: "bg-red-900/30 text-red-400",
    course_update: "bg-blue-900/30 text-blue-400",
    live_session: "bg-purple-900/30 text-purple-400",
    default: "bg-gray-800 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-400 text-sm">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
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
        ) : !notifications?.length ? (
          <div className="text-center py-24">
            <Bell className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">No notifications yet</p>
            <p className="text-gray-500 text-sm mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                className={`bg-gray-900 rounded-xl p-4 border cursor-pointer transition-all ${
                  notif.is_read
                    ? "border-gray-800 opacity-70"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                  )}
                  <div className={`flex-1 ${notif.is_read ? "ml-5" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notifTypeStyles[notif.notification_type] || notifTypeStyles.default
                      }`}>
                        {notif.notification_type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(notif.created_at)}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{notif.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{notif.message}</p>
                    {notif.action_url && (
                      <a
                        href={notif.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-400 hover:text-primary-300 mt-1 inline-block"
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
      </div>
    </div>
  );
}
