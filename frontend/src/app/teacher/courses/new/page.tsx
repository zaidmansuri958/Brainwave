"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, Loader2, X, FileVideo, FileText, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  // Dropzone
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
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <FileVideo className="h-5 w-5 text-blue-500" />;
    if (file.type.startsWith("audio/")) return <Mic className="h-5 w-5 text-green-500" />;
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all ${
                i < step ? "bg-primary-600 border-primary-600 text-white"
                : i === step ? "border-primary-600 text-primary-600"
                : "border-gray-300 text-gray-400"
              }`}>
                {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`ml-1 text-xs hidden sm:block ${i === step ? "text-primary-600 font-semibold" : "text-gray-400"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Course Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Complete Physics Course for JEE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="AI will enhance this description from your materials..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={basicInfo.category}
                    onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white outline-none"
                  >
                    <option value="">Select Category</option>
                    {["Mathematics", "Physics", "Chemistry", "Biology", "Programming", "English", "History", "Commerce"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={basicInfo.price}
                    onChange={(e) => setBasicInfo({ ...basicInfo, price: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0 = Free"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
                  <select
                    value={basicInfo.difficulty_level}
                    onChange={(e) => setBasicInfo({ ...basicInfo, difficulty_level: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={basicInfo.language}
                    onChange={(e) => setBasicInfo({ ...basicInfo, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white outline-none"
                  >
                    {["English", "Hindi", "Gujarati", "Tamil", "Telugu", "Marathi", "Bengali"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateCourse}
                disabled={!basicInfo.title}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors min-h-[48px]"
              >
                Continue to Upload →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Upload Materials */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Course Materials</h2>
            <p className="text-gray-500 mb-6">Just record yourself teaching! Our AI will do the rest.</p>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                {isDragActive ? "Drop files here..." : "Drag & drop your videos, PDFs, or audio files here"}
              </p>
              <p className="text-gray-500 text-sm mt-2">Or tap to browse</p>
              <p className="text-gray-400 text-xs mt-3">Supported: MP4, PDF, MP3, WAV, MOV · Max 2GB per file</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Just record yourself teaching on your phone! Our AI will transcribe, create chapters, generate quizzes, and build a beautiful course automatically.
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full mt-4 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
              {uploading ? "Uploading..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""} & Start AI Processing`}
            </button>
          </div>
        )}

        {/* Step 2: AI Processing */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI is building your course...</h2>
            <p className="text-gray-500 mb-6">This takes 5-10 minutes. We'll send you an email when it's ready!</p>

            {/* Progress Bar */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${aiProgress}%` }}
              />
            </div>
            <p className="text-sm text-primary-600 font-semibold mb-6">{aiProgress}%</p>

            {/* Step Checklist */}
            <div className="space-y-3 text-left">
              {AI_STEPS.map((s) => {
                const done = completedSteps.includes(s.id);
                const current = !done && completedSteps.length > 0 && AI_STEPS.findIndex((st) => st.id === s.id) === completedSteps.length;
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : current ? (
                      <Loader2 className="h-5 w-5 text-primary-600 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${done ? "text-green-700 dark:text-green-400" : current ? "text-primary-600" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Review & Publish */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your course is ready!</h2>
              <p className="text-gray-500 mt-1">AI has created chapters, lessons, quizzes, and a thumbnail.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push(`/teacher/courses/${courseId}/review`)}
                className="w-full border-2 border-primary-600 text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors min-h-[48px]"
              >
                Review AI-Generated Structure
              </button>
              <button
                onClick={handlePublish}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors min-h-[48px]"
              >
                Publish Course Now →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
