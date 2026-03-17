"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-pattern dark:bg-hero-pattern-dark" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-[120px]" />

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
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to continue learning</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="glass"
                icon={<Mail className="h-4 w-4" />}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="glass"
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Enter your password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={loading}
              className="w-full rounded-2xl"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-4 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
