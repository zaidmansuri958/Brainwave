"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save, Shield, X } from "lucide-react";
import { authApi, teacherApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { AppShell, ContentBand, SectionHeader, StatusBadge } from "@/components/ui/app-shell";

const inputClass =
  "w-full rounded-[1rem] border border-slate-200 bg-[#fcf8f3] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

function ProfileCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bw-card p-6">
      <h2 className="font-display text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isTeacher = user?.role === "teacher";

  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    expertise_areas: [] as string[],
    payout_upi_id: "",
    payout_bank_account: "",
    payout_ifsc: "",
  });
  const [newExpertise, setNewExpertise] = useState("");

  useEffect(() => {
    if (user) setForm((prev) => ({ ...prev, full_name: user.full_name || "" }));
  }, [user]);

  const { data: teacherProfile } = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: () => teacherApi.dashboard().then((response) => response.data?.teacher_profile),
    enabled: isTeacher,
  });

  useEffect(() => {
    if (teacherProfile) {
      setForm((prev) => ({
        ...prev,
        bio: teacherProfile.bio || "",
        expertise_areas: teacherProfile.expertise_areas || [],
        payout_upi_id: teacherProfile.payout_upi_id || "",
        payout_bank_account: teacherProfile.payout_bank_account || "",
        payout_ifsc: teacherProfile.payout_ifsc || "",
      }));
    }
  }, [teacherProfile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (isTeacher) return teacherApi.updateProfile(form);
      return authApi.me();
    },
    onSuccess: () => toast({ title: "Profile updated" }),
    onError: (error) => toast({ title: "Couldn't update profile", description: getApiErrorMessage(error), variant: "destructive" }),
  });

  const addExpertise = () => {
    if (!newExpertise.trim()) return;
    setForm((prev) => ({ ...prev, expertise_areas: [...prev.expertise_areas, newExpertise.trim()] }));
    setNewExpertise("");
  };

  const removeExpertise = (index: number) => {
    setForm((prev) => ({ ...prev, expertise_areas: prev.expertise_areas.filter((_, itemIndex) => itemIndex !== index) }));
  };

  return (
    <AppShell className="flex flex-col">
      <Navbar />
      <main className="bw-shell flex-1 space-y-6 pb-6">
        <ContentBand muted>
          <SectionHeader eyebrow="Profile" title="Account settings with stronger hierarchy and less dead space." description="Identity, teaching profile, and payout details now sit inside clearer grouped panels instead of one long plain form." />
          <div className="mt-6 bw-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-sky-500 text-3xl font-bold text-white">
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-extrabold text-slate-950">{user?.full_name}</p>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone="info">{user?.role || "student"}</StatusBadge>
                {user?.is_verified ? (
                  <StatusBadge tone="success">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified
                  </StatusBadge>
                ) : null}
              </div>
            </div>
          </div>
        </ContentBand>

        <form onSubmit={(event) => { event.preventDefault(); updateProfile.mutate(); }} className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="space-y-6">
            <ProfileCard title="Basic Information">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                <input value={user?.email || ""} disabled className={`${inputClass} opacity-60`} />
              </div>
            </ProfileCard>

            {isTeacher ? (
              <ProfileCard title="Teacher Profile">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Bio</label>
                  <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={5} className={`${inputClass} resize-none`} placeholder="Tell students about your background and teaching style..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Expertise Areas</label>
                  <div className="flex gap-2">
                    <input value={newExpertise} onChange={(event) => setNewExpertise(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addExpertise())} className={inputClass} placeholder="e.g. Machine Learning" />
                    <button type="button" onClick={addExpertise} className="bw-action-primary !rounded-[1rem] !px-4 !py-3">
                      Add
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.expertise_areas.map((area, index) => (
                      <span key={area + index} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
                        {area}
                        <button type="button" onClick={() => removeExpertise(index)}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </ProfileCard>
            ) : null}
          </div>

          <div className="space-y-6">
            {isTeacher ? (
              <ProfileCard title="Payout Details">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">UPI ID</label>
                  <input value={form.payout_upi_id} onChange={(event) => setForm({ ...form, payout_upi_id: event.target.value })} className={inputClass} placeholder="yourname@upi" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Bank Account Number</label>
                  <input value={form.payout_bank_account} onChange={(event) => setForm({ ...form, payout_bank_account: event.target.value })} className={inputClass} placeholder="Account number" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">IFSC Code</label>
                  <input value={form.payout_ifsc} onChange={(event) => setForm({ ...form, payout_ifsc: event.target.value })} className={inputClass} placeholder="SBIN0001234" />
                </div>
              </ProfileCard>
            ) : (
              <ProfileCard title="Account Summary">
                <p className="text-sm leading-7 text-slate-600">
                  Your profile has been moved into a calmer, more grouped layout. This page is ready to grow with additional account
                  preferences, saved learning settings, and communication controls.
                </p>
              </ProfileCard>
            )}

            <button type="submit" disabled={updateProfile.isPending} className="bw-action-primary w-full !rounded-[1rem] !py-3.5">
              {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </AppShell>
  );
}
