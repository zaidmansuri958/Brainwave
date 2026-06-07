"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Loader2, Mail, Lock, ArrowRight,
  Bot, Award, BarChart3, Play,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens, isAuthenticated, user } = useAuthStore();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated()) {
      if (user?.role === "teacher") router.replace("/teacher/dashboard");
      else if (user?.role === "admin") router.replace("/admin/dashboard");
      else router.replace("/dashboard");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="h-screen overflow-hidden flex bg-white">

      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[46%] shrink-0 bg-[#f0eeff] relative overflow-hidden h-full">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 flex flex-col h-full px-10 py-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-6 shrink-0">
            <Image src="/images/logo.png" alt="Brainwave" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold text-gray-900">Brainwave</span>
          </Link>

          {/* Heading */}
          <div className="mb-4 shrink-0">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
              Welcome back to your{" "}
              <span className="relative text-violet-600">
                learning journey
                <svg className="absolute -bottom-0.5 left-0 w-full" height="4" viewBox="0 0 200 4" fill="none">
                  <path d="M2 2 Q100 0 198 2" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Students get guided dashboards. Teachers get the creator studio. Pick up exactly where you left off.
            </p>
          </div>

          {/* Hero image + floating cards */}
          <div className="relative flex-1 min-h-0 flex items-end justify-center">
            <div className="absolute top-2 left-6 bg-white rounded-2xl shadow-lg p-3 z-20">
              <div className="h-9 w-9 bg-violet-600 rounded-xl flex items-center justify-center">
                <Play className="h-4 w-4 text-white fill-white" />
              </div>
            </div>
            <div className="absolute top-0 right-6 bg-white rounded-2xl shadow-lg p-2.5 z-20">
              <BarChart3 className="h-8 w-8 text-violet-500" />
            </div>
            <div className="absolute top-[36%] left-2 bg-white rounded-2xl shadow-lg p-2.5 z-20">
              <Bot className="h-7 w-7 text-violet-500" />
            </div>
            <div className="absolute top-[26%] right-2 bg-white rounded-2xl shadow-lg p-2.5 z-20">
              <Award className="h-7 w-7 text-violet-500" />
            </div>
            <Image
              src="/images/cta-student.png"
              alt="Student learning"
              width={480}
              height={480}
              className="object-contain object-bottom h-full w-auto relative z-10"
              priority
            />
          </div>

          <p className="text-xs text-gray-400 shrink-0 pb-2">© {new Date().getFullYear()} Brainwave. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel (form) ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white overflow-hidden">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="Brainwave" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-xl font-bold text-gray-900">Brainwave</span>
            </Link>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-0.5">Sign in to your account</h2>
          <p className="text-sm text-gray-400 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all bg-white">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all bg-white">
                <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="shrink-0 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 transition-colors shadow-md shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* OAuth divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Google", logo: (
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                  <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
                  <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
                  <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
                  <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
              )},
              { label: "Microsoft", logo: (
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                  <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
                  <path fill="#7FBA00" d="M24 11.4H12.6V0H24v11.4z"/>
                  <path fill="#00A4EF" d="M11.4 24H0V12.6h11.4V24z"/>
                  <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
                </svg>
              )},
              { label: "Apple", logo: (
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
              )},
            ].map(({ label, logo }) => (
              <button key={label} type="button"
                onClick={() => toast({ title: `${label} sign-in coming soon`, description: "Please use email and password for now." })}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                {logo}<span>{label}</span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-600 font-semibold hover:text-violet-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
