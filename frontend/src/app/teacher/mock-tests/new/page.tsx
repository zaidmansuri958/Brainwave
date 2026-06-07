"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockTestsApi, teacherApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, ArrowRight, ClipboardList, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

export default function NewMockPackagePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [price,       setPrice]       = useState("999");
  const [loading,     setLoading]     = useState(false);
  const [checking,    setChecking]    = useState(true);
  const [onboarded,   setOnboarded]   = useState(false);

  // Guard: teacher must have approved onboarding
  useEffect(() => {
    teacherApi.onboardingStatus()
      .then(({ data }) => {
        if (data.onboarding_status === "approved") {
          setOnboarded(true);
        } else {
          router.replace("/teacher/onboarding");
        }
      })
      .catch(() => router.replace("/teacher/onboarding"))
      .finally(() => setChecking(false));
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data } = await mockTestsApi.createPackage({
        title:       title.trim(),
        description: description.trim() || undefined,
        price:       Number(price),
      });
      toast({ title: "Package created!", description: "Now add papers and questions." });
      router.push(`/teacher/mock-tests/${data.id}`);
    } catch (err) {
      toast({
        title:       "Could not create package",
        description: getApiErrorMessage(err),
        variant:     "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <DashboardLayout title="New Mock Test Package" breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Mock Tests", href: "/teacher/mock-tests" },
        { label: "New" },
      ]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!onboarded) return null;

  return (
    <DashboardLayout
      title="New Mock Test Package"
      subtitle="Create a package of timed test papers students can purchase"
      breadcrumbs={[
        { label: "Teacher", href: "/teacher/dashboard" },
        { label: "Mock Tests", href: "/teacher/mock-tests" },
        { label: "New" },
      ]}
    >
      <div className="max-w-xl py-6">

        {/* Info banner */}
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 flex items-start gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 shrink-0">
            <ClipboardList className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-800">How it works</p>
            <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
              Create the package here, then add papers → sections → questions in the builder. Publish when ready.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Package title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., JEE Main — 5 Full Mock Tests"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's included? Topics covered, number of questions, etc."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹)</label>
            <input
              type="number"
              min={0}
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0 = Free"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">Set to 0 for a free package</p>
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 transition-colors shadow-sm shadow-violet-200 disabled:opacity-50"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              : <>Create & build papers <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
