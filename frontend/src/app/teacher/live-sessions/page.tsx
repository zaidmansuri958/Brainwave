"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Video, Plus, Calendar, Clock, Users, ExternalLink, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Sessions</h1>
            <p className="text-gray-400 mt-1">Schedule and manage your live lectures</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Schedule Session
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
            <h2 className="text-white font-semibold mb-4">New Live Session</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Q&A Session - Module 3"
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select a course (optional)</option>
                  {(courses || []).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Scheduled At *</label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Max Participants</label>
                  <input
                    type="number"
                    value={form.max_participants}
                    onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })}
                    min={1}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => createSession.mutate(form)}
                  disabled={!form.title || !form.scheduled_at || createSession.isPending}
                  className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {createSession.isPending ? "Creating..." : "Create Session"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm"
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
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-24">
            <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">No sessions scheduled</p>
            <p className="text-gray-500 text-sm mt-1">Create a live session to connect with your students</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session: any) => {
              const isUpcoming = new Date(session.scheduled_at) > new Date();
              const isLive = session.status === "live";

              return (
                <div key={session.id} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isLive && (
                          <span className="flex items-center gap-1 text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            LIVE
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isLive ? "bg-red-900/20 text-red-400" :
                          isUpcoming ? "bg-blue-900 text-blue-400" :
                          "bg-gray-800 text-gray-400"
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold">{session.title}</h3>
                      {session.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(session.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {session.registered_count || 0}/{session.max_participants || "∞"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {(isUpcoming || isLive) && (
                        <button
                          onClick={() => joinSession.mutate(session.id)}
                          disabled={joinSession.isPending}
                          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-700 transition-colors"
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
      </div>
    </div>
  );
}
