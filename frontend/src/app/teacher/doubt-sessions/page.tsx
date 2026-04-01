"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { HelpCircle, Plus, Calendar, Clock, DollarSign, Loader2, ExternalLink } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

const inputClass =
  "w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-sm placeholder:text-gray-300";

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
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900">Doubt Sessions</h1>
            <p className="text-gray-500 mt-1">Create one-on-one or group doubt clearing sessions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold"
            style={{ boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
          >
            <Plus className="h-4 w-4" /> New Slot
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h2 className="font-display font-bold text-gray-900 mb-4">Create Doubt Session Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Doubt Clearing - JavaScript Arrays"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Course (Optional)</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Any course</option>
                    {(courses || []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Session Type</label>
                  <select
                    value={form.session_type}
                    onChange={(e) => setForm({ ...form, session_type: e.target.value as any, max_students: e.target.value === "one_on_one" ? 1 : 5 })}
                    className={inputClass}
                  >
                    <option value="one_on_one">1-on-1</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Duration (mins)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    min={15}
                    max={120}
                    step={15}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Price (INR)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    min={0}
                    className={inputClass}
                  />
                </div>
              </div>
              {form.session_type === "group" && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Max Students</label>
                  <input
                    type="number"
                    value={form.max_students}
                    onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })}
                    min={2}
                    max={20}
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="What topics will you cover?"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => createSession.mutate(form)}
                  disabled={!form.title || !form.scheduled_at || createSession.isPending}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors font-semibold"
                >
                  {createSession.isPending ? "Creating..." : "Create Slot"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
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
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-24">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-semibold">No doubt sessions yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a slot to let students book time with you</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session: any) => (
              <div key={session.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        session.status === "booked"     ? "bg-green-50 text-green-700 border border-green-100" :
                        session.status === "available"  ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {session.status}
                      </span>
                      <span className="text-xs text-gray-400">{session.session_type === "one_on_one" ? "1-on-1" : "Group"}</span>
                    </div>
                    <h3 className="text-gray-900 font-semibold">{session.title}</h3>
                    {session.description && (
                      <p className="text-gray-500 text-sm mt-1">{session.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration_minutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {session.price === 0 ? "Free" : formatPrice(session.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {session.status === "booked" && (
                      <button
                        onClick={() => joinSession.mutate(session.id)}
                        disabled={joinSession.isPending}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors font-semibold"
                      >
                        <ExternalLink className="h-4 w-4" /> Join
                      </button>
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
