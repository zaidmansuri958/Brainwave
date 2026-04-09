"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { courseApi, teacherApi } from "@/lib/api";
import { useDropzone } from "react-dropzone";
import {
  Upload, CheckCircle, Loader2, X, FileVideo, FileText, Mic,
  ArrowLeft, BookOpen, Rocket, Sparkles, ChevronRight,
  Users, DollarSign, Globe, Layers, Brain, Search, Image, Lightbulb,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { TRANSCRIPTION_LANGS } from "@/lib/transcriptionLangs";

const CATEGORIES = [
  "Mathematics","Physics","Chemistry","Biology","Programming",
  "English","History","Commerce","Data Science","Web Development",
];
const LANGUAGES = ["English","Hindi","Gujarati","Tamil","Telugu","Marathi","Bengali"];
const AI_STEPS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "transcription", label: "Transcribing video/audio",     icon: Mic    },
  { id: "structuring",   label: "Generating chapters & lessons", icon: Layers },
  { id: "quizzes",       label: "Creating quiz questions",       icon: Brain  },
  { id: "indexing",      label: "Indexing for AI tutor",         icon: Search },
  { id: "thumbnail",     label: "Generating thumbnail",          icon: Image  },
];

type Section = "info" | "media" | "ai" | "publish";

const sidebarSections: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "info",    label: "Course Info",    icon: BookOpen,  description: "Title, description, pricing" },
  { id: "media",   label: "Upload Media",   icon: Upload,    description: "Videos, PDFs, audio files" },
  { id: "ai",      label: "AI Processing",  icon: Sparkles,  description: "Watch AI build your course" },
  { id: "publish", label: "Review & Publish", icon: Rocket,  description: "Go live to students" },
];

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400";

