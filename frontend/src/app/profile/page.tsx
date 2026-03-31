"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi, teacherApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, Save, Loader2, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 transition-all";
const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
      <h2 className="font-display font-bold text-gray-900 text-base">{title}</h2>
      {children}
    </div>
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
    if (user) setForm((p) => ({ ...p, full_name: user.full_name || "" }));
  }, [user]);

  const { data: teacherProfile } = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: () => teacherApi.dashboard().then((r) => r.data?.teacher_profile),
    enabled: isTeacher,
  });

  useEffect(() => {
    if (teacherProfile) {
      setForm((p) => ({
        ...p,
        bio:                  teacherProfile.bio || "",
        expertise_areas:      teacherProfile.expertise_areas || [],
        payout_upi_id:        teacherProfile.payout_upi_id || "",
        payout_bank_account:  teacherProfile.payout_bank_account || "",
        payout_ifsc:          teacherProfile.payout_ifsc || "",
      }));
    }
  }, [teacherProfile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (isTeacher) return teacherApi.updateProfile(form);
      return authApi.me();
    },
    onSuccess: () => toast({ title: "Profile updated" }),
    onError:   () => toast({ title: "Failed to update profile", variant: "destructive" }),
  });

  const addExpertise = () => {
    if (!newExpertise.trim()) return;
    setForm((p) => ({ ...p, expertise_areas: [...p.expertise_areas, newExpertise.trim()] }));
    setNewExpertise("");
  };

  const removeExpertise = (i: number) => {
    setForm((p) => ({ ...p, expertise_areas: p.expertise_areas.filter((_, idx) => idx !== i) }));
  };

  const roleColor: Record<string, string> = {
    teacher: "bg-indigo-50 text-indigo-700 border-indigo-100",
    admin:   "bg-rose-50 text-rose-700 border-rose-100",
    student: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="font-display font-extrabold text-2xl text-gray-900 mb-8">My Profile</h1>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-gray-900 text-lg truncate">{user?.full_name}</p>
            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${roleColor[user?.role || "student"] || roleColor.student}`}>
                {user?.role}
              </span>
              {user?.is_verified && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Shield className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-4">

          {/* Basic Info */}
          <Card title="Basic Information">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={inputCls}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input
                value={user?.email || ""}
                disabled
                className={`${inputCls} opacity-50 cursor-not-allowed`}
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
          </Card>

          {/* Teacher-only sections */}
          {isTeacher && (
            <>
              <Card title="Teacher Profile">
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell students about your background, expertise, and teaching style..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Expertise Areas</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                      placeholder="e.g. Machine Learning"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  {form.expertise_areas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.expertise_areas.map((area, i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                          {area}
                          <button type="button" onClick={() => removeExpertise(i)} className="hover:text-indigo-900 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Payout Details">
                <p className="text-sm text-gray-500 -mt-1">Your earnings are transferred every 2 weeks to your bank account.</p>
                <div>
                  <label className={labelCls}>UPI ID</label>
                  <input
                    value={form.payout_upi_id}
                    onChange={(e) => setForm({ ...form, payout_upi_id: e.target.value })}
                    placeholder="yourname@upi"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Bank Account Number</label>
                    <input
                      value={form.payout_bank_account}
                      onChange={(e) => setForm({ ...form, payout_bank_account: e.target.value })}
                      placeholder="Account number"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>IFSC Code</label>
                    <input
                      value={form.payout_ifsc}
                      onChange={(e) => setForm({ ...form, payout_ifsc: e.target.value })}
                      placeholder="SBIN0001234"
                      className={inputCls}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-button-indigo"
          >
            {updateProfile.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
              : <><Save className="h-4 w-4" />Save Changes</>}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
