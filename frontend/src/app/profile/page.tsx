"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi, teacherApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, Save, Loader2, Shield, BookOpen, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-8">My Profile</h1>

        <div className="glass-card p-6 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white shadow-glow">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-foreground font-semibold text-lg">{user?.full_name}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={user?.role === "teacher" ? "default" : "secondary"}>
                {user?.role}
              </Badge>
              {user?.is_verified && (
                <Badge variant="success" className="gap-1">
                  <Shield className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-foreground font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary-500" />
              Basic Information
            </h2>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Full Name</label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                variant="glass"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Email</label>
              <Input
                value={user?.email || ""}
                disabled
                variant="glass"
                className="opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          {isTeacher && (
            <>
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-foreground font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-500" />
                  Teacher Profile
                </h2>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell students about your background, expertise, and teaching style..."
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Expertise Areas</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                      placeholder="e.g., Machine Learning"
                      variant="glass"
                    />
                    <Button type="button" onClick={addExpertise} variant="gradient" size="md">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.expertise_areas.map((area, i) => (
                      <Badge key={i} variant="default" className="gap-1.5 py-1.5 px-3">
                        {area}
                        <button type="button" onClick={() => removeExpertise(i)} className="hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 space-y-5">
                <h2 className="text-foreground font-semibold">Payout Details</h2>
                <p className="text-muted-foreground text-sm">Add your bank details to receive earnings</p>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">UPI ID</label>
                  <Input
                    value={form.payout_upi_id}
                    onChange={(e) => setForm({ ...form, payout_upi_id: e.target.value })}
                    placeholder="yourname@upi"
                    variant="glass"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block font-medium">Bank Account</label>
                    <Input
                      value={form.payout_bank_account}
                      onChange={(e) => setForm({ ...form, payout_bank_account: e.target.value })}
                      placeholder="Account number"
                      variant="glass"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block font-medium">IFSC Code</label>
                    <Input
                      value={form.payout_ifsc}
                      onChange={(e) => setForm({ ...form, payout_ifsc: e.target.value })}
                      placeholder="SBIN0001234"
                      variant="glass"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            loading={updateProfile.isPending}
            className="w-full rounded-2xl"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
