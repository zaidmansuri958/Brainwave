"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Upload, CheckCircle2, FileCheck, ExternalLink,
  AlertTriangle, Clock, XCircle, ArrowRight,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────────
function fileLabelFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const seg = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(seg.replace(/^[a-f0-9]{32}_/i, "")) || "Uploaded file";
  } catch { return "Uploaded file"; }
}

function DocumentPreview({ url }: { url: string }) {
  const path = (new URL(url).pathname.toLowerCase());
  if (/\.(jpe?g|png|gif|webp)$/i.test(path))
    return <img src={url} alt="doc" className="mt-3 w-full max-h-56 object-contain rounded-xl border border-gray-200 bg-white" />;
  if (path.endsWith(".pdf"))
    return <iframe title="PDF" src={`${url}#toolbar=0`} className="mt-3 w-full min-h-[200px] rounded-xl border border-gray-200 bg-gray-50" />;
  return <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">No inline preview — use <strong>Open</strong> to view.</p>;
}

function StatusBanner({ status, reason }: { status: string; reason?: string }) {
  const map: Record<string, { bg: string; icon: React.ElementType; text: string; desc: string }> = {
    pending:   { bg: "bg-gray-50 border-gray-200",   icon: Clock,          text: "Not submitted yet",   desc: "Fill in your details and submit for review." },
    submitted: { bg: "bg-blue-50 border-blue-200",   icon: Clock,          text: "Under review",        desc: "Admin will review your application within 1–2 business days." },
    approved:  { bg: "bg-green-50 border-green-200", icon: CheckCircle2,   text: "Approved",            desc: "You're verified! You can create and publish courses." },
    rejected:  { bg: "bg-red-50 border-red-200",     icon: XCircle,        text: "Application rejected", desc: reason || "Please update your information and resubmit." },
  };
  const cfg = map[status] ?? map.pending;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 mb-6 ${cfg.bg}`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${status === "approved" ? "text-green-600" : status === "rejected" ? "text-red-600" : status === "submitted" ? "text-blue-600" : "text-gray-500"}`} />
      <div>
        <p className="text-sm font-bold text-gray-900">{cfg.text}</p>
        <p className="text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

