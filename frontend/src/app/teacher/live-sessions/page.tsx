"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveApi, teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Video, Plus, Calendar, Users, ExternalLink, Loader2, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400";

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
    queryFn: () => teacherApi.myCourses().then((r) => r.data),
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
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">Live Sessions</h1>
            <p className="text-gray-400 text-sm mt-1">Schedule and manage your live lectures</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-button-indigo"
          >
            <Plus className="h-4 w-4" /> Schedule Session
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-900">New Live Session</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Q&A Session — Module 3"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a course (optional)</option>
                  {(courses || []).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Scheduled At <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max Participants</label>
                  <input
                    type="number"
                    value={form.max_participants}
                    onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })}
                    min={1}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={inputClass + " resize-none"}
                  placeholder="What will you cover in this session?"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => createSession.mutate(form)}
                  disabled={!form.title || !form.scheduled_at || createSession.isPending}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-button-indigo"
                >
                  {createSession.isPending ? "Creating…" : "Create Session"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
              <Video className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-gray-900 text-lg font-bold mb-1">No sessions scheduled</p>
            <p className="text-gray-400 text-sm">Create a live session to connect with your students in real time</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session: any) => {
              const isUpcoming = new Date(session.scheduled_at) > new Date();
              const isLive = session.status === "live";

              return (
                <div key={session.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isLive && (
                          <span className="flex items-center gap-1.5 text-[11px] bg-red-50 text-red-600 border border-red-100 px-2.5 py-0.5 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            LIVE
                          </span>
                        )}
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize border ${
                          isLive
                            ? "bg-red-50 text-red-600 border-red-100"
                            : isUpcoming
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-gray-900">{session.title}</h3>
                      {session.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <div className="flex flex-wrap gap-5 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(session.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {session.registered_count || 0}/{session.max_participants || "∞"} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {(isUpcoming || isLive) && (
                        <button
                          onClick={() => joinSession.mutate(session.id)}
                          disabled={joinSession.isPending}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-button-indigo"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {isLive ? "Join Now" : "Start"}
                        </button>
                      )}
                    </div>
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
