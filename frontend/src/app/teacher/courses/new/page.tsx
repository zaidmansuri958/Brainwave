"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { courseApi, teacherApi } from "@/lib/api";
import { useDropzone } from "react-dropzone";
import {
  Upload, CheckCircle, Loader2, X, FileVideo, FileText, Mic,
  ArrowLeft, ArrowRight, BookOpen, Rocket, Sparkles, ChevronRight,
  Users, DollarSign, Globe, Layers, Brain, Search, Image, Lightbulb,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
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

const labelClass = "mb-1.5 block text-sm font-extrabold uppercase text-gray-700";
const inputClass = "w-full bg-white px-4 py-3 text-sm text-gray-900";

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
        toast({ title: "Draft saved" });
      }
      setActiveSection("media");
    } catch (e) {
      toast({
        title: "Couldn't save draft",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
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
    } catch (e) {
      toast({
        title: "Upload failed",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
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
    } catch (e) {
      toast({
        title: "Publish failed",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
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
    <div className="bw-page min-h-screen flex flex-col">
      {/* Studio topbar */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-4 border-black bg-yellow-300 px-6 shadow-[0_4px_0_#111111]">
        <div className="flex items-center gap-4">
          <Link href="/teacher/courses" className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md">
            <ArrowLeft className="h-6 w-6 text-black" strokeWidth={3} />
          </Link>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-black/70">
              New Course
            </span>
            <span className="text-xl  uppercase tracking-tight text-gray-900 truncate max-w-xs sm:max-w-md">
              {info.title || "Untitled Course"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveDraft}
            disabled={saving || !info.title}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:bg-blue-100 hover:shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : "Save Draft"}
          </button>
          {aiDone && (
            <button
              onClick={handlePublish}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md"
            >
              <Rocket className="h-5 w-5" strokeWidth={3} />
              Publish
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className="flex w-72 flex-shrink-0 flex-col border-r-4 border-black bg-white">
          <div className="border-b-4 border-black p-6 bg-amber-50">
            <p className="text-xl  uppercase tracking-tight text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-black" strokeWidth={3} />
              Course Studio
            </p>
          </div>
          <nav className="flex-1 p-4 space-y-4">
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
                  className={`w-full flex items-start gap-4 px-4 py-4 rounded-xl border-4 text-left transition-all ${
                    active
                      ? "border-black bg-blue-100 shadow-sm"
                      : locked
                      ? "border-transparent opacity-50 cursor-not-allowed"
                      : "border-transparent hover:border-black hover:bg-slate-50 hover:shadow-sm"
                  }`}
                >
                  {/* Step number / status */}
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border-4 flex-shrink-0 ${
                    status === "done"    ? "border-black bg-green-100"
                    : active            ? "border-black bg-white"
                    : "border-black bg-white"
                  }`}>
                    {status === "done" ? <CheckCircle className="h-4 w-4 text-black" strokeWidth={3} /> : <span className="text-sm ">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base  uppercase tracking-tight truncate ${active ? "text-black" : "text-gray-900"}`}>
                      {s.label}
                    </p>
                    <p className="text-xs font-bold text-gray-700 leading-snug mt-1 truncate">{s.description}</p>
                  </div>
                  {!locked && !active && <ChevronRight className="h-5 w-5 text-black flex-shrink-0 mt-1" strokeWidth={3} />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar tip */}
          <div className="p-4 border-t-4 border-black">
            <div className="rounded-xl border border-gray-200 bg-yellow-300 p-5 shadow-sm">
              <p className="text-sm font-semibold text-black mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5" strokeWidth={3} />Pro tip</p>
              <p className="text-xs font-bold text-black/80 leading-relaxed">
                Just record yourself teaching. Our AI handles structuring, quizzes, and even the thumbnail.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-8 py-12">

            {/* ── Section: Info ── */}
            {activeSection === "info" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                  <h1 className="  text-4xl uppercase tracking-tight text-gray-900 mb-3 border-b-4 border-black pb-2 inline-block">Course Information</h1>
                  <p className="text-gray-600 font-bold text-base">The basics. Fill this in, then upload your materials.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">Course title <span className="text-orange-500">*</span></label>
                    <input
                      type="text"
                      value={info.title}
                      onChange={(e) => setInfo({ ...info, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                      placeholder="e.g., Complete Physics for JEE Advanced"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">Description</label>
                    <textarea
                      value={info.description}
                      onChange={(e) => setInfo({ ...info, description: e.target.value })}
                      rows={4}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                      placeholder="Describe what students will learn. AI will enhance this from your uploaded materials…"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={info.price}
                        onChange={(e) => setInfo({ ...info, price: e.target.value })}
                        min="0"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                        placeholder="0 = Free"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Category
                      </label>
                      <select
                        value={info.category}
                        onChange={(e) => setInfo({ ...info, category: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none cursor-pointer focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Difficulty level
                      </label>
                      <select
                        value={info.difficulty_level}
                        onChange={(e) => setInfo({ ...info, difficulty_level: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none cursor-pointer focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Language
                      </label>
                      <select
                        value={info.language}
                        onChange={(e) => setInfo({ ...info, language: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none cursor-pointer focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                      >
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="border-t-4 border-black pt-6 mt-6">
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      Transcription language
                    </label>
                    <p className="text-xs font-bold text-gray-500 mb-3">
                      Used only for Whisper when transcribing your video/audio. Course UI stays in your chosen language above.
                    </p>
                    <select
                      value={info.transcript_language}
                      onChange={(e) => setInfo({ ...info, transcript_language: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none cursor-pointer focus:shadow-[6px_6px_0_#ff6b00]"
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
                    className="w-full mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-orange-500 px-8 py-5 text-lg font-semibold text-white shadow-md transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} />}
                    Save & Continue
                    <ArrowRight className="h-6 w-6" strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Section: Media ── */}
            {activeSection === "media" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                  <h1 className="  text-4xl uppercase tracking-tight text-gray-900 mb-3 border-b-4 border-black pb-2 inline-block">Upload Materials</h1>
                  <p className="text-gray-600 font-bold text-base">Add your lecture videos, PDFs, or audio recordings. AI does the rest.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
                  {/* Dropzone */}
                  <div
                    {...getRootProps()}
                    className={`rounded-xl border-4 border-dashed p-12 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-[#ff6b00] bg-amber-50"
                        : "border-black bg-gray-50 hover:border-[#ff6b00] hover:bg-white"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                      <Upload className="h-8 w-8 text-black" strokeWidth={3} />
                    </div>
                    <p className=" text-2xl  uppercase tracking-tight text-gray-900 mb-2">
                      {isDragActive ? "Drop files here" : "Drag & drop files"}
                    </p>
                    <p className="text-sm font-bold text-gray-500 mb-6">or <span className="text-orange-500 underline">click to browse</span></p>
                    <div className="inline-block rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 ">
                      Video, Audio, PDF supported
                    </div>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-4">Files to upload</h3>
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-amber-50 p-4 shadow-sm">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white  flex-shrink-0">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base  uppercase tracking-tight text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm font-bold text-gray-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          <button
                            onClick={() => setFiles(files.filter((_, j) => j !== i))}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-black hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <X className="h-5 w-5" strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading || !courseId}
                    className="w-full mt-10 inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-blue-100 px-8 py-5 text-lg font-semibold text-black shadow-md transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
                  >
                    {uploading ? (
                      <><Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} /> Uploading…</>
                    ) : (
                      <><Sparkles className="h-6 w-6" strokeWidth={3} /> Start AI Processing</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Section: AI Processing ── */}
            {activeSection === "ai" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                  <h1 className="  text-4xl uppercase tracking-tight text-gray-900 mb-3 border-b-4 border-black pb-2 inline-block">AI is Building</h1>
                  <p className="text-gray-600 font-bold text-base">This takes a few minutes. Grab a coffee.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
                  {/* Overall progress */}
                  <div className="mb-10">
                    <div className="flex items-end justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total Progress</span>
                      <span className=" text-4xl  text-orange-500">{aiProgress}%</span>
                    </div>
                    <div className="h-6 rounded-full border border-gray-200 bg-gray-50 overflow-hidden">
                      <div
                        className="h-full bg-yellow-300 border-r-4 border-black transition-all duration-700"
                        style={{ width: `${aiProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Step checklist */}
                  <div className="space-y-4">
                    {AI_STEPS.map((s, idx) => {
                      const done    = completedSteps.includes(s.id);
                      const current = !done && completedSteps.length === idx;
                      return (
                        <div key={s.id} className={`flex items-center gap-6 rounded-xl border border-gray-200 p-5 transition-colors ${
                          current ? "bg-blue-100 shadow-sm" : done ? "bg-white" : "bg-gray-50 opacity-50"
                        }`}>
                          <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border border-gray-200 bg-white  flex-shrink-0 ${done ? "text-green-400" : "text-black"}`}>
                            {done ? <CheckCircle className="h-6 w-6" strokeWidth={3} /> : <s.icon className="h-6 w-6" strokeWidth={3} />}
                          </div>
                          <span className={`flex-1 text-base font-semibold ${
                            done ? "line-through text-gray-500" : "text-gray-900"
                          }`}>
                            {s.label}
                          </span>
                          {current && <Loader2 className="h-6 w-6 animate-spin text-black flex-shrink-0" strokeWidth={3} />}
                        </div>
                      );
                    })}
                  </div>

                  {aiDone && (
                    <div className="mt-10 rounded-xl border border-gray-200 bg-green-100 p-6 shadow-sm text-center">
                      <p className=" text-2xl  uppercase tracking-tight text-black mb-4">Course is Ready!</p>
                      <button
                        onClick={() => setActiveSection("publish")}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-black shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                      >
                        Continue to Publish <ArrowRight className="h-5 w-5" strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Section: Publish ── */}
            {activeSection === "publish" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10">
                  <h1 className="  text-4xl uppercase tracking-tight text-gray-900 mb-3 border-b-4 border-black pb-2 inline-block">Ready to Publish</h1>
                  <p className="text-gray-600 font-bold text-base">Review the AI-generated content, then launch to students.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
                  <h3 className="text-xl  uppercase tracking-tight text-gray-900 mb-6 border-b-4 border-black pb-2 inline-block">Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {[
                      { label: "Title",      value: info.title || "–", color: "bg-blue-100" },
                      { label: "Category",   value: info.category || "Not set", color: "bg-amber-50" },
                      { label: "Price",      value: info.price === "0" ? "Free" : `₹${info.price}`, color: "bg-green-100" },
                      { label: "Level",      value: info.difficulty_level, color: "bg-pink-100" },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-xl border border-gray-200 ${item.color} p-5 shadow-sm`}>
                        <p className="text-xs font-semibold text-black/60 mb-1">{item.label}</p>
                        <p className="text-lg  uppercase tracking-tight text-black truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => courseId && router.push(`/teacher/courses/${courseId}/edit`)}
                      className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-8 py-5 text-lg font-semibold text-black shadow-sm transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-md"
                    >
                      Review & Edit Details
                    </button>
                    <button
                      onClick={handlePublish}
                      className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-orange-500 px-8 py-5 text-lg font-semibold text-white shadow-md transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-sm"
                    >
                      <Rocket className="h-6 w-6" strokeWidth={3} />
                      Publish Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
