"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { courseApi, teacherApi } from "@/lib/api";
import { useDropzone } from "react-dropzone";
import {
  Upload, CheckCircle, Loader2, X, FileVideo, FileText, Mic,
  ArrowLeft, ArrowRight, BookOpen, Rocket, Sparkles,
  Users, DollarSign, Globe, Layers, Brain, Search, Image as ImageIcon,
  Lightbulb, Tag, Settings, Clock, Shield, Lock, Unlock,
  ChevronRight, Play,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import Link from "next/link";
import { TRANSCRIPTION_LANGS } from "@/lib/transcriptionLangs";

// ── Static data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Mathematics","Physics","Chemistry","Biology","Programming",
  "English","History","Commerce","Data Science","Web Development",
  "System Design","Backend Development","Machine Learning","UI/UX Design",
  "Digital Marketing",
];
const LANGUAGES = ["English","Hindi","Gujarati","Tamil","Telugu","Marathi","Bengali"];
const DELIVERY_MODES = [
  { value: "video_course", label: "Video Course",  desc: "Pre-recorded lessons students watch at their own pace" },
  { value: "live_course",  label: "Live Course",   desc: "Scheduled live sessions with real-time interaction"    },
  { value: "hybrid",       label: "Hybrid",        desc: "Mix of recorded content and live sessions"             },
];
const AI_STEPS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "transcription", label: "Transcribing video / audio",    icon: Mic       },
  { id: "structuring",   label: "Generating chapters & lessons", icon: Layers    },
  { id: "quizzes",       label: "Creating quiz questions",       icon: Brain     },
  { id: "indexing",      label: "Indexing for AI tutor",         icon: Search    },
  { id: "thumbnail",     label: "Generating thumbnail",          icon: ImageIcon },
];

type Section = "info" | "media" | "ai" | "publish";
const STEPS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "info",    label: "Course Info",     icon: BookOpen, desc: "Title, details, pricing" },
  { id: "media",   label: "Upload Media",    icon: Upload,   desc: "Videos, PDFs, audio"     },
  { id: "ai",      label: "AI Processing",   icon: Sparkles, desc: "AI builds your course"   },
  { id: "publish", label: "Review & Publish",icon: Rocket,   desc: "Go live to students"     },
];

