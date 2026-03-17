"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserIcon,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AnimatedGridBg } from "@/components/ui/animated-grid-bg";
import { RippleEffect } from "@/components/ui/ripple-effect";

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
  const [showPass, setShowPass] = useState(false);
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#030014] overflow-hidden">
      <AnimatedGridBg />

      {/* Subtle left decoration */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-40">
        <RippleEffect color="rgba(99,102,241,0.12)" count={4} />
      </div>

      {/* Mesh gradient blurs */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Brainwave.ai</span>
            </Link>
            <h1 className="text-2xl font-bold text-white mt-6">
              Create your account
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">
              Start your journey with Brainwave.ai
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "student" })}
              className={`flex-1 h-10 text-sm font-semibold rounded-lg transition-all duration-200 ${
                formData.role === "student"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              I want to Learn
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "teacher" })}
              className={`flex-1 h-10 text-sm font-semibold rounded-lg transition-all duration-200 ${
                formData.role === "teacher"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              I want to Teach
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-gray-300 text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="Your full name"
                  className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                  className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="h-11 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="shimmer"
              size="lg"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold rounded-xl"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading
                ? "Creating account..."
                : `Create ${formData.role === "teacher" ? "Teacher" : "Student"} Account`}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-center text-xs text-gray-600 tracking-wide">
              50K+ Learners &bull; 500+ Courses &bull; 4.9&#9733; Rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030014] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
