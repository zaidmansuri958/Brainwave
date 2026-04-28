"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      toast({ title: "Welcome back!", description: `Logged in as ${data.user.full_name}` });
      if (data.user.role === "teacher") router.push("/teacher/dashboard");
      else if (data.user.role === "admin") router.push("/admin/dashboard");
      else router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Login failed", description: error.response?.data?.detail || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bw-page flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border-2 border-black bg-white shadow-[8px_8px_0_#111111] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[#fff4d6] p-10 lg:block">
          <span className="eyebrow mb-5">Welcome Back</span>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[1.02] text-slate-950">
            Sign in to a bolder Brainwave experience.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-700">
            Students return to guided learning hubs. Teachers return to creator tools, analytics, and revenue visibility.
            The redesigned interface keeps everything clearer and closer to action.
          </p>
          <div className="mt-8 grid gap-3">
            {["Guided learner dashboard", "Teacher studio workflows", "AI tutor, certificates, and progress surfaces"].map((item, index) => (
              <div key={item} className={`flex items-center gap-3 rounded-[1.2rem] border-2 border-black px-4 py-3 text-sm font-bold text-slate-800 shadow-[4px_4px_0_#111111] ${index === 0 ? "bg-white" : index === 1 ? "bg-[#8ed8ff]" : "bg-[#7dde92]"}`}>
                <Sparkles className="h-4 w-4 text-black" />
                {item}
              </div>
            ))}
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
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">Continue learning, teaching, or managing the platform.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-extrabold uppercase text-slate-700">Email</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full px-4 py-3 text-sm" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-extrabold uppercase text-slate-700">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full px-4 py-3 pr-12 text-sm" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPass((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="bw-action-primary w-full !rounded-[1rem] !py-3.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-extrabold uppercase text-[#ff6b00]">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
