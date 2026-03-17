"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, Plus, Calendar, Clock, DollarSign, Loader2, ExternalLink } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TeacherDoubtSessionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    course_id: "",
    scheduled_at: "",
    duration_minutes: 30,
    price: 0,
    session_type: "one_on_one" as "one_on_one" | "group",
    max_students: 1,
    description: "",
  });

  const { data: courses } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => courseApi.list({ teacher: true }).then((r) => r.data),
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["teacher-doubt-sessions"],
    queryFn: () => doubtApi.mySessions().then((r) => r.data),
  });

  const createSession = useMutation({
    mutationFn: (data: typeof form) => doubtApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-doubt-sessions"] });
      setShowForm(false);
      setForm({ title: "", course_id: "", scheduled_at: "", duration_minutes: 30, price: 0, session_type: "one_on_one", max_students: 1, description: "" });
    },
  });

  const joinSession = useMutation({
    mutationFn: (sessionId: string) => doubtApi.join(sessionId),
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
            <h1 className="text-2xl font-bold text-foreground">Doubt Sessions</h1>
            <p className="text-muted-foreground mt-1">Create one-on-one or group doubt clearing sessions</p>
          </div>
          <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" /> New Slot
          </Button>
        </div>

        {showForm && (
          <div className="glass-card p-6 mb-6 rounded-3xl animate-slide-up">
            <h2 className="text-foreground font-bold mb-5">Create Doubt Session Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} variant="glass" placeholder="e.g., Doubt Clearing - JavaScript Arrays" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Course (Optional)</label>
                  <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="w-full glass-input rounded-xl px-4 py-3 text-sm">
                    <option value="">Any course</option>
                    {(courses || []).map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Session Type</label>
                  <select value={form.session_type} onChange={(e) => setForm({ ...form, session_type: e.target.value as any, max_students: e.target.value === "one_on_one" ? 1 : 5 })} className="w-full glass-input rounded-xl px-4 py-3 text-sm">
                    <option value="one_on_one">1-on-1</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Date & Time *</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="w-full glass-input rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Duration (mins)</label>
                  <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} min={15} max={120} step={15} variant="glass" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Price (INR)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} min={0} variant="glass" />
                </div>
              </div>
              {form.session_type === "group" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Max Students</label>
                  <Input type="number" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })} min={2} max={20} variant="glass" />
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What topics will you cover?" className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <Button variant="gradient" onClick={() => createSession.mutate(form)} disabled={!form.title || !form.scheduled_at} loading={createSession.isPending}>
                  Create Slot
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
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-semibold">No doubt sessions yet</p>
            <p className="text-muted-foreground text-sm mt-1">Create a slot to let students book time with you</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session: any) => (
              <div key={session.id} className="glass-card p-5 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={session.status === "booked" ? "success" : session.status === "available" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{session.session_type === "one_on_one" ? "1-on-1" : "Group"}</span>
                    </div>
                    <h3 className="text-foreground font-semibold">{session.title}</h3>
                    {session.description && <p className="text-muted-foreground text-sm mt-1">{session.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(session.scheduled_at)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{session.duration_minutes} mins</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{session.price === 0 ? "Free" : formatPrice(session.price)}</span>
                    </div>
                  </div>
                  {session.status === "booked" && (
                    <Button variant="gradient" size="sm" onClick={() => joinSession.mutate(session.id)} loading={joinSession.isPending} className="gap-1.5 rounded-xl">
                      <ExternalLink className="h-3.5 w-3.5" /> Join
                    </Button>
                  )}
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
