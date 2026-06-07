"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtApi, teacherApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  HelpCircle, Plus, Calendar, Clock, DollarSign, Loader2,
  ExternalLink, X, Trash2, CheckSquare, Users, User,
  Video, BookOpen, AlertCircle,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── helpers ────────────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    available: { label: "Available",  cls: "bg-blue-50   text-blue-700   border-blue-200"   },
    booked:    { label: "Booked",     cls: "bg-green-50  text-green-700  border-green-200"  },
    completed: { label: "Completed",  cls: "bg-gray-100  text-gray-600   border-gray-200"   },
    cancelled: { label: "Cancelled",  cls: "bg-red-50    text-red-600    border-red-200"    },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const EMPTY_FORM = {
  title: "", course_id: "", scheduled_at: "", duration_minutes: 30,
  price: 0, session_type: "one_on_one" as "one_on_one" | "group",
  max_students: 1, description: "",
};

export default function TeacherDoubtSessionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: courses } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn:  () => teacherApi.myCourses().then(r => r.data),
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["teacher-doubt-sessions"],
    queryFn:  () => doubtApi.mySessions().then(r => r.data),
  });

  const createSession = useMutation({
    mutationFn: (data: typeof form) => doubtApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-doubt-sessions"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  const joinSession = useMutation({
    mutationFn: (id: string) => doubtApi.join(id),
    onSuccess:  (data: any) => window.open(data.data.jitsi_url, "_blank"),
  });

  const deleteSession = useMutation({
    mutationFn: (id: string) => doubtApi.delete(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["teacher-doubt-sessions"] }),
  });

  const endSession = useMutation({
    mutationFn: (id: string) => doubtApi.end(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["teacher-doubt-sessions"] }),
  });

  // grouped counts
  const available = sessions?.filter((s: any) => s.status === "available").length ?? 0;
  const booked    = sessions?.filter((s: any) => s.status === "booked").length    ?? 0;
  const completed = sessions?.filter((s: any) => s.status === "completed").length ?? 0;

  return (
    <DashboardLayout
      title="Doubt Sessions"
      subtitle="Create and manage 1-on-1 or group doubt clearing slots"
      breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Doubt Sessions" }]}
    >
      <div className="max-w-4xl py-6">

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Session Slot
          </button>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Available",  value: available, icon: Calendar,    color: "text-blue-600",  bg: "bg-blue-50"  },
            { label: "Booked",     value: booked,    icon: Users,       color: "text-green-600", bg: "bg-green-50" },
            { label: "Completed",  value: completed, icon: CheckSquare, color: "text-gray-600",  bg: "bg-gray-100" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Create form (inline card) ───────────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden"
            >
              {/* Form header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-violet-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                    <Plus className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Create Doubt Session Slot</h2>
                </div>
                <button onClick={() => setShowForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Title */}
                <Field label="Session title" required>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Doubt Clearing — JavaScript Arrays"
                    className={inputCls} />
                </Field>

                {/* Course + Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Course (optional)">
                    <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}
                      className={inputCls}>
                      <option value="">Any course</option>
                      {(courses || []).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Session type">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "one_on_one", label: "1-on-1",  icon: User  },
                        { value: "group",      label: "Group",   icon: Users },
                      ].map(({ value, label, icon: Icon }) => (
                        <button key={value} type="button"
                          onClick={() => setForm({ ...form, session_type: value as any, max_students: value === "one_on_one" ? 1 : 5 })}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                            form.session_type === value
                              ? "border-violet-500 bg-violet-50 text-violet-700"
                              : "border-gray-200 text-gray-600 hover:border-violet-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" /> {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                {/* Date + Duration + Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Date & time" required>
                    <input type="datetime-local" value={form.scheduled_at}
                      onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                      className={inputCls} />
                  </Field>
                  <Field label="Duration (mins)">
                    <select value={form.duration_minutes}
                      onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                      className={inputCls}>
                      {[15, 30, 45, 60, 90, 120].map(m => (
                        <option key={m} value={m}>{m} mins</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Price (₹)">
                    <input type="number" value={form.price} min={0}
                      onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="0 = Free" className={inputCls} />
                  </Field>
                </div>

                {/* Max students (group only) */}
                {form.session_type === "group" && (
                  <Field label="Max students">
                    <input type="number" value={form.max_students} min={2} max={20}
                      onChange={e => setForm({ ...form, max_students: Number(e.target.value) })}
                      className={inputCls + " w-40"} />
                  </Field>
                )}

                {/* Description */}
                <Field label="Description">
                  <textarea value={form.description} rows={3}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What topics will you cover in this session?"
                    className={inputCls + " resize-none"} />
                </Field>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => createSession.mutate(form)}
                    disabled={!form.title || !form.scheduled_at || createSession.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm py-3 transition-colors shadow-sm shadow-violet-200 disabled:opacity-50"
                  >
                    {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {createSession.isPending ? "Creating…" : "Create Session Slot"}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sessions list ───────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
          </div>
        ) : !sessions?.length ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
              <HelpCircle className="h-8 w-8 text-violet-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">No doubt sessions yet</p>
            <p className="text-sm text-gray-500 mb-5">Create a slot to let students book time with you</p>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition-colors">
              <Plus className="h-4 w-4" /> Create your first slot
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: any) => {
              const scheduledDate = new Date(session.scheduled_at);
              const isPast = scheduledDate < new Date();

              return (
                <motion.div key={session.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StatusBadge status={session.status} />
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          session.session_type === "one_on_one"
                            ? "bg-violet-50 text-violet-600 border-violet-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-200"
                        }`}>
                          {session.session_type === "one_on_one"
                            ? <><User className="h-3 w-3" /> 1-on-1</>
                            : <><Users className="h-3 w-3" /> Group</>}
                        </span>
                        {session.course?.title && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                            <BookOpen className="h-3 w-3" />{session.course.title}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{session.title}</h3>
                      {session.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{session.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(session.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {session.duration_minutes} mins
                        </span>
                        <span className={`flex items-center gap-1.5 font-semibold ${session.price === 0 ? "text-green-600" : "text-gray-800"}`}>
                          <DollarSign className="h-3.5 w-3.5" />
                          {session.price === 0 ? "Free" : formatPrice(session.price)}
                        </span>
                        {session.session_type === "group" && (
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {session.spots_left ?? session.max_students} spots left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {session.status === "booked" && (
                        <>
                          <button
                            onClick={() => joinSession.mutate(session.id)}
                            disabled={joinSession.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Join
                          </button>
                          <button
                            onClick={() => endSession.mutate(session.id)}
                            disabled={endSession.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 text-gray-700 hover:text-green-700 text-xs font-bold px-4 py-2.5 transition-colors"
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                            End
                          </button>
                        </>
                      )}
                      {session.status === "available" && (
                        <button
                          onClick={() => { if (confirm("Delete this slot?")) deleteSession.mutate(session.id); }}
                          disabled={deleteSession.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                          {deleteSession.isPending
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      )}
                      {session.status === "completed" && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <CheckSquare className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