export default function CreateCoursePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    teacherApi
      .onboardingStatus()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.onboarding_status !== "approved") {
          router.replace("/teacher/onboarding");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  const [activeSection, setActiveSection] = useState<Section>("info");
  const [courseId,   setCourseId]   = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);

  const [info, setInfo] = useState({
    title:            "",
    description:      "",
    price:            "0",
    category:         "",
    difficulty_level: "beginner",
    language:         "English",
    transcript_language: "",
  });

  const [files,          setFiles]          = useState<File[]>([]);
  const [uploading,      setUploading]      = useState(false);
  const [aiProgress,     setAiProgress]     = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [aiDone,         setAiDone]         = useState(false);

  // Dropzone
  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*":         [".mp4",".mov",".avi",".webm"],
      "audio/*":         [".mp3",".wav",".m4a"],
      "application/pdf": [".pdf"],
    },
    maxSize: 2 * 1024 * 1024 * 1024,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <FileVideo className="h-5 w-5 text-indigo-500" />;
    if (file.type.startsWith("audio/")) return <Mic className="h-5 w-5 text-emerald-500" />;
    return <FileText className="h-5 w-5 text-rose-500" />;
  };

  const handleSaveDraft = async () => {
    if (!info.title) { toast({ title: "Add a title first", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (!courseId) {
        const { data } = await courseApi.create({
          ...info,
          price: parseFloat(info.price),
          transcript_language: info.transcript_language.trim() || undefined,
        });
        setCourseId(data.id);
        setCourseSlug(data.slug);
        toast({ title: "Draft saved" });
      }
      setActiveSection("media");
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
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
    files.forEach((f) => formData.append("files", f));
    try {
      await courseApi.uploadMaterials(courseId, formData);
      setActiveSection("ai");
      pollAIStatus();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const pollAIStatus = async () => {
    if (!courseId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await courseApi.aiStatus(courseId);
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
          toast({
            title: "AI processing failed",
            description: data.error || "Check materials and retry.",
            variant: "destructive",
          });
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
    } catch {
      toast({ title: "Publish failed", variant: "destructive" });
    }
  };

  const sectionStatus = (id: Section) => {
    if (id === "info")    return courseId ? "done" : "current";
    if (id === "media")   return uploading ? "current" : files.length > 0 ? "done" : courseId ? "available" : "locked";
    if (id === "ai")      return aiDone ? "done" : aiProgress > 0 ? "current" : "locked";
    if (id === "publish") return aiDone ? "available" : "locked";
    return "locked";
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Studio topbar */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/teacher/courses" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            My courses
          </Link>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">
              {info.title || "Untitled course"}
            </span>
            {courseId && (
              <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                Draft
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={saving || !info.title}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save draft"}
          </button>
          {aiDone && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-button-indigo flex items-center gap-1.5"
            >
              <Rocket className="w-4 h-4" />
              Publish course
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Studio</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarSections.map((s, i) => {
              const Icon   = s.icon;
              const status = sectionStatus(s.id);
              const active = activeSection === s.id;
              const locked = status === "locked";
              return (
                <button
                  key={s.id}
                  onClick={() => !locked && setActiveSection(s.id)}
                  disabled={locked}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    active
                      ? "bg-indigo-50 border border-indigo-100"
                      : locked
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Step number / status */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    status === "done"    ? "bg-emerald-100 text-emerald-600"
                    : active            ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                    {status === "done" ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-indigo-700" : "text-gray-900"}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{s.description}</p>
                  </div>
                  {!locked && !active && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar tip */}
          <div className="p-4 border-t border-gray-50">
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />Pro tip</p>
              <p className="text-xs text-indigo-600 leading-relaxed">
                Just record yourself teaching. Our AI handles structuring, quizzes, and even the thumbnail.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">

            {/* ── Section: Info ── */}
            {activeSection === "info" && (
              <div>
                <div className="mb-8">
                  <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Course information</h1>
                  <p className="text-gray-500 text-sm">The basics. Fill this in, then upload your materials.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Course title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={info.title}
                      onChange={(e) => setInfo({ ...info, title: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., Complete Physics for JEE Advanced"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={info.description}
                      onChange={(e) => setInfo({ ...info, description: e.target.value })}
                      rows={4}
                      className={inputClass + " resize-none"}
                      placeholder="Describe what students will learn. AI will enhance this from your uploaded materials…"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <DollarSign className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-400" />
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={info.price}
                        onChange={(e) => setInfo({ ...info, price: e.target.value })}
                        min="0"
                        className={inputClass}
                        placeholder="0 = Free"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        <BookOpen className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-400" />
                        Category
                      </label>
                      <select
                        value={info.category}
                        onChange={(e) => setInfo({ ...info, category: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <Users className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-400" />
                        Difficulty level
                      </label>
                      <select
                        value={info.difficulty_level}
                        onChange={(e) => setInfo({ ...info, difficulty_level: e.target.value })}
                        className={inputClass}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Globe className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-400" />
                        Language
                      </label>
                      <select
                        value={info.language}
                        onChange={(e) => setInfo({ ...info, language: e.target.value })}
                        className={inputClass}
                      >
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Mic className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-400" />
                      Transcription language
                    </label>
                    <p className="text-xs text-gray-500 mb-1.5">
                      Used only for Whisper when transcribing your video/audio. Course UI stays in your chosen language above.
                    </p>
                    <select
                      value={info.transcript_language}
                      onChange={(e) => setInfo({ ...info, transcript_language: e.target.value })}
                      className={inputClass}
                    >
                      {TRANSCRIPTION_LANGS.map((l) => (
                        <option key={l.value || "auto"} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving || !info.title}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-button-indigo flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save & continue to upload →
                  </button>
                </div>
              </div>
            )}

            {/* ── Section: Media ── */}
            {activeSection === "media" && (
              <div>
                <div className="mb-8">
                  <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Upload course materials</h1>
                  <p className="text-gray-500 text-sm">Add your lecture videos, PDFs, or audio recordings. AI does the rest.</p>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 bg-white"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-gray-800 font-semibold text-base mb-1">
                    {isDragActive ? "Drop files here" : "Drag & drop your files here"}
                  </p>
                  <p className="text-gray-400 text-sm">or <span className="text-indigo-600 font-medium">click to browse</span></p>
                  <p className="text-gray-300 text-xs mt-3">
                    Video: MP4, MOV, AVI, WebM (max 30 minutes, 2GB). Audio: MP3, WAV, M4A. Documents: PDF.
                    Server also accepts Word/PPT uploads when encoded as doc/ppt MIME types.
                  </p>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl shadow-card">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tip */}
                <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Just record yourself teaching</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      Even a phone recording works. AI will transcribe, create chapters, write quizzes, and build a beautiful course automatically.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || uploading || !courseId}
                  className="w-full mt-5 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-button-indigo flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Upload & start AI processing</>
                  )}
                </button>
              </div>
            )}

            {/* ── Section: AI Processing ── */}
            {activeSection === "ai" && (
              <div>
                <div className="mb-8">
                  <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">AI is building your course</h1>
                  <p className="text-gray-500 text-sm">This takes 5–10 minutes. You'll get an email when it's ready.</p>
                </div>

                {/* Overall progress */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Overall progress</span>
                    <span className="text-sm font-bold text-indigo-600">{aiProgress}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                </div>

                {/* Step checklist */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-3">
                  {AI_STEPS.map((s, idx) => {
                    const done    = completedSteps.includes(s.id);
                    const current = !done && completedSteps.length === idx;
                    return (
                      <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                        current ? "bg-indigo-50" : ""
                      }`}>
                        <s.icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className={`flex-1 text-sm ${
                          done ? "text-gray-400 line-through" : current ? "text-indigo-700 font-medium" : "text-gray-500"
                        }`}>
                          {s.label}
                        </span>
                        {done ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        ) : current ? (
                          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {aiDone && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <p className="text-emerald-700 font-semibold">Done! Your course is ready to review.</p>
                    <button
                      onClick={() => setActiveSection("publish")}
                      className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Continue to publish →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Section: Publish ── */}
            {activeSection === "publish" && (
              <div>
                <div className="mb-8">
                  <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Ready to go live?</h1>
                  <p className="text-gray-500 text-sm">Review the AI-generated content, then publish to 50,000+ students.</p>
                </div>

                {/* Summary card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Course summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Title",      value: info.title || "–" },
                      { label: "Category",   value: info.category || "Not set" },
                      { label: "Price",      value: info.price === "0" ? "Free" : `₹${info.price}` },
                      { label: "Level",      value: info.difficulty_level },
                      { label: "Language",   value: info.language },
                      { label: "Files",      value: `${files.length} uploaded` },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => courseId && router.push(`/teacher/courses/${courseId}/edit`)}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  >
                    Review & edit AI-generated structure
                  </button>
                  <button
                    onClick={handlePublish}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-button-indigo flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Publish course now
                  </button>
                </div>

                <p className="text-xs text-center text-gray-400 mt-4">
                  You can unpublish or edit your course at any time after publishing.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Right panel: live preview */}
        <aside className="w-72 bg-white border-l border-gray-100 hidden xl:flex flex-col">
          <div className="p-5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live preview</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {/* Course preview card */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden mb-5">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-indigo-300" />
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                  {info.title || "Your course title"}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {info.category || "Category"} · {info.difficulty_level}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">
                    {info.price === "0" ? "Free" : info.price ? `₹${info.price}` : "₹0"}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    Enroll
                  </span>
                </div>
              </div>
            </div>

            {/* Status panel */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</p>
              {sidebarSections.map((s) => {
                const status = sectionStatus(s.id);
                return (
                  <div key={s.id} className="flex items-center gap-2.5 py-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      status === "done"    ? "bg-emerald-500"
                      : status === "current" ? "bg-indigo-500 animate-pulse"
                      : "bg-gray-200"
                    }`} />
                    <span className={`text-xs ${
                      status === "done"    ? "text-gray-500 line-through"
                      : status === "current" ? "text-indigo-700 font-medium"
                      : "text-gray-400"
                    }`}>
                      {s.label}
                    </span>
                    {status === "done" && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
