"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "This reset link is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {done ? (
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Password reset</h1>
              <p className="text-sm text-gray-500 mb-6">Your password has been updated. You can now log in with your new password.</p>
              <Link href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors">
                Return to login
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid reset link</h1>
              <p className="text-sm text-gray-500 mb-6">This link is missing or malformed. Request a new password reset email.</p>
              <Link href="/forgot-password"
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors">
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 mb-5">
                <Lock className="h-6 w-6 text-violet-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h1>
              <p className="text-sm text-gray-500 mb-6">Choose a strong password you don&apos;t use elsewhere.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all bg-white">
                    <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                    <input
                      type="password" required
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all bg-white">
                    <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                    <input
                      type="password" required
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={loading || !password || !confirm}
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
