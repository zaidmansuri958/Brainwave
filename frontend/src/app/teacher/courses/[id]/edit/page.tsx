"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi, courseApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, Eye, BookOpen, Settings, DollarSign,
  Shield, Tag, CheckSquare, Mic, Plus, X, Check,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { TRANSCRIPTION_LANGS } from "@/lib/transcriptionLangs";

// ── Static lists ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Mathematics","Physics","Chemistry","Biology","Programming","English","History",
  "Commerce","Data Science","Web Development","System Design","Backend Development",
  "Machine Learning","UI/UX Design","Digital Marketing",
];
const LANGUAGES    = ["English","Hindi","Gujarati","Tamil","Telugu","Marathi","Bengali"];
const DELIVERY_MODES = [
  { value: "video_course",     label: "Video Course",  desc: "Pre-recorded lessons at own pace"      },
  { value: "live_course",      label: "Live Course",   desc: "Scheduled live sessions"                },
  { value: "hybrid",           label: "Hybrid",        desc: "Mix of recorded and live"               },
  { value: "materials_only",   label: "Materials Only",desc: "PDFs and documents only"                },
];

// ── Shared input styles ─────────────────────────────────────────────────────────
const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
          <Icon className="h-3.5 w-3.5 text-violet-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </label>
  );
}

