"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { GraduationCap, Loader2, User, Mail, Lock, ArrowRight, BookOpen, GraduationCap as TeachIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-pattern dark:bg-hero-pattern-dark" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-500/15 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="glass-card p-8 md:p-10 rounded-3xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="gradient-text">Brainwave</span>
                <span className="text-muted-foreground">.ai</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-1">Start your learning journey today</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "student" })}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                formData.role === "student"
                  ? "gradient-bg text-white shadow-glow"
                  : "glass hover:shadow-md text-muted-foreground"
              )}
            >
              <BookOpen className="h-4 w-4" />
              I want to Learn
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "teacher" })}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                formData.role === "teacher"
                  ? "gradient-bg text-white shadow-glow"
                  : "glass hover:shadow-md text-muted-foreground"
              )}
            >
              <TeachIcon className="h-4 w-4" />
              I want to Teach
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                variant="glass"
                icon={<User className="h-4 w-4" />}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                variant="glass"
                icon={<Mail className="h-4 w-4" />}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                variant="glass"
                icon={<Lock className="h-4 w-4" />}
                placeholder="Min. 8 characters"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={loading}
              className="w-full rounded-2xl"
            >
              {loading ? "Creating account..." : `Create ${formData.role === "teacher" ? "Teacher" : "Student"} Account`}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-hero-pattern dark:bg-hero-pattern-dark" />
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
