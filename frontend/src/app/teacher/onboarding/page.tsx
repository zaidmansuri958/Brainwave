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
      <div className="bw-page flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (status.onboarding_status === "approved") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-gray-200 bg-green-100 shadow-md mb-8">
            <CheckCircle className="h-12 w-12 text-black" strokeWidth={3} />
          </div>
          <h1 className=" text-4xl  uppercase tracking-tight text-gray-900">You are verified</h1>
          <p className="text-lg font-bold text-gray-600 mt-4">You can now create and publish courses.</p>
          <button
            type="button"
            onClick={() => router.push("/teacher/courses/new")}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            Create a Course
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className=" text-4xl  uppercase tracking-tight text-gray-900 mb-2">Teacher Verification</h1>
        <p className="text-sm font-bold text-gray-600 mt-2 flex items-center gap-2">
          Status: <span className="inline-block rounded-full border border-gray-200 bg-yellow-300 px-3 py-1 text-xs font-semibold text-black ">{status.onboarding_status}</span>
        </p>
        {status.rejection_reason && (
          <p className="mt-4 rounded-lg border border-gray-200 bg-[#ffd6d6] p-4 text-sm font-bold text-[#8d2020] shadow-sm">
            <span className="block font-semibold text-xs mb-1">Rejection Reason</span>
            {status.rejection_reason}
          </p>
        )}
        <p className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-bold text-gray-700 shadow-sm">
          Submitting sends your current answers to the server. You can still use <strong>Save Draft</strong> anytime.
        </p>

        <div className="mt-10 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Legal Name</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                value={form.legal_name}
                onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
                placeholder="As on government ID"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Years Teaching</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                value={form.years_teaching}
                onChange={(e) => setForm((f) => ({ ...f, years_teaching: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Past Employers (comma-separated)</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                value={form.past_employers}
                onChange={(e) => setForm((f) => ({ ...f, past_employers: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Highest Degree</label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                value={form.highest_degree}
                onChange={(e) => setForm((f) => ({ ...f, highest_degree: e.target.value }))}
                placeholder="e.g. M.Sc. Computer Science"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className=" text-2xl  uppercase tracking-tight text-gray-900 border-b-4 border-black pb-2 inline-block">Documents</h2>
            <div className="grid grid-cols-1 gap-6 pt-2">
              {docs.map((x) => {
                const uploaded = !!x.url;
                const name = fileLabelFromUrl(x.url);
                return (
                  <div
                    key={x.k}
                    className={`rounded-xl border-4 p-6 transition-all shadow-sm hover:-translate-y-1 hover:shadow-md ${
                      uploaded ? "border-black bg-green-100" : "border-black bg-amber-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white  shrink-0`}>
                          {uploaded ? (
                            <FileCheck className="h-6 w-6 text-black" strokeWidth={3} />
                          ) : (
                            <Upload className="h-6 w-6 text-black" strokeWidth={3} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-base  uppercase tracking-tight text-black">{x.label}</span>
                          {uploaded && name && (
                            <p className="text-sm font-bold text-black/80 truncate mt-1" title={name}>
                              {name}
                            </p>
                          )}
                          {!uploaded && (
                            <p className="text-xs font-bold text-black/70 mt-1">PDF or image — choose file below</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {uploaded && x.url && (
                          <a
                            href={x.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black  transition-transform hover:-translate-y-1"
                          >
                            Open <ExternalLink className="h-3 w-3" strokeWidth={3} />
                          </a>
                        )}
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-orange-500 px-4 py-2 text-xs font-semibold text-white  transition-transform hover:-translate-y-1">
                          {uploaded ? "Replace" : "Choose File"}
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
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-black shadow-sm transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-50"
            >
              {save.isPending ? <Loader2 className="h-6 w-6 animate-spin mx-auto" strokeWidth={3} /> : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => submit.mutate()}
              disabled={submit.isPending || status.onboarding_status === "submitted"}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-50"
            >
              {submit.isPending ? <Loader2 className="h-6 w-6 animate-spin mx-auto" strokeWidth={3} /> : "Submit for Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
