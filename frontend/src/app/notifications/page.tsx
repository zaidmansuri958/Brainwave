"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertCircle, Video, BookOpen } from "lucide-react";
import { notifApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { DashboardLayout, SectionCard, Badge } from "@/components/layout/DashboardLayout";

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

  const deleteNotif = useMutation({
    mutationFn: (id: string) => notifApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifList = notifications?.notifications || notifications || [];
  const unreadCount = notifList.filter((n: any) => !n.is_read).length;

  const notifVariant = (type: string): "success" | "danger" | "info" | "warning" | "neutral" => {
    if (type?.includes("certificate") || type?.includes("enrollment")) return "success";
    if (type?.includes("risk")) return "danger";
    if (type?.includes("live_session")) return "info";
    if (type?.includes("doubt")) return "warning";
    return "neutral";
  };

  const notifIcon = (type: string) => {
    if (type?.includes("certificate")) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (type?.includes("risk")) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (type?.includes("live_session")) return <Video className="h-5 w-5 text-blue-500" />;
    if (type?.includes("enrollment")) return <BookOpen className="h-5 w-5 text-green-500" />;
    return <Info className="h-5 w-5 text-gray-400" />;
  };

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay up to date with your courses and account activity."
      breadcrumbs={[{ label: "Notifications" }]}
      actions={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="dash-btn-secondary flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read ({unreadCount})
          </button>
        ) : undefined
      }
    >
      <SectionCard
        title="Inbox"
        subtitle={`${notifList.length} notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 p-4 rounded-xl bg-gray-50">
                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifList.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-base font-semibold text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">Course updates and alerts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifList.map((n: any) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors group ${
                  n.is_read ? "hover:bg-gray-50" : "bg-blue-50/50 hover:bg-blue-50"
                }`}
              >
                {/* Icon */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? "bg-gray-100" : "bg-white shadow-sm"}`}>
                  {notifIcon(n.type)}
                </div>

                {/* Content */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <Badge variant={notifVariant(n.type)}>
                      {(n.type || "").replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDate(n.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(n.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotif.mutate(n.id)}
                    disabled={deleteNotif.isPending}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
