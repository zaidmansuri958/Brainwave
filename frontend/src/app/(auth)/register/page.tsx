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
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  const benefits = [
    {
      icon: Users,
      title: "Join 50,000+ learners",
      description: "Be part of a thriving community of students and educators",
    },
    {
      icon: Award,
      title: "Earn certificates",
      description: "Get recognized credentials upon course completion",
    },
    {
      icon: TrendingUp,
      title: "Track your growth",
      description: "AI-powered analytics to monitor your learning progress",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-700">
        {/* Floating particles CSS animation */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="auth-particle"
              style={{
                left: `${(i * 19 + 3) % 100}%`,
                top: `${(i * 29 + 7) % 100}%`,
                width: `${(i % 3 + 1) * 8}px`,
                height: `${(i % 3 + 1) * 8}px`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${9 + (i % 4) * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white font-bold text-2xl">
            <GraduationCap className="h-8 w-8" />
            <span>Brainwave.ai</span>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight">
                {formData.role === "teacher"
                  ? "Start teaching the world"
                  : "Start your learning adventure"}
              </h2>
              <p className="text-lg text-white/70 mt-4 max-w-md">
                {formData.role === "teacher"
                  ? "Share your expertise with thousands of eager students. Create courses, go live, and make an impact."
                  : "Join thousands of learners who are building new skills with AI-powered personalized education."}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-5">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                      <span className="font-medium text-sm">{benefit.title}</span>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats footer */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-xs text-white/50">Active Learners</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-white/50">Courses</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-xs text-white/50">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
              <GraduationCap className="h-8 w-8" />
              <span>Brainwave.ai</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">
              Create your account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Start your journey with Brainwave.ai
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            <Button
              type="button"
              variant={formData.role === "student" ? "default" : "ghost"}
              onClick={() => setFormData({ ...formData, role: "student" })}
              className="flex-1 h-10 text-sm font-semibold rounded-lg"
            >
              I want to Learn
            </Button>
            <Button
              type="button"
              variant={formData.role === "teacher" ? "default" : "ghost"}
              onClick={() => setFormData({ ...formData, role: "teacher" })}
              className="flex-1 h-10 text-sm font-semibold rounded-lg"
            >
              I want to Teach
            </Button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Your full name"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
              className="w-full h-11 text-sm font-semibold"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading
                ? "Creating account..."
                : `Create ${formData.role === "teacher" ? "Teacher" : "Student"} Account`}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
