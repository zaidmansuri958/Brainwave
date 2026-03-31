"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams  = useSearchParams();
  const defaultRole   = searchParams.get("role") || "student";

  const { setUser, setTokens } = useAuthStore();
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: defaultRole });
  const [loading,  setLoading]  = useState(false);

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
      toast({ title: "Registration failed", description: err.response?.data?.detail || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = formData.role === "teacher";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F7F6F3" }}>
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] w-full max-w-md p-8 border border-gray-100">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">Brainwave<span className="text-indigo-500">.ai</span></span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-gray-900">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start your journey today — it&apos;s free</p>
        </div>

        {/* Role toggle */}
        <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
          {[
            { role: "student", label: "I want to Learn" },
            { role: "teacher", label: "I want to Teach" },
          ].map(({ role, label }) => (
            <button
              key={role}
              type="button"
              onClick={() => setFormData({ ...formData, role })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                formData.role === role
                  ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300 bg-gray-50"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300 bg-gray-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300 bg-gray-50"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account…" : `Create ${isTeacher ? "Teacher" : "Student"} Account`}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F6F3" }}>
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
