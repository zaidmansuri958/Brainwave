"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveApi, teacherApi } from "@/lib/api";
import { Video, Plus, Calendar, Users, ExternalLink, Loader2, X, Trash2, CheckSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DashboardLayout, SectionCard, Badge } from "@/components/layout/DashboardLayout";

const lbl = "mb-1.5 block text-sm font-medium text-gray-700";
const inp = "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

export default function TeacherLiveSessionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", course_id: "", scheduled_at: "", max_participants: 100, description: "" });

  const { data: courses } = useQuery({ queryKey: ["teacher-courses"], queryFn: () => teacherApi.myCourses().then((r) => r.data) });
  const { data: sessions, isLoading } = useQuery({ queryKey: ["teacher-live-sessions"], queryFn: () => liveApi.list().then((r) => r.data) });

  const createSession = useMutation({
    mutationFn: (data: typeof form) => liveApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["teacher-live-sessions"] }); setShowForm(false); setForm({ title: "", course_id: "", scheduled_at: "", max_participants: 100, description: "" }); },
  });
  const joinSession = useMutation({ mutationFn: (id: string) => liveApi.join(id), onSuccess: (d: any) => window.open(d.data.jitsi_url, "_blank") });
  const deleteSession = useMutation({ mutationFn: (id: string) => liveApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-live-sessions"] }) });
  const endSession = useMutation({ mutationFn: (id: string) => liveApi.end(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-live-sessions"] }) });

  return (
    <DashboardLayout
      title="Live Sessions"
      subtitle="Schedule and manage live lectures for your students."
      breadcrumbs={[{ label: "Teacher Studio" }, { label: "Live Sessions" }]}
      actions={
        <button onClick={() => setShowForm(true)} className="dash-btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Schedule Session
        </button>
      }
    >
      <div className="max-w-3xl space-y-4">
        {/* Create form */}
        {showForm && (
          <SectionCard title="New Live Session" action={<button onClick={() => setShowForm(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>}>
            <div className="space-y-4">
              <div><label className={lbl}>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Q&A Session — Module 3" className={inp} /></div>
              <div><label className={lbl}>Course (optional)</label>
                <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className={inp}>
                  <option value="">Any course</option>
                  {(courses || []).map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Scheduled At *</label><input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Max Participants</label><input type="number" value={form.max_participants} min={1} onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })} className={inp} /></div>
              </div>
              <div><label className={lbl}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What will you cover?" className={inp + " resize-none"} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => createSession.mutate(form)} disabled={!form.title || !form.scheduled_at || createSession.isPending} className="dash-btn-primary flex-1 justify-center flex items-center gap-2 disabled:opacity-50">
                  {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create Session
                </button>
                <button onClick={() => setShowForm(false)} className="dash-btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Sessions list */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
        ) : !(sessions || []).length ? (
          <div className="dash-card p-16 text-center">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">No sessions scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Create a live session to connect with your students.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(sessions || []).map((s: any) => {
              const isUpcoming = new Date(s.scheduled_at) > new Date();
              const isLive = s.status === "live";
              return (
                <div key={s.id} className="dash-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {isLive
                          ? <Badge variant="danger"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse mr-1 inline-block" />LIVE</Badge>
                          : <Badge variant={isUpcoming ? "info" : "neutral"}>{s.status}</Badge>
                        }
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
                      {s.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{s.description}</p>}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(s.scheduled_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      {(isUpcoming || isLive) && (
                        <button onClick={() => joinSession.mutate(s.id)} disabled={joinSession.isPending}
                          className="flex items-center gap-1.5 text-sm font-semibold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                          <ExternalLink className="h-4 w-4" /> {isLive ? "Join" : "Start"}
                        </button>
                      )}
                      {isLive && (
                        <button onClick={() => endSession.mutate(s.id)} disabled={endSession.isPending}
                          className="flex items-center gap-1.5 text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                          <CheckSquare className="h-4 w-4" /> End
                        </button>
                      )}
                      {s.status !== "completed" && s.status !== "cancelled" && (
                        <button onClick={() => { if (confirm("Cancel session?")) deleteSession.mutate(s.id); }} disabled={deleteSession.isPending}
                          className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
