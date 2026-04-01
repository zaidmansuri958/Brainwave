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
    enrollment:   "bg-green-50 text-green-700",
    certificate:  "bg-amber-50 text-amber-700",
    risk_alert:   "bg-red-50 text-red-700",
    course_update:"bg-blue-50 text-blue-700",
    live_session: "bg-violet-50 text-violet-700",
    default:      "bg-gray-100 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-500 text-sm">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : !notifications?.length ? (
          <div className="text-center py-24">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-semibold">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all shadow-sm ${
                  notif.is_read
                    ? "border-gray-100 opacity-70"
                    : "border-gray-200 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                  )}
                  <div className={`flex-1 ${notif.is_read ? "ml-5" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        notifTypeStyles[notif.notification_type] || notifTypeStyles.default
                      }`}>
                        {notif.notification_type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(notif.created_at)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                    {notif.action_url && (
                      <a
                        href={notif.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-1 inline-block"
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
