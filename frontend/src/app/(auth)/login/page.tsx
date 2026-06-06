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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-blue-600 p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">Brainwave</span>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome back to your learning journey
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Students get guided dashboards. Teachers get the creator studio. Pick up exactly where you left off.
          </p>
          <div className="space-y-3">
            {["AI-powered course summaries", "Live and doubt sessions", "Verified certificates"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-blue-100">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm">© 2024 Brainwave. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Brainwave</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="input pr-10" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn btn-lg btn-primary w-full justify-center mt-2 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
