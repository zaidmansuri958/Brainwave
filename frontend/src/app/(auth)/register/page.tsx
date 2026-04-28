"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "student";
  const { setUser, setTokens } = useAuthStore();

  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: defaultRole });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(formData);
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      toast({ title: "Account created!", description: "Welcome to Brainwave.ai" });
      if (data.user.role === "teacher") router.push("/teacher/dashboard");
      else router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.response?.data?.detail || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bw-page flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border-2 border-black bg-white shadow-[8px_8px_0_#111111] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[#fff4d6] p-10 lg:block">
          <span className="eyebrow mb-5">Create an account</span>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[1.02] text-slate-950">
            Join Brainwave as a learner or educator.
          </h1>
          <div className="mt-8 grid gap-3">
            <div className="rounded-[1.3rem] border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111111]">
              <p className="font-display text-xl font-bold uppercase text-slate-950">Learners</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">Get guided dashboards, AI tutoring, practice assets, community, and verified certificates.</p>
            </div>
            <div className="rounded-[1.3rem] border-2 border-black bg-[#8ed8ff] p-5 shadow-[4px_4px_0_#111111]">
              <p className="font-display text-xl font-bold uppercase text-slate-950">Teachers</p>
              <p className="mt-2 text-sm leading-7 text-slate-800">Launch from the creator studio with AI course building, payouts, analytics, and learner operations.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="neo-icon-badge h-11 w-11 bg-[#ffe500] text-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold uppercase text-slate-950">Brainwave.ai</p>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Premium education platform</p>
            </div>
          </Link>

          <div className="mt-10">
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-950">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">Pick a role, then step into the redesigned learning or teaching experience.</p>
          </div>

          <div className="neo-tabbar mt-8 grid sm:grid-cols-2">
            {[
              { role: "student", label: "I want to learn" },
              { role: "teacher", label: "I want to teach" },
            ].map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => setFormData({ ...formData, role: option.role })}
                className={`neo-tab ${formData.role === option.role ? "neo-tab-active" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-extrabold uppercase text-slate-700">Full Name</label>
              <input type="text" value={formData.full_name} onChange={(event) => setFormData({ ...formData, full_name: event.target.value })} required className="w-full px-4 py-3 text-sm" placeholder="Your full name" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-extrabold uppercase text-slate-700">Email</label>
              <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required className="w-full px-4 py-3 text-sm" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-extrabold uppercase text-slate-700">Password</label>
              <input type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required minLength={8} className="w-full px-4 py-3 text-sm" placeholder="Minimum 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="bw-action-primary w-full !rounded-[1rem] !py-3.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating account..." : `Create ${formData.role === "teacher" ? "teacher" : "student"} account`}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold uppercase text-[#ff6b00]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#ff6b00]" /></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
