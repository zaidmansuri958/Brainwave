"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.detail || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="glass-panel w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <GraduationCap className="h-8 w-8" />
            <span>Brainwave.ai</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="modern-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="modern-input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full modern-btn-primary py-3 min-h-[48px]"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary-600 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
