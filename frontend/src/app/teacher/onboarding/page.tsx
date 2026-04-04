"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle } from "lucide-react";

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
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

  const save = useMutation({
    mutationFn: () =>
      teacherApi.saveOnboarding({
        legal_name: form.legal_name,
        years_teaching: form.years_teaching ? parseInt(form.years_teaching, 10) : undefined,
        past_employers: form.past_employers
          ? form.past_employers.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        highest_degree: form.highest_degree,
      }),
    onSuccess: () => {
      toast({ title: "Saved" });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    },
  });

  const submit = useMutation({
    mutationFn: () => teacherApi.submitOnboarding(),
    onSuccess: () => {
      toast({ title: "Submitted for admin review" });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    },
    onError: (e: any) => {
      toast({ title: e.response?.data?.detail || "Failed", variant: "destructive" });
    },
  });

  const upload = async (docType: "degree_proof" | "aadhaar" | "pan", file: File) => {
    try {
      await teacherApi.onboardingUpload(docType, file);
      toast({ title: "Uploaded" });
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  if (isLoading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status.onboarding_status === "approved") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">You are verified</h1>
          <p className="text-gray-600 mt-2">You can create and publish courses.</p>
          <button
            type="button"
            onClick={() => router.push("/teacher/courses/new")}
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Create a course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Teacher verification</h1>
        <p className="text-sm text-gray-600 mt-2">
          Status: <span className="font-semibold">{status.onboarding_status}</span>
          {status.rejection_reason && (
            <span className="block text-rose-600 mt-1">{status.rejection_reason}</span>
          )}
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal name</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.legal_name}
              onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
              placeholder={status.legal_name || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Years teaching</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.years_teaching}
              onChange={(e) => setForm((f) => ({ ...f, years_teaching: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Past employers (comma-separated)</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.past_employers}
              onChange={(e) => setForm((f) => ({ ...f, past_employers: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Highest degree</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.highest_degree}
              onChange={(e) => setForm((f) => ({ ...f, highest_degree: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            {[
              { k: "degree_proof" as const, label: "Degree proof" },
              { k: "aadhaar" as const, label: "Aadhaar" },
              { k: "pan" as const, label: "PAN" },
            ].map((x) => (
              <label
                key={x.k}
                className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white cursor-pointer hover:bg-gray-50"
              >
                <span className="text-sm font-medium">{x.label}</span>
                <Upload className="h-4 w-4 text-gray-400" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(x.k, f);
                  }}
                />
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="flex-1 border border-gray-300 rounded-xl py-3 font-semibold text-gray-800"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={() => submit.mutate()}
              disabled={submit.isPending || status.onboarding_status === "submitted"}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-semibold"
            >
              Submit for review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
