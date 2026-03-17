"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <GraduationCap className="h-8 w-8" />
            <span>Brainwave.ai</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Create your account</h1>
          <p className="text-gray-500 mt-1">Start your learning journey today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "student" })}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              formData.role === "student"
                ? "bg-primary-600 text-white"
                : "text-gray-500 hover:text-gray-900"
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
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            I want to Teach
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition-all"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Creating account..." : `Create ${formData.role === "teacher" ? "Teacher" : "Student"} Account`}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
