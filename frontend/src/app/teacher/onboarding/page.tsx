"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, FileCheck, ExternalLink } from "lucide-react";

function fileLabelFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const seg = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
    const withoutPrefix = seg.replace(/^[a-f0-9]{32}_/i, "");
    return decodeURIComponent(withoutPrefix) || "Uploaded file";
  } catch {
    return "Uploaded file";
  }
}

function previewPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/** Inline preview when the file URL is reachable (MinIO bucket must allow public GET). */
function DocumentPreview({ url }: { url: string }) {
  const path = previewPath(url).toLowerCase();
  const isPdf = path.endsWith(".pdf");
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(path);

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Document preview"
        className="mt-3 w-full max-h-56 object-contain rounded-lg border border-gray-200 bg-white"
      />
    );
  }
  if (isPdf) {
    const src = url.includes("#") ? url : `${url}#toolbar=0`;
    return (
      <iframe title="PDF preview" src={src} className="mt-3 w-full min-h-[240px] rounded-lg border border-gray-200 bg-gray-50" />
    );
  }
  return (
    <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
      No inline preview for this file type. Use <strong>Open</strong> to view in a new tab.
    </p>
  );
}

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  /** Blob URLs for instant preview after choosing a file (cleared when server URL is available). */
  const [localPreview, setLocalPreview] = useState<Partial<Record<"degree_proof" | "aadhaar" | "pan", string>>>({});
  const [form, setForm] = useState({
    legal_name: "",
    years_teaching: "",
    past_employers: "",
    highest_degree: "",
  });

  const { data: status, isLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => teacherApi.onboardingStatus().then((r) => r.data),
  });

  useEffect(() => {
    if (!status) return;
    setForm({
      legal_name: status.legal_name ?? "",
      years_teaching: status.years_teaching != null ? String(status.years_teaching) : "",
      past_employers: Array.isArray(status.past_employers) ? status.past_employers.join(", ") : "",
      highest_degree: status.highest_degree ?? "",
    });
  }, [status]);

  const payload = () => ({
    legal_name: form.legal_name.trim(),
    years_teaching: form.years_teaching ? parseInt(form.years_teaching, 10) : undefined,
    past_employers: form.past_employers
      ? form.past_employers.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    highest_degree: form.highest_degree.trim(),
  });

  const save = useMutation({
    mutationFn: () => teacherApi.saveOnboarding(payload()),
    onSuccess: () => {
      toast({ title: "Draft saved" });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast({ title: typeof d === "string" ? d : "Could not save", variant: "destructive" });
    },
  });

  const submit = useMutation({
    mutationFn: () => teacherApi.submitOnboarding(payload()),
    onSuccess: () => {
      toast({ title: "Submitted for admin review" });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    },
    onError: (e: unknown) => {
      const d = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      let msg = "Submission failed";
      if (typeof d === "string") msg = d;
      else if (Array.isArray(d))
        msg = d.map((x: { msg?: string }) => x.msg).filter(Boolean).join(" ") || msg;
      toast({ title: msg, variant: "destructive" });
    },
  });

  const upload = async (docType: "degree_proof" | "aadhaar" | "pan", file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview((p) => {
      if (p[docType]) URL.revokeObjectURL(p[docType]!);
      return { ...p, [docType]: blobUrl };
    });
    try {
      await teacherApi.onboardingUpload(docType, file);
      toast({ title: `${file.name} uploaded` });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      setLocalPreview((p) => {
        if (p[docType]) URL.revokeObjectURL(p[docType]!);
        const { [docType]: _, ...rest } = p;
        return rest;
      });
    } catch {
      toast({ title: "Upload failed — try again or check file size", variant: "destructive" });
      setLocalPreview((p) => {
        if (p[docType]) URL.revokeObjectURL(p[docType]!);
        const { [docType]: _, ...rest } = p;
        return rest;
      });
    }
  };

  if (isLoading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status.onboarding_status === "approved") {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">You are verified</h1>
          <p className="text-gray-600 mt-2">You can create and publish courses.</p>
          <button
            type="button"
            onClick={() => router.push("/teacher/courses/new")}
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-button-indigo"
          >
            Create a course
          </button>
        </div>
      </div>
    );
  }

  const docs = [
    { k: "degree_proof" as const, label: "Degree proof", url: status.degree_proof_url as string | undefined },
    { k: "aadhaar" as const, label: "Aadhaar", url: status.aadhaar_doc_url as string | undefined },
    { k: "pan" as const, label: "PAN", url: status.pan_doc_url as string | undefined },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-gray-900">Teacher verification</h1>
        <p className="text-sm text-gray-600 mt-2">
          Status: <span className="font-semibold capitalize">{status.onboarding_status}</span>
          {status.rejection_reason && (
            <span className="block text-rose-600 mt-1">{status.rejection_reason}</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-3 rounded-xl bg-white border border-gray-100 px-3 py-2">
          Submitting sends your current answers to the server. You can still use <strong>Save draft</strong> anytime.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal name</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              value={form.legal_name}
              onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
              placeholder="As on government ID"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Years teaching</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              value={form.years_teaching}
              onChange={(e) => setForm((f) => ({ ...f, years_teaching: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Past employers (comma-separated)</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              value={form.past_employers}
              onChange={(e) => setForm((f) => ({ ...f, past_employers: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Highest degree</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              value={form.highest_degree}
              onChange={(e) => setForm((f) => ({ ...f, highest_degree: e.target.value }))}
              placeholder="e.g. M.Sc. Computer Science"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <p className="text-sm font-medium text-gray-800">Documents</p>
            {docs.map((x) => {
              const uploaded = !!x.url;
              const name = fileLabelFromUrl(x.url);
              return (
                <div
                  key={x.k}
                  className={`rounded-xl border px-4 py-3 transition-colors ${
                    uploaded ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {uploaded ? (
                        <FileCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Upload className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-gray-900">{x.label}</span>
                        {uploaded && name && (
                          <p className="text-xs text-emerald-800 truncate mt-0.5" title={name}>
                            {name}
                          </p>
                        )}
                        {!uploaded && (
                          <p className="text-xs text-gray-500 mt-0.5">PDF or image — choose file below</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {uploaded && x.url && (
                        <a
                          href={x.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <label className="inline-flex cursor-pointer items-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50">
                        {uploaded ? "Replace" : "Choose file"}
                        <input
                          type="file"
                          accept="image/*,.pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) void upload(x.k, f);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {(uploaded && x.url) || localPreview[x.k] ? (
                    <DocumentPreview url={localPreview[x.k] || x.url!} />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="flex-1 border border-gray-300 rounded-xl py-3 font-semibold text-gray-800 bg-white hover:bg-gray-50 transition-colors"
            >
              {save.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => submit.mutate()}
              disabled={submit.isPending || status.onboarding_status === "submitted"}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-semibold shadow-button-indigo hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submit.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Submit for review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
