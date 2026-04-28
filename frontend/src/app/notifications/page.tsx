"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { notifApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppShell, ContentBand, EmptyStatePanel, SectionHeader, StatusBadge } from "@/components/ui/app-shell";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifApi.get().then((response) => response.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notifApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notifApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications?.filter((item: any) => !item.is_read).length || 0;

  const notifTone = (type: string) => {
    if (type === "certificate") return "success" as const;
    if (type === "risk_alert") return "danger" as const;
    if (type === "live_session") return "info" as const;
    if (type === "enrollment") return "success" as const;
    return "neutral" as const;
  };

  return (
    <AppShell className="flex flex-col">
      <Navbar />
      <main className="bw-shell flex-1 space-y-6 pb-6">
        <ContentBand muted>
          <SectionHeader
            eyebrow="Notifications"
            title="Updates now live in a clearer, denser inbox."
            description="Unread states, notification types, and actions are easier to scan without the empty single-column feel of the old layout."
            action={
              unreadCount > 0 ? (
                <button type="button" onClick={() => markAllRead.mutate()} className="bw-action-secondary">
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              ) : null
            }
          />
        </ContentBand>

        <ContentBand>
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bw-card h-28 animate-pulse bg-white/70" />
              ))}
            </div>
          ) : !notifications?.length ? (
            <EmptyStatePanel title="No notifications yet" description="When something important happens in your courses or account, it will appear here." icon={Bell} />
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => !notification.is_read && markRead.mutate(notification.id)}
                  className={`bw-card w-full p-5 text-left transition ${notification.is_read ? "opacity-75" : "hover:-translate-y-0.5"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {!notification.is_read ? <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> : null}
                        <StatusBadge tone={notifTone(notification.notification_type)}>{notification.notification_type?.replace(/_/g, " ")}</StatusBadge>
                        <span className="text-xs text-slate-400">{formatDate(notification.created_at)}</span>
                      </div>
                      <p className="mt-3 font-display text-lg font-bold text-slate-950">{notification.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{notification.message}</p>
                      {notification.action_url ? <span className="mt-3 inline-flex text-sm font-semibold text-indigo-700">Open related page</span> : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ContentBand>
      </main>
      <Footer />
    </AppShell>
  );
}
