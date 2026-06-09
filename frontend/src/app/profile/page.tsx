"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save, Shield, X } from "lucide-react";
import { authApi, teacherApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { DashboardLayout, SectionCard, Badge } from "@/components/layout/DashboardLayout";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function ProfileCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SectionCard title={title}>
      <div className="space-y-5">{children}</div>
    </SectionCard>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
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
    queryFn: () => teacherApi.getProfile().then((response) => response.data),
    enabled: isTeacher,
  });

  useEffect(() => {
    if (teacherProfile) {
      setForm((prev) => ({
        ...prev,
        bio: teacherProfile.bio || "",
        expertise_areas: teacherProfile.expertise_areas || [],
        payout_upi_id: teacherProfile.payout_upi_id || "",
        payout_bank_account: teacherProfile.bank_account_number || "",
        payout_ifsc: teacherProfile.bank_ifsc || "",
      }));
    }
  }, [teacherProfile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      // Teacher-specific fields (bio, expertise, payout) persist via the teacher profile endpoint.
      if (isTeacher) await teacherApi.updateProfile(form);
      // Name (and avatar) live on the user record for every role — persist them for real.
      const res = await authApi.updateProfile({ full_name: form.full_name });
      return res.data;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) setUser(updatedUser);
      toast({ title: "Profile updated" });
    },
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
    <DashboardLayout
      title="Profile Settings"
      subtitle="Manage your identity, preferences, and payout details."
      breadcrumbs={[{ label: "Profile" }]}
    >
        {/* Profile header */}
        <div className="dash-card p-6 mb-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-gray-900">{user?.full_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="info">{user?.role || "student"}</Badge>
              {user?.is_verified && <Badge variant="success"><Shield className="mr-1 h-3 w-3" /> Verified</Badge>}
            </div>
          </div>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); updateProfile.mutate(); }} className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <div className="space-y-8">
            <ProfileCard title="Basic Information">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-900">Full Name</label>
                <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-900">Email Address</label>
                <input value={user?.email || ""} disabled className={`${inputClass} opacity-60 bg-slate-100 cursor-not-allowed`} />
              </div>
            </ProfileCard>

            {isTeacher ? (
              <ProfileCard title="Teacher Profile">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-900">Bio</label>
                  <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={5} className={`${inputClass} resize-none`} placeholder="Tell students about your background and teaching style..." />
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-900">Expertise Areas</label>
                  <div className="flex gap-4">
                    <input value={newExpertise} onChange={(event) => setNewExpertise(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addExpertise())} className={inputClass} placeholder="e.g. Machine Learning" />
                    <button type="button" onClick={addExpertise} className="rounded-lg border border-gray-200 bg-blue-100 text-black font-semibold px-8 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform">
                      Add
                    </button>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {form.expertise_areas.map((area, index) => (
                      <span key={area + index} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-pink-100 px-4 py-2 text-xs font-semibold text-black ">
                        {area}
                        <button type="button" onClick={() => removeExpertise(index)} className="hover:bg-white rounded-full p-0.5 border border-transparent hover:border-black transition-colors">
                          <X className="h-4 w-4" strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </ProfileCard>
            ) : null}
          </div>

          <div className="space-y-8">
            {isTeacher ? (
              <ProfileCard title="Payout Details">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-900">UPI ID</label>
                  <input value={form.payout_upi_id} onChange={(event) => setForm({ ...form, payout_upi_id: event.target.value })} className={inputClass} placeholder="yourname@upi" />
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-900">Bank Account Number</label>
                  <input value={form.payout_bank_account} onChange={(event) => setForm({ ...form, payout_bank_account: event.target.value })} className={inputClass} placeholder="Account number" />
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-900">IFSC Code</label>
                  <input value={form.payout_ifsc} onChange={(event) => setForm({ ...form, payout_ifsc: event.target.value })} className={inputClass} placeholder="SBIN0001234" />
                </div>
              </ProfileCard>
            ) : (
              <ProfileCard title="Account Summary">
                <p className="text-sm font-bold  text-gray-600 leading-relaxed border-l-4 border-black pl-4">
                  Your profile has been moved into a calmer, more grouped layout. This page is ready to grow with additional account
                  preferences, saved learning settings, and communication controls.
                </p>
              </ProfileCard>
            )}

            <button type="submit" disabled={updateProfile.isPending} className="dash-btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-50">
              {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
    </DashboardLayout>
  );
}
