"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Power, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { CourseManageNav } from "@/components/teacher/CourseManageNav";
import { promotionsApi, teacherApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function PromotionsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ["teacher-course", id],
    queryFn: () => teacherApi.getCourse(id).then((r) => r.data),
  });

  const { data: promoData } = useQuery({
    queryKey: ["promotions", id],
    queryFn: () => promotionsApi.listByCourse(id).then((r) => r.data),
  });

  const promotions = promoData?.promotions || [];

  const [discount, setDiscount] = useState("");
  const [override, setOverride] = useState("");
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");

  const createPromo = useMutation({
    mutationFn: () => {
      if (!starts || !ends) throw new Error("Start and end dates are required");
      const d = discount.trim() ? Number(discount) : undefined;
      const o = override.trim() ? Number(override) : undefined;
      if ((d == null || Number.isNaN(d)) && (o == null || Number.isNaN(o))) {
        throw new Error("Set either a discount percentage or a fixed price override");
      }
      const startMs = new Date(starts).getTime();
      const endMs = new Date(ends).getTime();
      if (endMs <= startMs) throw new Error("End must be after start");
      return promotionsApi.create({
        course_id: id,
        starts_at: new Date(starts).toISOString(),
        ends_at: new Date(ends).toISOString(),
        ...(d != null && !Number.isNaN(d) ? { discount_percent: d } : {}),
        ...(o != null && !Number.isNaN(o) ? { price_override: o } : {}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions", id] });
      toast({ title: "Promotion created" });
      setDiscount("");
      setOverride("");
      setStarts("");
      setEnds("");
    },
    onError: (e: unknown) => {
      const err = e as { message?: string; response?: { data?: { detail?: string } } };
      const msg = err?.message || err?.response?.data?.detail || "Failed";
      toast({ title: String(msg), variant: "destructive" });
    },
  });

  const toggle = useMutation({
    mutationFn: (promotionId: string) => promotionsApi.toggle(promotionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions", id] }),
  });

  const deletePromo = useMutation({
    mutationFn: (promotionId: string) => promotionsApi.delete(promotionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions", id] });
      toast({ title: "Promotion deleted" });
    },
    onError: () => toast({ title: "Couldn't delete promotion", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/courses" className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md">
            <ArrowLeft className="h-6 w-6 text-black" strokeWidth={3} />
          </Link>
          <div>
            <h1 className=" text-3xl  uppercase tracking-tight text-gray-900">Promotions</h1>
            <p className="text-sm font-bold text-gray-600">{course?.title}</p>
          </div>
        </div>

        <CourseManageNav courseId={id} />

        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm mb-10 mt-8">
          <h2 className=" text-2xl  uppercase tracking-tight text-gray-900 mb-2 flex items-center gap-3 border-b-4 border-black pb-2 inline-flex">
            <Plus className="h-6 w-6 text-black" strokeWidth={3} /> New Promotion
          </h2>
          <p className="text-sm font-bold text-gray-600 mb-6 mt-4">
            Set either a <strong>discount %</strong> or a fixed <strong>price override</strong> (INR). Leave one blank.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Discount %</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                placeholder="e.g. 20"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Price override (₹)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                placeholder="e.g. 499"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Starts</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                value={starts}
                onChange={(e) => setStarts(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Ends</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 shadow-sm outline-none transition-shadow focus:bg-white focus:shadow-[6px_6px_0_#ff6b00]"
                value={ends}
                onChange={(e) => setEnds(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={createPromo.isPending}
            onClick={() => createPromo.mutate()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-yellow-300 px-8 py-4 text-base font-semibold text-black shadow-sm transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md disabled:opacity-50"
          >
            {createPromo.isPending ? <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} /> : "Create Promotion"}
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-20">
          <div className="px-8 py-6 border-b-4 border-black bg-amber-50">
            <h2 className=" text-2xl  uppercase tracking-tight text-gray-900">Active & Scheduled</h2>
            <p className="text-sm font-bold text-gray-600 mt-1">Base price: {formatPrice(course?.price ?? 0)}</p>
          </div>
          {promotions.length === 0 ? (
            <p className="p-12 text-center text-lg  uppercase tracking-tight text-gray-400">No promotions yet.</p>
          ) : (
            <ul className="divide-y-4 divide-black">
              {promotions.map((p: any) => (
                <li key={p.id} className="px-8 py-6 flex flex-wrap items-center justify-between gap-6 transition-colors hover:bg-slate-50">
                  <div>
                    <p className="text-xl  uppercase tracking-tight text-gray-900">
                      {p.discount_percent != null ? `${p.discount_percent}% off` : ""}
                      {p.price_override != null ? `Override ${formatPrice(p.price_override)}` : ""}
                    </p>
                    <p className="text-sm font-bold text-gray-500 mt-2">
                      {new Date(p.starts_at).toLocaleString()} → {new Date(p.ends_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggle.mutate(p.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold  transition-transform hover:-translate-y-1 ${
                        p.is_active
                          ? "bg-green-100 text-black"
                          : "bg-white text-black"
                      }`}
                    >
                      <Power className="h-4 w-4" strokeWidth={3} />
                      {p.is_active ? "Active" : "Off"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm("Delete this promotion?")) deletePromo.mutate(p.id); }}
                      disabled={deletePromo.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-xs font-semibold  transition-transform hover:-translate-y-1 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
