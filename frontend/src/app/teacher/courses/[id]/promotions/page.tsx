"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Plus, Power, Trash2, Tag,
  Calendar, Percent, IndianRupee, CheckCircle2, Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { promotionsApi, teacherApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ active, starts, ends }: { active: boolean; starts: string; ends: string }) {
  const now  = Date.now();
  const s    = new Date(starts).getTime();
  const e    = new Date(ends).getTime();
  const live = active && now >= s && now <= e;
  const sched= active && now < s;
  const exp  = now > e;

  if (exp)   return <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-500"><Clock className="h-3 w-3" />Expired</span>;
  if (live)  return <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700"><CheckCircle2 className="h-3 w-3" />Live</span>;
  if (sched) return <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700"><Calendar className="h-3 w-3" />Scheduled</span>;
  return <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-500"><Power className="h-3 w-3" />Off</span>;
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

export default function PromotionsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [discount, setDiscount] = useState("");
  const [override, setOverride] = useState("");
  const [starts,   setStarts]   = useState("");
  const [ends,     setEnds]     = useState("");
  const [mode,     setMode]     = useState<"percent" | "fixed">("percent");

  const { data: course, isLoading } = useQuery({
    queryKey: ["teacher-course", id],
    queryFn:  () => teacherApi.getCourse(id).then(r => r.data),
  });

  const { data: promoData } = useQuery({
    queryKey: ["promotions", id],
    queryFn:  () => promotionsApi.listByCourse(id).then(r => r.data),
  });

  const promotions: any[] = promoData?.promotions || [];
  const activeCount = promotions.filter(p => p.is_active && Date.now() <= new Date(p.ends_at).getTime()).length;

  const createPromo = useMutation({
    mutationFn: () => {
      if (!starts || !ends) throw new Error("Start and end dates are required");
      const d = mode === "percent" && discount.trim() ? Number(discount) : undefined;
      const o = mode === "fixed"   && override.trim() ? Number(override) : undefined;
      if ((d == null || isNaN(d)) && (o == null || isNaN(o)))
        throw new Error("Set either a discount percentage or a fixed price override");
      if (new Date(ends).getTime() <= new Date(starts).getTime())
        throw new Error("End must be after start");
      return promotionsApi.create({
        course_id:  id,
        starts_at:  new Date(starts).toISOString(),
        ends_at:    new Date(ends).toISOString(),
        ...(d != null && !isNaN(d) ? { discount_percent: d } : {}),
        ...(o != null && !isNaN(o) ? { price_override: o }  : {}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions", id] });
      toast({ title: "Promotion created!" });
      setDiscount(""); setOverride(""); setStarts(""); setEnds("");
    },
    onError: (e: any) => toast({ title: e?.message || e?.response?.data?.detail || "Failed", variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: (promotionId: string) => promotionsApi.toggle(promotionId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["promotions", id] }),
  });

  const deletePromo = useMutation({
    mutationFn: (promotionId: string) => promotionsApi.delete(promotionId),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["promotions", id] }); toast({ title: "Promotion deleted" }); },
    onError:    () => toast({ title: "Couldn't delete", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Promotions" breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "My Courses", href: "/teacher/courses" }, { label: "Promotions" }]}>
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
      </DashboardLayout>
    );
  }

  const basePrice = course?.price ?? 0;

  return (
    <DashboardLayout
      title={course?.title || "Promotions"}
      subtitle="Create time-limited discounts and price overrides for your course"
      breadcrumbs={[
        { label: "Teacher",    href: "/teacher/dashboard" },
        { label: "My Courses", href: "/teacher/courses"   },
        { label: "Promotions"                              },
      ]}
    >
      <div className="max-w-3xl py-6">
        <CourseManageNav courseId={id} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Base Price",     value: basePrice === 0 ? "Free" : fmtRupee(basePrice), icon: IndianRupee, bg: "bg-violet-50", color: "text-violet-600" },
            { label: "Total Promos",   value: promotions.length,                               icon: Tag,         bg: "bg-blue-50",   color: "text-blue-600"  },
            { label: "Active / Live",  value: activeCount,                                     icon: CheckCircle2,bg: "bg-green-50",  color: "text-green-600" },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900 leading-none">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Create form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
              <Plus className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Create Promotion</h2>
              <p className="text-[11px] text-gray-400">Set a discount % or a fixed price override — not both</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Promo type toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "percent" as const, label: "Discount %",     icon: Percent,      desc: "e.g. 30% off base price"   },
                  { value: "fixed"   as const, label: "Fixed Price (₹)", icon: IndianRupee,  desc: "e.g. Override to ₹499"     },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button key={value} type="button" onClick={() => setMode(value)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      mode === value
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${mode === value ? "bg-violet-100" : "bg-gray-100"}`}>
                      <Icon className={`h-4 w-4 ${mode === value ? "text-violet-600" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${mode === value ? "text-violet-700" : "text-gray-700"}`}>{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Value input */}
            <div>
              {mode === "percent" ? (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount percentage</label>
                  <div className="relative">
                    <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                      min={1} max={100} placeholder="e.g. 30"
                      className={inputCls + " pr-10"} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                  </div>
                  {discount && !isNaN(Number(discount)) && basePrice > 0 && (
                    <p className="text-xs text-violet-600 mt-1 font-medium">
                      Students pay <strong>{fmtRupee(basePrice * (1 - Number(discount) / 100))}</strong> instead of {fmtRupee(basePrice)}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fixed price override (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                    <input type="number" value={override} onChange={e => setOverride(e.target.value)}
                      min={0} placeholder="e.g. 499"
                      className={inputCls + " pl-8"} />
                  </div>
                  {override && !isNaN(Number(override)) && basePrice > 0 && (
                    <p className="text-xs text-violet-600 mt-1 font-medium">
                      Saving <strong>{fmtRupee(basePrice - Number(override))}</strong> off the base price of {fmtRupee(basePrice)}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Starts
                </label>
                <input type="datetime-local" value={starts} onChange={e => setStarts(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Ends
                </label>
                <input type="datetime-local" value={ends} onChange={e => setEnds(e.target.value)} className={inputCls} />
              </div>
            </div>

            <button type="button" onClick={() => createPromo.mutate()} disabled={createPromo.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 transition-colors shadow-sm shadow-violet-200 disabled:opacity-50">
              {createPromo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Promotion
            </button>
          </div>
        </div>

        {/* Promotions list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
              <Tag className="h-3.5 w-3.5 text-green-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">All Promotions</h2>
            {promotions.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                {promotions.length} total
              </span>
            )}
          </div>

          {promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 mb-3">
                <Tag className="h-6 w-6 text-violet-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No promotions yet</p>
              <p className="text-xs text-gray-400">Create your first promotion to offer discounts to students.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {promotions.map((p: any) => {
                const isExpired = Date.now() > new Date(p.ends_at).getTime();
                return (
                  <div key={p.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${isExpired ? "opacity-60" : "hover:bg-violet-50/30"}`}>

                    {/* Icon */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                      p.discount_percent != null ? "bg-violet-100" : "bg-green-100"
                    }`}>
                      {p.discount_percent != null
                        ? <Percent className="h-5 w-5 text-violet-600" />
                        : <IndianRupee className="h-5 w-5 text-green-600" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          {p.discount_percent != null
                            ? `${p.discount_percent}% off`
                            : `Fixed price ${fmtRupee(p.price_override)}`}
                        </p>
                        <StatusBadge active={p.is_active} starts={p.starts_at} ends={p.ends_at} />
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {fmtDate(p.starts_at)} → {fmtDate(p.ends_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => toggle.mutate(p.id)} disabled={toggle.isPending || isExpired}
                        className={`inline-flex items-center gap-1.5 rounded-xl border text-[11px] font-bold px-3 py-1.5 transition-colors disabled:opacity-50 ${
                          p.is_active
                            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}>
                        <Power className="h-3 w-3" />
                        {p.is_active ? "On" : "Off"}
                      </button>
                      <button type="button" disabled={deletePromo.isPending}
                        onClick={() => { if (confirm("Delete this promotion?")) deletePromo.mutate(p.id); }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
