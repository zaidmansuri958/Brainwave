"use client";

import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/lib/api";
import {
  CheckCircle2, Circle, Loader2, XCircle,
  Mic, ShieldCheck, BookOpen, Brain, Database,
  ImageIcon, Upload, RefreshCw,
} from "lucide-react";

interface Props {
  courseId: string;
}

const STEPS = [
  {
    id: "upload",
    label: "File Upload",
    desc: "Materials uploaded to storage",
    icon: Upload,
    minProgress: 0,
  },
  {
    id: "transcribe",
    label: "Transcription",
    desc: "Converting video/audio to text & captions",
    icon: Mic,
    minProgress: 5,
  },
  {
    id: "moderate",
    label: "Content Check",
    desc: "Verifying content safety & guidelines",
    icon: ShieldCheck,
    minProgress: 25,
  },
  {
    id: "structure",
    label: "Course Structure",
    desc: "AI building chapters, lessons & summaries",
    icon: BookOpen,
    minProgress: 40,
  },
  {
    id: "quizzes",
    label: "Quiz Generation",
    desc: "Creating AI-powered quizzes per chapter",
    icon: Brain,
    minProgress: 65,
  },
  {
    id: "indexing",
    label: "Bot Training",
    desc: "Indexing content for the AI chatbot",
    icon: Database,
    minProgress: 75,
  },
  {
    id: "thumbnail",
    label: "Thumbnails",
    desc: "Generating course & lesson thumbnails",
    icon: ImageIcon,
    minProgress: 85,
  },
];

function getStepStatus(step: typeof STEPS[0], progress: number, currentStep: string, aiStatus: string) {
  if (aiStatus === "failed" && currentStep === step.id) return "failed";
  if (progress >= step.minProgress + (step.id === "upload" ? 1 : 15)) return "done";
  if (currentStep === step.id || (step.id === "upload" && progress >= 5)) {
    if (step.id === "upload") return "done";
    return "running";
  }
  if (progress >= step.minProgress && step.minProgress > 0) return "running";
  return "pending";
}

export function CourseProcessingStatus({ courseId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-status", courseId],
    queryFn: () => courseApi.aiStatus(courseId).then((r) => r.data),
    refetchInterval: (q) => {
      const s = q.state.data?.ai_processing?.status;
      return s === "processing" || s === "pending" ? 3000 : false;
    },
    staleTime: 2000,
  });

  const ai = data?.ai_processing;
  const status: string = ai?.status || "pending";
  const progress: number = Number(ai?.progress_percent || 0);
  const currentStep: string = ai?.current_step || "";
  const error: string = ai?.error || "";

  if (isLoading) return null;
  if (status === "completed") return null;
  if (!status || status === "pending") return null;

  const currentStepObj = STEPS.find((s) => s.id === currentStep);

  return (
    <div className={`mb-6 rounded-2xl border overflow-hidden ${
      status === "failed"
        ? "border-red-200 bg-red-50/60"
        : "border-violet-200 bg-violet-50/40"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
        status === "failed"
          ? "border-red-200 bg-red-50"
          : "border-violet-200 bg-violet-100/60"
      }`}>
        <div className="flex items-center gap-2.5">
          {status === "failed" ? (
            <XCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          ) : (
            <Loader2 className="h-4 w-4 text-violet-600 animate-spin shrink-0" />
          )}
          <span className={`text-sm font-bold ${status === "failed" ? "text-red-700" : "text-violet-800"}`}>
            {status === "failed" ? "Processing Failed" : "AI Processing in Progress"}
          </span>
        </div>
        <span className={`text-xs font-bold ${status === "failed" ? "text-red-600" : "text-violet-600"}`}>
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/60">
        <div
          className={`h-full transition-all duration-700 ${status === "failed" ? "bg-red-400" : "bg-violet-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {STEPS.map((step) => {
            const stepStatus = getStepStatus(step, progress, currentStep, status);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center gap-1.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  stepStatus === "done"
                    ? "bg-emerald-100 text-emerald-600"
                    : stepStatus === "running"
                    ? "bg-violet-200 text-violet-700 ring-2 ring-violet-400 ring-offset-1"
                    : stepStatus === "failed"
                    ? "bg-red-100 text-red-500"
                    : "bg-white/60 text-gray-300 border border-gray-200"
                }`}>
                  {stepStatus === "done" ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  ) : stepStatus === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : stepStatus === "failed" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <p className={`text-[10px] font-semibold leading-tight ${
                  stepStatus === "done"
                    ? "text-emerald-700"
                    : stepStatus === "running"
                    ? "text-violet-700"
                    : stepStatus === "failed"
                    ? "text-red-600"
                    : "text-gray-400"
                }`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Current step description */}
        {status !== "failed" && currentStepObj && (
          <p className="mt-3 text-xs text-violet-600/80 text-center">
            Currently: <span className="font-semibold">{currentStepObj.desc}</span>
            <span className="ml-1 text-violet-400">— this may take a few minutes</span>
          </p>
        )}

        {/* Error message */}
        {status === "failed" && error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-100 px-4 py-3">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">Error</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
