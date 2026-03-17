"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi, teacherApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Save, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";

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
    if (user) {
      setForm((prev) => ({ ...prev, full_name: user.full_name || "" }));
    }
  }, [user]);

  const { data: teacherProfile } = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: () => teacherApi.dashboard().then((r) => r.data?.teacher_profile),
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
      if (isTeacher) {
        return teacherApi.updateProfile(form);
      }
      // For students, update name only
      return authApi.me();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const addExpertise = () => {
    if (!newExpertise.trim()) return;
    setForm((prev) => ({ ...prev, expertise_areas: [...prev.expertise_areas, newExpertise.trim()] }));
    setNewExpertise("");
  };

  const removeExpertise = (i: number) => {
    setForm((prev) => ({ ...prev, expertise_areas: prev.expertise_areas.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="app-shell flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">My Profile</h1>

        <div className="glass-panel p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-lg">{user?.full_name}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                user?.role === "teacher" ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300" :
                user?.role === "admin" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" :
                "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}>
                {user?.role}
              </span>
              {user?.is_verified && (
                <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
                  <Shield className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-5">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-slate-900 dark:text-white font-semibold">Basic Information</h2>
            <div>
              <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="modern-input text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">Email</label>
              <input
                value={user?.email || ""}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {isTeacher && (
            <>
              <div className="glass-panel p-6 space-y-4">
                <h2 className="text-slate-900 dark:text-white font-semibold">Teacher Profile</h2>
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell students about your background, expertise, and teaching style..."
                    className="modern-input text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">Expertise Areas</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                      placeholder="e.g., Machine Learning"
                      className="modern-input flex-1 px-4 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="modern-btn-primary px-3 py-2 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.expertise_areas.map((area, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs px-3 py-1.5 rounded-full"
                      >
                        {area}
                        <button type="button" onClick={() => removeExpertise(i)} className="ml-1 hover:text-slate-900 dark:hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 space-y-4">
                <h2 className="text-slate-900 dark:text-white font-semibold">Payout Details</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Add your bank details to receive earnings from courses</p>
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">UPI ID</label>
                  <input
                    value={form.payout_upi_id}
                    onChange={(e) => setForm({ ...form, payout_upi_id: e.target.value })}
                    placeholder="yourname@upi"
                    className="modern-input text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">Bank Account Number</label>
                    <input
                      value={form.payout_bank_account}
                      onChange={(e) => setForm({ ...form, payout_bank_account: e.target.value })}
                      placeholder="Account number"
                      className="modern-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-300 mb-1 block">IFSC Code</label>
                    <input
                      value={form.payout_ifsc}
                      onChange={(e) => setForm({ ...form, payout_ifsc: e.target.value })}
                      placeholder="SBIN0001234"
                      className="modern-input text-sm"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full modern-btn-primary py-3 font-medium"
          >
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
