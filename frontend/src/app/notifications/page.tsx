"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const notifVariants: Record<string, "default" | "success" | "warning" | "danger"> = {
    enrollment: "success",
    certificate: "warning",
    risk_alert: "danger",
    course_update: "default",
    live_session: "default",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground text-sm">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
              className="text-primary-500"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : !notifications?.length ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-semibold">No notifications yet</p>
            <p className="text-muted-foreground text-sm mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                className={`glass-card p-5 cursor-pointer transition-all duration-200 ${
                  notif.is_read ? "opacity-60" : "hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full gradient-bg flex-shrink-0 mt-1.5 shadow-glow" />
                  )}
                  <div className={`flex-1 ${notif.is_read ? "ml-[22px]" : ""}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={notifVariants[notif.notification_type] || "default"}>
                        {notif.notification_type?.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(notif.created_at)}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                    {notif.action_url && (
                      <a
                        href={notif.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-500 hover:text-primary-400 mt-2 inline-block font-semibold"
                      >
                        View details &rarr;
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