// ── Reusable field components ───────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all ${props.className ?? ""}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all ${props.className ?? ""}`}
    />
  );
}
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer ${props.className ?? ""}`}
    >
      {children}
    </select>
  );
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200"}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5.5 translate-x-[22px]" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </label>
  );
}
function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
          <Icon className="h-3.5 w-3.5 text-violet-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CreateCoursePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    teacherApi.onboardingStatus().then(({ data }) => {
      if (cancelled) return;
      if (data.onboarding_status !== "approved") router.replace("/teacher/onboarding");
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [router]);

  const [activeSection, setActiveSection] = useState<Section>("info");
  const [courseId,  setCourseId]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);

  // All CourseCreate fields
  const [info, setInfo] = useState({
    title:                          "",
    short_description:              "",
    description:                    "",
    price:                          "0",
    category:                       "",
    difficulty_level:               "Beginner",
    language:                       "English",
    delivery_mode:                  "video_course",
    tags:                           [] as string[],
    tagInput:                       "",
    certificate_enabled:            true,
    completion_requirement_percent: 80,
    quiz_pass_percent:              60,
    module_lock_enabled:            true,
    default_access_months:          "" as string | "",
    transcript_language:            "",
  });

  const [files,          setFiles]          = useState<File[]>([]);
  const [uploading,      setUploading]      = useState(false);
  const [aiProgress,     setAiProgress]     = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [aiDone,         setAiDone]         = useState(false);

  // Tag helpers
  const addTag = () => {
    const t = info.tagInput.trim().toLowerCase();
    if (t && !info.tags.includes(t) && info.tags.length < 10) {
      setInfo({ ...info, tags: [...info.tags, t], tagInput: "" });
    }
  };
  const removeTag = (tag: string) => setInfo({ ...info, tags: info.tags.filter(x => x !== tag) });

  // Dropzone
  const onDrop = useCallback((accepted: File[]) => setFiles(p => [...p, ...accepted]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4",".mov",".avi",".webm"], "audio/*": [".mp3",".wav",".m4a"], "application/pdf": [".pdf"] },
    maxSize: 2 * 1024 * 1024 * 1024,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <FileVideo className="h-5 w-5 text-violet-500" />;
    if (file.type.startsWith("audio/")) return <Mic className="h-5 w-5 text-emerald-500" />;
    return <FileText className="h-5 w-5 text-rose-500" />;
  };

  const handleSaveDraft = async () => {
    if (!info.title.trim()) { toast({ title: "Add a title first", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (!courseId) {
        const payload = {
          title:                          info.title.trim(),
          short_description:              info.short_description.trim() || undefined,
          description:                    info.description.trim() || undefined,
          price:                          parseFloat(info.price) || 0,
          category:                       info.category || undefined,
          difficulty_level:               info.difficulty_level || undefined,
          language:                       info.language,
          delivery_mode:                  info.delivery_mode,
          tags:                           info.tags.length ? info.tags : undefined,
          certificate_enabled:            info.certificate_enabled,
          completion_requirement_percent: info.completion_requirement_percent,
          quiz_pass_percent:              info.quiz_pass_percent,
          module_lock_enabled:            info.module_lock_enabled,
          default_access_months:          info.default_access_months ? parseInt(info.default_access_months) : undefined,
          transcript_language:            info.transcript_language.trim() || undefined,
        };
        const { data } = await courseApi.create(payload);
        setCourseId(data.id);
        toast({ title: "Draft saved!" });
      }
      setActiveSection("media");
    } catch (e) {
      toast({ title: "Couldn't save draft", description: getApiErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!courseId || files.length === 0) {
      toast({ title: "Save course info first, then upload files", variant: "destructive" });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    try {
      await courseApi.uploadMaterials(courseId, formData);
      setActiveSection("ai");
      pollAIStatus();
    } catch (e) {
      toast({ title: "Upload failed", description: getApiErrorMessage(e), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const pollAIStatus = () => {
    if (!courseId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await courseApi.aiStatus(courseId!);
        const s = data.ai_processing;
        setAiProgress(s.progress_percent || 0);
        setCompletedSteps(s.steps_completed || []);
        if (s.status === "completed") {
          clearInterval(interval);
          setAiProgress(100);
          setAiDone(true);
          setActiveSection("publish");
          toast({ title: "AI has built your course!", description: "Review and publish when ready." });
        } else if (s.status === "failed") {
          clearInterval(interval);
          toast({ title: "AI processing failed", description: data.error || "Check materials and retry.", variant: "destructive" });
        }
      } catch {}
    }, 3000);
  };

  const handlePublish = async () => {
    if (!courseId) return;
    try {
      await courseApi.approveStructure(courseId, { approved: true });
      await courseApi.publish(courseId);
      toast({ title: "Course published!", description: "Your course is now live." });
      router.push(`/teacher/courses/${courseId}/edit`);
    } catch (e) {
      toast({ title: "Publish failed", description: getApiErrorMessage(e), variant: "destructive" });
    }
  };

  const stepStatus = (id: Section) => {
    if (id === "info")    return courseId ? "done" : "active";
    if (id === "media")   return files.length > 0 ? "done" : courseId ? "available" : "locked";
    if (id === "ai")      return aiDone ? "done" : aiProgress > 0 ? "active" : "locked";
    if (id === "publish") return aiDone ? "available" : "locked";
    return "locked";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/teacher/courses"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">New Course</p>
            <p className="text-sm font-bold text-gray-900 max-w-xs truncate">
              {info.title || "Untitled Course"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving || !info.title}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Draft
          </button>
          {aiDone && (
            <button onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-bold text-white transition-colors shadow-sm shadow-violet-200">
              <Rocket className="h-4 w-4" /> Publish
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">Course Studio</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {STEPS.map((s, i) => {
              const status = stepStatus(s.id);
              const active = activeSection === s.id;
              const locked = status === "locked";
              return (
                <button key={s.id} onClick={() => !locked && setActiveSection(s.id)} disabled={locked}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    active   ? "bg-violet-50 border border-violet-200"
                    : locked ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                    status === "done"   ? "bg-green-100"
                    : active           ? "bg-violet-100"
                    : "bg-gray-100"
                  }`}>
                    {status === "done"
                      ? <CheckCircle className="h-4 w-4 text-green-600" />
                      : <span className={`text-xs font-bold ${active ? "text-violet-600" : "text-gray-500"}`}>{i + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${active ? "text-violet-700" : "text-gray-700"}`}>{s.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.desc}</p>
                  </div>
                  {!locked && !active && <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="h-4 w-4 text-violet-600 shrink-0" />
                <p className="text-xs font-bold text-violet-700">Pro tip</p>
              </div>
              <p className="text-xs text-violet-600 leading-relaxed">
                Just record yourself teaching. Our AI handles structuring, quizzes, and even the thumbnail.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

            {/* ══ STEP 1: Course Info ══════════════════════════════════════════ */}
            {activeSection === "info" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Course Information</h1>
                  <p className="text-sm text-gray-500">Fill in the basics. You can always edit these later.</p>
                </div>

                {/* Basic Info */}
                <SectionCard title="Basic Info" icon={BookOpen}>
                  <div>
                    <FieldLabel required>Course title</FieldLabel>
                    <Input value={info.title} onChange={e => setInfo({ ...info, title: e.target.value })}
                      placeholder="e.g., Complete Python for Beginners" />
                  </div>
                  <div>
                    <FieldLabel>Short description</FieldLabel>
                    <Input value={info.short_description}
                      onChange={e => setInfo({ ...info, short_description: e.target.value })}
                      placeholder="One-line hook shown on course cards (max 150 chars)" maxLength={150} />
                    <p className="text-[11px] text-gray-400 mt-1">{info.short_description.length}/150</p>
                  </div>
                  <div>
                    <FieldLabel>Full description</FieldLabel>
                    <Textarea rows={4} value={info.description}
                      onChange={e => setInfo({ ...info, description: e.target.value })}
                      placeholder="Describe what students will learn. AI will enhance this from your uploaded materials…" />
                  </div>
                </SectionCard>

                {/* Course Details */}
                <SectionCard title="Course Details" icon={Settings}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Category</FieldLabel>
                      <Select value={info.category} onChange={e => setInfo({ ...info, category: e.target.value })}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </div>
                    <div>
                      <FieldLabel>Difficulty level</FieldLabel>
                      <Select value={info.difficulty_level}
                        onChange={e => setInfo({ ...info, difficulty_level: e.target.value })}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Course language</FieldLabel>
                      <Select value={info.language} onChange={e => setInfo({ ...info, language: e.target.value })}>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </Select>
                    </div>
                    <div>
                      <FieldLabel>Delivery mode</FieldLabel>
                      <Select value={info.delivery_mode}
                        onChange={e => setInfo({ ...info, delivery_mode: e.target.value })}>
                        {DELIVERY_MODES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </Select>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {DELIVERY_MODES.find(d => d.value === info.delivery_mode)?.desc}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                {/* Tags */}
                <SectionCard title="Tags" icon={Tag}>
                  <div>
                    <FieldLabel>Add up to 10 tags</FieldLabel>
                    <div className="flex gap-2">
                      <Input value={info.tagInput} onChange={e => setInfo({ ...info, tagInput: e.target.value })}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Type a tag and press Enter" className="flex-1" />
                      <button type="button" onClick={addTag}
                        className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
                        Add
                      </button>
                    </div>
                    {info.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {info.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-semibold text-violet-700">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* Pricing & Access */}
                <SectionCard title="Pricing & Access" icon={DollarSign}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Price (₹)</FieldLabel>
                      <Input type="number" value={info.price} min="0"
                        onChange={e => setInfo({ ...info, price: e.target.value })}
                        placeholder="0 = Free" />
                      <p className="text-[11px] text-gray-400 mt-1">Set to 0 for a free course</p>
                    </div>
                    <div>
                      <FieldLabel>Access duration (months)</FieldLabel>
                      <Input type="number" value={info.default_access_months} min="1"
                        onChange={e => setInfo({ ...info, default_access_months: e.target.value })}
                        placeholder="Leave blank for lifetime access" />
                      <p className="text-[11px] text-gray-400 mt-1">Blank = lifetime access</p>
                    </div>
                  </div>
                  <Toggle checked={info.certificate_enabled}
                    onChange={v => setInfo({ ...info, certificate_enabled: v })}
                    label="Issue certificate on completion" />
                </SectionCard>

                {/* Learning Settings */}
                <SectionCard title="Learning Settings" icon={Shield}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Completion requirement (%)</FieldLabel>
                      <Input type="number" value={info.completion_requirement_percent} min="1" max="100"
                        onChange={e => setInfo({ ...info, completion_requirement_percent: parseInt(e.target.value) || 80 })} />
                      <p className="text-[11px] text-gray-400 mt-1">Minimum % of lessons to complete</p>
                    </div>
                    <div>
                      <FieldLabel>Quiz pass percent (%)</FieldLabel>
                      <Input type="number" value={info.quiz_pass_percent} min="1" max="100"
                        onChange={e => setInfo({ ...info, quiz_pass_percent: parseInt(e.target.value) || 60 })} />
                      <p className="text-[11px] text-gray-400 mt-1">Minimum score to pass a quiz</p>
                    </div>
                  </div>
                  <Toggle checked={info.module_lock_enabled}
                    onChange={v => setInfo({ ...info, module_lock_enabled: v })}
                    label="Lock modules until previous is completed" />
                </SectionCard>

                {/* AI Transcription */}
                <SectionCard title="AI Transcription" icon={Mic}>
                  <div>
                    <FieldLabel>Transcription language</FieldLabel>
                    <p className="text-xs text-gray-400 mb-2">
                      Used by Whisper AI when transcribing your uploaded video/audio. Leave as "Auto-detect" if unsure.
                    </p>
                    <Select value={info.transcript_language}
                      onChange={e => setInfo({ ...info, transcript_language: e.target.value })}>
                      {TRANSCRIPTION_LANGS.map(l => (
                        <option key={l.value || "auto"} value={l.value}>{l.label}</option>
                      ))}
                    </Select>
                  </div>
                </SectionCard>

                {/* CTA */}
                <button onClick={handleSaveDraft} disabled={saving || !info.title}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3.5 transition-colors shadow-md shadow-violet-200 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save & Continue <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* ══ STEP 2: Upload Media ═════════════════════════════════════════ */}
            {activeSection === "media" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Upload Materials</h1>
                  <p className="text-sm text-gray-500">Add your lecture videos, PDFs, or audio recordings. AI does the rest.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div {...getRootProps()}
                    className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                      isDragActive ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-gray-50 hover:border-violet-400 hover:bg-violet-50/40"
                    }`}>
                    <input {...getInputProps()} />
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                      <Upload className="h-6 w-6 text-violet-600" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">
                      {isDragActive ? "Drop files here" : "Drag & drop your files"}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      or <span className="text-violet-600 font-semibold underline">click to browse</span>
                    </p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {["Video (.mp4, .mov)", "Audio (.mp3, .wav)", "PDF"].map(t => (
                        <span key={t} className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">{t}</span>
                      ))}
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <p className="text-sm font-semibold text-gray-700">Files to upload ({files.length})</p>
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 shrink-0">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={handleUpload} disabled={files.length === 0 || uploading || !courseId}
                    className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3.5 transition-colors shadow-md shadow-violet-200 disabled:opacity-50">
                    {uploading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                      : <><Sparkles className="h-4 w-4" /> Start AI Processing</>}
                  </button>
                </div>
              </>
            )}

            {/* ══ STEP 3: AI Processing ════════════════════════════════════════ */}
            {activeSection === "ai" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">AI is Building Your Course</h1>
                  <p className="text-sm text-gray-500">This takes a few minutes. Grab a coffee ☕</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  {/* Overall progress */}
                  <div className="mb-7">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                      <span className="text-sm font-bold text-violet-600">{aiProgress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-violet-600 rounded-full transition-all duration-700"
                        style={{ width: `${aiProgress}%` }} />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2.5">
                    {AI_STEPS.map((s, idx) => {
                      const done    = completedSteps.includes(s.id);
                      const current = !done && completedSteps.length === idx;
                      return (
                        <div key={s.id} className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                          current ? "border-violet-200 bg-violet-50"
                          : done  ? "border-green-100 bg-green-50/50"
                          : "border-gray-100 bg-gray-50 opacity-50"
                        }`}>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                            done ? "bg-green-100" : current ? "bg-violet-100" : "bg-gray-100"
                          }`}>
                            {done
                              ? <CheckCircle className="h-5 w-5 text-green-600" />
                              : <s.icon className={`h-5 w-5 ${current ? "text-violet-600" : "text-gray-400"}`} />}
                          </div>
                          <span className={`flex-1 text-sm font-semibold ${done ? "text-green-700" : current ? "text-violet-700" : "text-gray-500"}`}>
                            {s.label}
                          </span>
                          {current && <Loader2 className="h-4 w-4 animate-spin text-violet-500 shrink-0" />}
                          {done    && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {aiDone && (
                    <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-5 text-center">
                      <p className="font-bold text-green-700 mb-3">Course is Ready!</p>
                      <button onClick={() => setActiveSection("publish")}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-6 py-2.5 transition-colors">
                        Review & Publish <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ══ STEP 4: Publish ══════════════════════════════════════════════ */}
            {activeSection === "publish" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Ready to Publish</h1>
                  <p className="text-sm text-gray-500">Review the AI-generated content, then launch to students.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Course Summary</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "Title",        value: info.title || "–",                                  bg: "bg-violet-50 border-violet-100" },
                      { label: "Category",     value: info.category || "Not set",                         bg: "bg-blue-50 border-blue-100"     },
                      { label: "Price",        value: info.price === "0" ? "Free" : `₹${info.price}`,     bg: "bg-green-50 border-green-100"   },
                      { label: "Difficulty",   value: info.difficulty_level,                              bg: "bg-amber-50 border-amber-100"   },
                      { label: "Language",     value: info.language,                                      bg: "bg-gray-50 border-gray-200"     },
                      { label: "Delivery",     value: DELIVERY_MODES.find(d => d.value === info.delivery_mode)?.label ?? "–", bg: "bg-pink-50 border-pink-100" },
                      { label: "Certificate",  value: info.certificate_enabled ? "Yes" : "No",            bg: "bg-gray-50 border-gray-200"     },
                      { label: "Access",       value: info.default_access_months ? `${info.default_access_months} months` : "Lifetime", bg: "bg-gray-50 border-gray-200" },
                    ].map(item => (
                      <div key={item.label} className={`rounded-xl border ${item.bg} p-4`}>
                        <p className="text-[11px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {info.tags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {info.tags.map(t => (
                          <span key={t} className="rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                    <button onClick={() => courseId && router.push(`/teacher/courses/${courseId}/edit`)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 transition-colors">
                      Review & Edit Details
                    </button>
                    <button onClick={handlePublish}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3.5 transition-colors shadow-md shadow-violet-200">
                      <Rocket className="h-4 w-4" /> Publish Now
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
