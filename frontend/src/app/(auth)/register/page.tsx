"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "student";

  const { setUser, setTokens } = useAuthStore();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: defaultRole,
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(formData);
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      toast({ title: "Account created!", description: "Welcome to Brainwave.ai" });

      if (data.user.role === "teacher") router.push("/teacher/dashboard");
      else router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.detail || "Please try again",
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Start your learning journey today</p>
        </div>

        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 mb-6 bg-white/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "student" })}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              formData.role === "student"
                ? "bg-primary-600 text-white"
                : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            I want to Learn
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "teacher" })}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              formData.role === "teacher"
                ? "bg-primary-600 text-white"
                : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            I want to Teach
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="modern-input"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="modern-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="modern-input"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full modern-btn-primary py-3 min-h-[48px]"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Creating account..." : `Create ${formData.role === "teacher" ? "Teacher" : "Student"} Account`}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