function ListBuilder({
  items, onAdd, onRemove, placeholder, inputValue, onInputChange, chipStyle = "default",
}: {
  items: string[]; onAdd: () => void; onRemove: (i: number) => void;
  placeholder: string; inputValue: string; onInputChange: (v: string) => void;
  chipStyle?: "default" | "violet";
}) {
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={inputValue} onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder} className={`${inputCls} flex-1`} />
        <button type="button" onClick={onAdd}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shrink-0">
          Add
        </button>
      </div>
      {items.length > 0 && (
        chipStyle === "violet" ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-semibold text-violet-700">
                {item}
                <button type="button" onClick={() => onRemove(i)} className="hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                <Check className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{item}</span>
                <button type="button" onClick={() => onRemove(i)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title:                          "",
    short_description:              "",
    description:                    "",
    price:                          0,
    level:                          "Beginner",
    category:                       "",
    language:                       "English",
    delivery_mode:                  "video_course",
    default_access_months:          "",
    certificate_enabled:            true,
    completion_requirement_percent: 80,
    quiz_pass_percent:              60,
    module_lock_enabled:            true,
    transcript_language:            "",
    what_you_will_learn:            [] as string[],
    prerequisites:                  [] as string[],
    tags:                           [] as string[],
  });

  const [newLearning, setNewLearning] = useState("");
  const [newPrereq,   setNewPrereq]   = useState("");
  const [newTag,      setNewTag]      = useState("");

  const { data: course, isLoading } = useQuery({
    queryKey: ["teacher-course", params.id],
    queryFn:  () => teacherApi.getCourse(params.id).then(r => r.data),
  });

  useEffect(() => {
    if (!course) return;
    setForm({
      title:                          course.title || "",
      short_description:              course.short_description || "",
      description:                    course.description || "",
      price:                          course.price || 0,
      level:                          course.difficulty_level || course.level || "Beginner",
      category:                       course.category || "",
      language:                       course.language || "English",
      delivery_mode:                  course.delivery_mode || "video_course",
      default_access_months:          course.default_access_months != null ? String(course.default_access_months) : "",
      certificate_enabled:            course.certificate_enabled !== false,
      completion_requirement_percent: course.completion_requirement_percent ?? 80,
      quiz_pass_percent:              course.quiz_pass_percent ?? 60,
      module_lock_enabled:            course.module_lock_enabled !== false,
      transcript_language:            course.transcript_language != null ? String(course.transcript_language) : "",
      what_you_will_learn:            course.what_you_will_learn || [],
      prerequisites:                  course.prerequisites || [],
      tags:                           course.tags || [],
    });
  }, [course]);

  const updateCourse = useMutation({
    mutationFn: () => {
      const { level, default_access_months: accStr, transcript_language: tl, ...rest } = form;
      return teacherApi.updateCourse(params.id, {
        ...rest,
        difficulty_level:              level,
        default_access_months:         accStr.trim() === "" ? null : Number(accStr),
        transcript_language:           tl.trim() === "" ? null : tl.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-course", params.id] });
      toast({ title: "Course updated successfully!" });
    },
    onError: e => toast({ title: "Couldn't update", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const publishCourse = useMutation({
    mutationFn: () => courseApi.publish(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-course", params.id] });
      toast({ title: "Course published!" });
    },
    onError: e => toast({ title: "Couldn't publish", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  const addToList = (field: "what_you_will_learn" | "prerequisites" | "tags", val: string, clear: (v: string) => void) => {
    if (!val.trim()) return;
    setForm(p => ({ ...p, [field]: [...p[field], val.trim()] }));
    clear("");
  };
  const removeFromList = (field: "what_you_will_learn" | "prerequisites" | "tags", i: number) =>
    setForm(p => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Course" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "My Courses", href: "/teacher/courses" }, { label: "Edit" }]}>
        <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
      </DashboardLayout>
    );
  }

  const statusColor = course?.status === "published" ? "text-green-600 bg-green-50 border-green-200"
    : course?.status === "draft" ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-gray-600 bg-gray-100 border-gray-200";

  return (
    <DashboardLayout
      title={course?.title || "Edit Course"}
      subtitle="Update course details, curriculum and settings"
      breadcrumbs={[
        { label: "Teacher",     href: "/teacher/dashboard"  },
        { label: "My Courses",  href: "/teacher/courses"    },
        { label: "Edit"                                      },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusColor}`}>
            {course?.status}
          </span>
          {course?.status !== "published" && (
            <button onClick={() => publishCourse.mutate()} disabled={publishCourse.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-sm px-4 py-2 transition-colors disabled:opacity-50">
              {publishCourse.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              Publish
            </button>
          )}
          <button form="edit-form" type="submit" disabled={updateCourse.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-4 py-2 transition-colors shadow-sm shadow-violet-200 disabled:opacity-50">
            {updateCourse.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="max-w-3xl py-6">
        <CourseManageNav courseId={params.id} />

        <form id="edit-form" onSubmit={e => { e.preventDefault(); updateCourse.mutate(); }} className="space-y-5">

          {/* Basic Info */}
          <SectionCard icon={BookOpen} title="Basic Information">
            <div>
              <FieldLabel required>Course title</FieldLabel>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                placeholder="e.g., Complete Python for Beginners" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Short description</FieldLabel>
              <input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })}
                placeholder="One-line hook shown on course cards (max 150 chars)" maxLength={150} className={inputCls} />
              <p className="text-[11px] text-gray-400 mt-1">{form.short_description.length}/150</p>
            </div>
            <div>
              <FieldLabel>Full description</FieldLabel>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4} placeholder="Describe what students will learn..."
                className={`${inputCls} resize-none`} />
            </div>
          </SectionCard>

          {/* Course Details */}
          <SectionCard icon={Settings} title="Course Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Category</FieldLabel>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Difficulty level</FieldLabel>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={inputCls}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Language</FieldLabel>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className={inputCls}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Delivery mode</FieldLabel>
                <select value={form.delivery_mode} onChange={e => setForm({ ...form, delivery_mode: e.target.value })} className={inputCls}>
                  {DELIVERY_MODES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {DELIVERY_MODES.find(d => d.value === form.delivery_mode)?.desc}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Pricing & Access */}
          <SectionCard icon={DollarSign} title="Pricing & Access">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Price (₹)</FieldLabel>
                <input type="number" value={form.price} min={0}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="0 = Free" className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">Set to 0 for a free course</p>
              </div>
              <div>
                <FieldLabel>Access duration (months)</FieldLabel>
                <input type="number" value={form.default_access_months} min={1}
                  onChange={e => setForm({ ...form, default_access_months: e.target.value })}
                  placeholder="Blank = lifetime access" className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">Blank = lifetime access</p>
              </div>
            </div>
            <Toggle checked={form.certificate_enabled}
              onChange={v => setForm({ ...form, certificate_enabled: v })}
              label="Issue certificate on completion" />
          </SectionCard>

          {/* Learning Settings */}
          <SectionCard icon={Shield} title="Learning Settings">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Completion requirement (%)</FieldLabel>
                <input type="number" value={form.completion_requirement_percent} min={1} max={100}
                  onChange={e => setForm({ ...form, completion_requirement_percent: parseInt(e.target.value) || 80 })}
                  className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">Minimum % of lessons to complete</p>
              </div>
              <div>
                <FieldLabel>Quiz pass percent (%)</FieldLabel>
                <input type="number" value={form.quiz_pass_percent} min={1} max={100}
                  onChange={e => setForm({ ...form, quiz_pass_percent: parseInt(e.target.value) || 60 })}
                  className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">Minimum score to pass a quiz</p>
              </div>
            </div>
            <Toggle checked={form.module_lock_enabled}
              onChange={v => setForm({ ...form, module_lock_enabled: v })}
              label="Lock modules until previous is completed" />
          </SectionCard>

          {/* Tags */}
          <SectionCard icon={Tag} title="Tags">
            <ListBuilder items={form.tags} chipStyle="violet"
              onAdd={() => addToList("tags", newTag, setNewTag)}
              onRemove={i => removeFromList("tags", i)}
              placeholder="Type a tag and press Enter or Add"
              inputValue={newTag} onInputChange={setNewTag} />
          </SectionCard>

          {/* What Students Will Learn */}
          <SectionCard icon={CheckSquare} title="What Students Will Learn">
            <ListBuilder items={form.what_you_will_learn}
              onAdd={() => addToList("what_you_will_learn", newLearning, setNewLearning)}
              onRemove={i => removeFromList("what_you_will_learn", i)}
              placeholder="Add a learning outcome and press Enter"
              inputValue={newLearning} onInputChange={setNewLearning} />
          </SectionCard>

          {/* Prerequisites */}
          <SectionCard icon={BookOpen} title="Prerequisites">
            <ListBuilder items={form.prerequisites}
              onAdd={() => addToList("prerequisites", newPrereq, setNewPrereq)}
              onRemove={i => removeFromList("prerequisites", i)}
              placeholder="Add a prerequisite and press Enter"
              inputValue={newPrereq} onInputChange={setNewPrereq} />
          </SectionCard>

          {/* AI Transcription */}
          <SectionCard icon={Mic} title="AI Transcription Language">
            <div>
              <p className="text-xs text-gray-400 mb-2">
                Used by Whisper AI when transcribing uploaded video/audio. Leave as "Auto-detect" if unsure.
              </p>
              <select value={form.transcript_language}
                onChange={e => setForm({ ...form, transcript_language: e.target.value })} className={inputCls}>
                {TRANSCRIPTION_LANGS.map(l => (
                  <option key={l.value || "auto"} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* Sticky save bar (mobile) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-lg">
            <button form="edit-form" type="submit" disabled={updateCourse.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 transition-colors disabled:opacity-50">
              {updateCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
