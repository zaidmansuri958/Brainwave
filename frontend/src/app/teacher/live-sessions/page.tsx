"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Video, Plus, Calendar, Clock, Users, ExternalLink, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TeacherLiveSessionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    course_id: "",
    scheduled_at: "",
    max_participants: 100,
    description: "",
  });

  const { data: courses } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => courseApi.list({ teacher: true }).then((r) => r.data),
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["teacher-live-sessions"],
    queryFn: () => liveApi.list().then((r) => r.data),
  });

  const createSession = useMutation({
    mutationFn: (data: typeof form) => liveApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-live-sessions"] });
      setShowForm(false);
      setForm({ title: "", course_id: "", scheduled_at: "", max_participants: 100, description: "" });
    },
  });

  const joinSession = useMutation({
    mutationFn: (sessionId: string) => liveApi.join(sessionId),
    onSuccess: (data: any) => {
      window.open(data.data.jitsi_url, "_blank");
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Sessions</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage your live lectures</p>
          </div>
          <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" /> Schedule Session
          </Button>
        </div>

        {showForm && (
          <div className="glass-card p-6 mb-6 rounded-3xl animate-slide-up">
            <h2 className="text-foreground font-bold mb-5">New Live Session</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} variant="glass" placeholder="e.g., Q&A Session - Module 3" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Course</label>
                <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="w-full glass-input rounded-xl px-4 py-3 text-sm">
                  <option value="">Select a course (optional)</option>
                  {(courses || []).map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Scheduled At *</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="w-full glass-input rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Max Participants</label>
                  <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })} min={1} variant="glass" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <Button variant="gradient" onClick={() => createSession.mutate(form)} disabled={!form.title || !form.scheduled_at} loading={createSession.isPending}>
                  Create Session
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-semibold">No sessions scheduled</p>
            <p className="text-muted-foreground text-sm mt-1">Create a live session to connect with your students</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session: any) => {
              const isUpcoming = new Date(session.scheduled_at) > new Date();
              const isLive = session.status === "live";
              return (
                <div key={session.id} className="glass-card p-5 card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isLive && (
                          <Badge variant="danger" className="gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
                          </Badge>
                        )}
                        <Badge variant={isLive ? "danger" : isUpcoming ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </div>
                      <h3 className="text-foreground font-semibold">{session.title}</h3>
                      {session.description && <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{session.description}</p>}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(session.scheduled_at)}</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" />{session.registered_count || 0}/{session.max_participants || "\u221e"}</span>
                      </div>
                    </div>
                    {(isUpcoming || isLive) && (
                      <Button variant="gradient" size="sm" onClick={() => joinSession.mutate(session.id)} loading={joinSession.isPending} className="gap-1.5 rounded-xl">
                        <ExternalLink className="h-3.5 w-3.5" /> {isLive ? "Join Now" : "Start"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
