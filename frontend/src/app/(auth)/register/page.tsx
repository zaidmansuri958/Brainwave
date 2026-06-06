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
          <h1 className="text-4xl font-extrabold leading-tight mb-4">Join India&apos;s fastest growing learning platform</h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Whether you&apos;re here to learn or to teach, Brainwave gives you the tools to succeed.
          </p>
          <div className="grid gap-4">
            {[
              { title: "Students", desc: "AI tutoring, quizzes, live sessions, and certificates." },
              { title: "Teachers", desc: "AI course builder, analytics, payouts, and doubt sessions." },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-xl p-5">
                <p className="font-bold text-white">{item.title}</p>
                <p className="text-blue-200 text-sm mt-1">{item.desc}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500 mt-1">Choose your role to get started</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
            {[{ role: "student", label: "I want to learn" }, { role: "teacher", label: "I want to teach" }].map((opt) => (
              <button key={opt.role} type="button"
                onClick={() => setFormData({ ...formData, role: opt.role })}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  formData.role === opt.role
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required className="input" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} className="input" placeholder="Minimum 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-lg btn-primary w-full justify-center mt-2 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : `Create ${formData.role} account`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
