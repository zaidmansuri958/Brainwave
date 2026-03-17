"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, Loader2, X, FileVideo, FileText, Mic, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STEPS = ["Basic Info", "Upload Materials", "AI Processing", "Review & Publish"];

const AI_STEPS = [
  { id: "transcription", label: "Transcribing videos..." },
  { id: "structuring", label: "Generating chapters and lessons..." },
  { id: "quizzes", label: "Creating quiz questions..." },
  { id: "indexing", label: "Indexing for AI chatbot..." },
  { id: "thumbnail", label: "Generating thumbnail..." },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    price: "0",
    category: "",
    difficulty_level: "beginner",
    language: "English",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [aiDone, setAiDone] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
      "audio/*": [".mp3", ".wav", ".m4a"],
      "application/pdf": [".pdf"],
    },
    maxSize: 2 * 1024 * 1024 * 1024,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <FileVideo className="h-5 w-5 text-blue-500" />;
    if (file.type.startsWith("audio/")) return <Mic className="h-5 w-5 text-emerald-500" />;
    return <FileText className="h-5 w-5 text-red-500" />;
  };

  const handleCreateCourse = async () => {
    try {
      const { data } = await courseApi.create({
        ...basicInfo,
        price: parseFloat(basicInfo.price),
      });
      setCourseId(data.id);
      setCourseSlug(data.slug);
      setStep(1);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!courseId || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      await courseApi.uploadMaterials(courseId, formData);
      setStep(2);
      pollAIStatus();
    } catch {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const pollAIStatus = async () => {
    if (!courseId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await courseApi.aiStatus(courseId);
        const aiStatus = data.ai_processing;
        setAiProgress(aiStatus.progress_percent || 0);
        setCompletedSteps(aiStatus.steps_completed || []);

        if (aiStatus.status === "completed") {
          clearInterval(interval);
          setAiProgress(100);
          setAiDone(true);
          setStep(3);
        } else if (aiStatus.status === "failed") {
          clearInterval(interval);
          toast({ title: "AI processing failed", description: data.error || "Unknown error", variant: "destructive" });
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
      router.push(`/teacher/courses/${courseId}/review`);
    } catch {
      toast({ title: "Error", description: "Failed to publish course", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                i < step ? "gradient-bg text-white shadow-glow"
                : i === step ? "border-2 border-primary-500 text-primary-500"
                : "border-2 border-border text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`ml-2 text-xs hidden sm:block ${i === step ? "text-primary-500 font-semibold" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full ${i < step ? "gradient-bg" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Course Basic Info</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Course Title *</label>
                <Input
                  type="text"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  variant="glass"
                  placeholder="e.g., Complete Physics Course for JEE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  rows={3}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none"
                  placeholder="AI will enhance this description from your materials..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={basicInfo.category}
                    onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="">Select Category</option>
                    {["Mathematics", "Physics", "Chemistry", "Biology", "Programming", "English", "History", "Commerce"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price (INR)</label>
                  <Input
                    type="number"
                    value={basicInfo.price}
                    onChange={(e) => setBasicInfo({ ...basicInfo, price: e.target.value })}
                    min="0"
                    variant="glass"
                    placeholder="0 = Free"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Difficulty Level</label>
                  <select
                    value={basicInfo.difficulty_level}
                    onChange={(e) => setBasicInfo({ ...basicInfo, difficulty_level: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                  <select
                    value={basicInfo.language}
                    onChange={(e) => setBasicInfo({ ...basicInfo, language: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                  >
                    {["English", "Hindi", "Gujarati", "Tamil", "Telugu", "Marathi", "Bengali"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                onClick={handleCreateCourse}
                disabled={!basicInfo.title}
                variant="gradient"
                size="lg"
                className="w-full rounded-2xl"
              >
                Continue to Upload <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-foreground mb-2">Upload Course Materials</h2>
            <p className="text-muted-foreground mb-6">Just record yourself teaching! Our AI will do the rest.</p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? "border-primary-500 bg-primary-500/5"
                  : "border-border hover:border-primary-400 hover:bg-accent/30"
              }`}
            >
              <input {...getInputProps()} />
              <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <p className="text-foreground font-semibold text-lg">
                {isDragActive ? "Drop files here..." : "Drag & drop your videos, PDFs, or audio files"}
              </p>
              <p className="text-muted-foreground text-sm mt-2">Or click to browse</p>
              <p className="text-muted-foreground/60 text-xs mt-3">Supported: MP4, PDF, MP3, WAV, MOV &middot; Max 2GB per file</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 glass rounded-2xl p-4">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span><strong>Tip:</strong> Just record yourself teaching on your phone! Our AI will transcribe, create chapters, generate quizzes, and build a beautiful course automatically.</span>
              </p>
            </div>

            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              loading={uploading}
              variant="gradient"
              size="lg"
              className="w-full mt-4 rounded-2xl"
            >
              {uploading ? "Uploading..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""} & Start AI`}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card p-8 md:p-10 rounded-3xl text-center">
            <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 animate-glow-pulse">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">AI is building your course...</h2>
            <p className="text-muted-foreground mb-8">This takes 5-10 minutes. We&apos;ll send you an email when it&apos;s ready!</p>

            <div className="bg-muted/50 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className="gradient-bg h-3 rounded-full transition-all duration-500"
                style={{ width: `${aiProgress}%` }}
              />
            </div>
            <p className="text-sm text-primary-500 font-bold mb-8">{aiProgress}%</p>

            <div className="space-y-3 text-left max-w-sm mx-auto">
              {AI_STEPS.map((s) => {
                const done = completedSteps.includes(s.id);
                const current = !done && completedSteps.length > 0 && AI_STEPS.findIndex((st) => st.id === s.id) === completedSteps.length;
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    ) : current ? (
                      <Loader2 className="h-5 w-5 text-primary-500 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0" />
                    )}
                    <span className={`text-sm ${done ? "text-emerald-500" : current ? "text-primary-500 font-medium" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card p-8 md:p-10 rounded-3xl">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Your course is ready!</h2>
              <p className="text-muted-foreground mt-1">AI has created chapters, lessons, quizzes, and a thumbnail.</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/teacher/courses/${courseId}/review`)}
                variant="outline"
                size="lg"
                className="w-full rounded-2xl"
              >
                Review AI-Generated Structure
              </Button>
              <Button
                onClick={handlePublish}
                variant="gradient"
                size="lg"
                className="w-full rounded-2xl"
              >
                Publish Course Now <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
