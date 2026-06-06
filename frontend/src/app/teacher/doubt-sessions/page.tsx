"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtApi, teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { HelpCircle, Plus, Calendar, Clock, DollarSign, Loader2, ExternalLink, X, Trash2, CheckSquare } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

const labelClass = "mb-2 block text-sm font-black uppercase tracking-widest text-slate-800";
const inputClass = "w-full rounded-[16px] border-4 border-black bg-[#f4f4f5] px-5 py-4 text-base font-bold text-slate-900 shadow-[4px_4px_0_#111111] outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]";

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
    queryFn: () => teacherApi.myCourses().then((r) => r.data),
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

  const deleteSession = useMutation({
    mutationFn: (sessionId: string) => doubtApi.delete(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-doubt-sessions"] }),
  });

  const endSession = useMutation({
    mutationFn: (sessionId: string) => doubtApi.end(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-doubt-sessions"] }),
  });

  return (
    <div className="bw-page min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10 mb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <span className="inline-block rounded-full border-2 border-black bg-[#ffe500] px-3 py-1 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_#111111] mb-4">
              Teacher Studio
            </span>
            <h1 className="font-display font-black uppercase tracking-tight text-4xl text-slate-900">Doubt Sessions</h1>
            <p className="text-slate-600 font-bold text-sm mt-1">Create one-on-one or group doubt clearing sessions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-[#ff6b00] px-6 py-3 text-base font-black uppercase tracking-widest text-white shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#111111]"
          >
            <Plus className="h-5 w-5" strokeWidth={3} /> New Slot
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rounded-[32px] border-4 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0_#111111] mb-10">
            <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
              <h2 className="font-display font-black uppercase tracking-tight text-2xl text-slate-900">Create Doubt Session Slot</h2>
              <button onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-black bg-white shadow-[2px_2px_0_#111111] transition-transform hover:-translate-y-1">
                <X className="h-5 w-5 text-black" strokeWidth={3} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Title <span className="text-[#ff6b00]">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Doubt Clearing - JavaScript Arrays"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Course (Optional)</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    className={inputClass + " appearance-none"}
                  >
                    <option value="">Any course</option>
                    {(courses || []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Session Type</label>
                  <select
                    value={form.session_type}
                    onChange={(e) => setForm({ ...form, session_type: e.target.value as any, max_students: e.target.value === "one_on_one" ? 1 : 5 })}
                    className={inputClass + " appearance-none"}
                  >
                    <option value="one_on_one">1-on-1</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Date &amp; Time <span className="text-[#ff6b00]">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Duration (mins)</label>
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
                  <label className={labelClass}>Price (INR)</label>
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
                  <label className={labelClass}>Max Students</label>
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
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What topics will you cover?"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-4 border-black mt-8 pt-8">
                <button
                  onClick={() => createSession.mutate(form)}
                  disabled={!form.title || !form.scheduled_at || createSession.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-[#ffe500] px-8 py-4 text-base font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#111111] disabled:opacity-50"
                >
                  {createSession.isPending ? <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} /> : "Create Slot"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-white px-8 py-4 text-base font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#111111]"
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
            <Loader2 className="h-10 w-10 text-black animate-spin" strokeWidth={3} />
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-24 rounded-[32px] border-4 border-black bg-white shadow-[8px_8px_0_#111111]">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] border-4 border-black bg-[#f7a8d8] shadow-[6px_6px_0_#111111] mb-8">
              <HelpCircle className="h-10 w-10 text-black" strokeWidth={3} />
            </div>
            <p className="font-display text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">No doubt sessions yet</p>
            <p className="text-slate-600 font-bold">Create a slot to let students book time with you</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session: any) => (
              <div key={session.id} className="rounded-[24px] border-4 border-black bg-white p-6 shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_#111111]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center gap-2 rounded-full border-4 border-black px-3 py-1 text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_#111111] ${
                        session.status === "booked"     ? "bg-[#7dde92]" :
                        session.status === "available"  ? "bg-[#8ed8ff]" :
                        "bg-gray-100"
                      }`}>
                        {session.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{session.session_type === "one_on_one" ? "1-on-1" : "Group"}</span>
                    </div>
                    <h3 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900">{session.title}</h3>
                    {session.description && (
                      <p className="text-slate-600 font-bold text-sm mt-2">{session.description}</p>
                    )}
                    <div className="flex flex-wrap gap-5 mt-4 text-sm font-bold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-black" strokeWidth={2.5} />
                        {formatDate(session.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-black" strokeWidth={2.5} />
                        {session.duration_minutes} mins
                      </span>
                      <span className="flex items-center gap-2 rounded-[8px] border-2 border-black bg-[#ffe500] px-2 py-1 shadow-[2px_2px_0_#111111]">
                        <DollarSign className="h-4 w-4 text-black" strokeWidth={3} />
                        {session.price === 0 ? "Free" : formatPrice(session.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-4 sm:mt-0 flex flex-wrap gap-3">
                    {session.status === "booked" && (
                      <button
                        onClick={() => joinSession.mutate(session.id)}
                        disabled={joinSession.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-[#7dde92] px-6 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#111111]"
                      >
                        <ExternalLink className="h-5 w-5" strokeWidth={3} /> Join
                      </button>
                    )}
                    {session.status === "booked" && (
                      <button
                        onClick={() => endSession.mutate(session.id)}
                        disabled={endSession.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-[#ffe500] px-4 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#111111]"
                      >
                        <CheckSquare className="h-5 w-5" strokeWidth={3} /> End
                      </button>
                    )}
                    {session.status === "available" && (
                      <button
                        onClick={() => { if (confirm("Delete this slot?")) deleteSession.mutate(session.id); }}
                        disabled={deleteSession.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-full border-4 border-black bg-white px-4 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#111111] transition-all hover:-translate-y-1 hover:bg-red-100 hover:shadow-[6px_6px_0_#111111]"
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={3} />
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