// ── page ───────────────────────────────────────────────────────────────────────
export default function TeacherOnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [localPreview, setLocalPreview] = useState<Partial<Record<"degree_proof" | "aadhaar" | "pan", string>>>({});
  const [form, setForm] = useState({ legal_name: "", years_teaching: "", past_employers: "", highest_degree: "" });

  // ── THE FIX: destructure isError so we don't loop forever on failure ──
  const { data: status, isLoading, isError } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn:  () => teacherApi.onboardingStatus().then(r => r.data),
    retry: 1,
  });

  useEffect(() => {
    if (!status) return;
    setForm({
      legal_name:      status.legal_name ?? "",
      years_teaching:  status.years_teaching != null ? String(status.years_teaching) : "",
      past_employers:  Array.isArray(status.past_employers) ? status.past_employers.join(", ") : "",
      highest_degree:  status.highest_degree ?? "",
    });
  }, [status]);

  const payload = () => ({
    legal_name:      form.legal_name.trim(),
    years_teaching:  form.years_teaching ? parseInt(form.years_teaching, 10) : undefined,
    past_employers:  form.past_employers ? form.past_employers.split(",").map(s => s.trim()).filter(Boolean) : [],
    highest_degree:  form.highest_degree.trim(),
  });

  const save = useMutation({
    mutationFn: () => teacherApi.saveOnboarding(payload()),
    onSuccess:  () => { toast({ title: "Draft saved" }); qc.invalidateQueries({ queryKey: ["onboarding-status"] }); },
    onError:    (e: any) => toast({ title: e?.response?.data?.detail || "Could not save", variant: "destructive" }),
  });

  const submit = useMutation({
    mutationFn: () => teacherApi.submitOnboarding(payload()),
    onSuccess:  () => { toast({ title: "Submitted for review" }); qc.invalidateQueries({ queryKey: ["onboarding-status"] }); },
    onError:    (e: any) => {
      const d = e?.response?.data?.detail;
      const msg = typeof d === "string" ? d : Array.isArray(d) ? d.map((x: any) => x.msg).join(" ") : "Submission failed";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const upload = async (docType: "degree_proof" | "aadhaar" | "pan", file: File) => {
    const blob = URL.createObjectURL(file);
    setLocalPreview(p => { if (p[docType]) URL.revokeObjectURL(p[docType]!); return { ...p, [docType]: blob }; });
    try {
      await teacherApi.onboardingUpload(docType, file);
      toast({ title: `${file.name} uploaded` });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      setLocalPreview(p => { URL.revokeObjectURL(p[docType]!); const { [docType]: _, ...rest } = p; return rest; });
    } catch {
      toast({ title: "Upload failed — check file size and try again", variant: "destructive" });
      setLocalPreview(p => { if (p[docType]) URL.revokeObjectURL(p[docType]!); const { [docType]: _, ...rest } = p; return rest; });
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardLayout title="Teacher Onboarding" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Onboarding" }]}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Error state (THE FIX — was infinite spinner before) ──────────────────
  if (isError || !status) {
    return (
      <DashboardLayout title="Teacher Onboarding" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Onboarding" }]}>
        <div className="max-w-lg py-10">
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
            <p className="text-base font-bold text-gray-900 mb-1">Could not load onboarding status</p>
            <p className="text-sm text-gray-500 mb-5">Check your connection or try refreshing the page.</p>
            <button onClick={() => qc.invalidateQueries({ queryKey: ["onboarding-status"] })}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-5 py-2.5 transition-colors">
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Approved state ─────────────────────────────────────────────────────────
  if (status.onboarding_status === "approved") {
    return (
      <DashboardLayout title="Teacher Onboarding" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Onboarding" }]}>
        <div className="max-w-lg py-10">
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xl font-extrabold text-gray-900 mb-2">You're verified!</p>
            <p className="text-sm text-gray-500 mb-6">You can now create and publish courses, mock tests, and study materials.</p>
            <button onClick={() => router.push("/teacher/courses/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-6 py-3 transition-colors shadow-sm shadow-violet-200">
              Create your first course <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  const docs = [
    { k: "degree_proof" as const, label: "Degree Proof",   url: status.degree_proof_url as string | undefined },
    { k: "aadhaar"      as const, label: "Aadhaar Card",   url: status.aadhaar_doc_url  as string | undefined },
    { k: "pan"          as const, label: "PAN Card",       url: status.pan_doc_url      as string | undefined },
  ];

  return (
    <DashboardLayout
      title="Teacher Verification"
      subtitle="Complete your profile to start creating and selling courses"
      breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Onboarding" }]}
    >
      <div className="max-w-2xl py-6 space-y-5">

        <StatusBanner status={status.onboarding_status} reason={status.rejection_reason} />

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
              <FileCheck className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Legal Name</label>
              <input value={form.legal_name} onChange={e => setForm(f => ({ ...f, legal_name: e.target.value }))}
                placeholder="As on government ID" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years Teaching</label>
              <input type="number" min={0} value={form.years_teaching}
                onChange={e => setForm(f => ({ ...f, years_teaching: e.target.value }))}
                placeholder="e.g. 5" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Highest Degree</label>
              <input value={form.highest_degree} onChange={e => setForm(f => ({ ...f, highest_degree: e.target.value }))}
                placeholder="e.g. M.Sc. Computer Science" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Past Employers</label>
              <input value={form.past_employers} onChange={e => setForm(f => ({ ...f, past_employers: e.target.value }))}
                placeholder="Comma-separated e.g. Google, Amazon" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
              <Upload className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">KYC Documents</h2>
            <span className="ml-auto text-[11px] text-gray-400">PDF or image</span>
          </div>
          <div className="p-6 space-y-4">
            {docs.map(x => {
              const uploaded = !!x.url;
              const preview  = localPreview[x.k] || x.url;
              return (
                <div key={x.k} className={`rounded-xl border p-4 transition-all ${uploaded ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/40"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${uploaded ? "bg-green-100" : "bg-gray-100"}`}>
                        {uploaded
                          ? <CheckCircle2 className="h-4.5 w-4.5 h-[18px] w-[18px] text-green-600" />
                          : <Upload className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{x.label}</p>
                        {uploaded && (
                          <p className="text-[11px] text-gray-400 truncate">{fileLabelFromUrl(x.url)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {uploaded && x.url && (
                        <a href={x.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-[11px] font-semibold px-2.5 py-1.5 transition-colors">
                          <ExternalLink className="h-3 w-3" /> Open
                        </a>
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold px-3 py-1.5 transition-colors">
                        {uploaded ? "Replace" : "Upload"}
                        <input type="file" accept="image/*,.pdf,application/pdf" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void upload(x.k, f); }} />
                      </label>
                    </div>
                  </div>
                  {preview && <DocumentPreview url={preview} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => save.mutate()} disabled={save.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 transition-colors shadow-sm disabled:opacity-50">
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
          </button>
          <button type="button" onClick={() => submit.mutate()}
            disabled={submit.isPending || status.onboarding_status === "submitted"}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 transition-colors shadow-sm shadow-violet-200 disabled:opacity-50">
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Submit for Review</>}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
