"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Power } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="bw-page min-h-screen">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff6b00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bw-page min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/courses" className="neo-secondary-btn h-10 w-10 rounded-full px-0 py-0 text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase text-gray-900">Promotions</h1>
            <p className="text-gray-500 text-sm">{course?.title}</p>
          </div>
        </div>

        <CourseManageNav courseId={id} />

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" /> New promotion
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Set either a <strong>discount %</strong> or a fixed <strong>price override</strong> (INR). Leave one blank.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">Discount %</label>
              <input
                type="number"
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. 20"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Price override (₹)</label>
              <input
                type="number"
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. 499"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Starts</label>
              <input
                type="datetime-local"
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                value={starts}
                onChange={(e) => setStarts(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Ends</label>
              <input
                type="datetime-local"
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                value={ends}
                onChange={(e) => setEnds(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={createPromo.isPending}
            onClick={() => createPromo.mutate()}
            className="neo-primary-btn px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {createPromo.isPending ? "Creating…" : "Create promotion"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-gray-900">Active & scheduled</h2>
            <p className="text-sm text-gray-500">Base price: {formatPrice(course?.price ?? 0)}</p>
          </div>
          {promotions.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">No promotions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {promotions.map((p: any) => (
                <li key={p.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.discount_percent != null ? `${p.discount_percent}% off` : ""}
                      {p.price_override != null ? `Override ${formatPrice(p.price_override)}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.starts_at).toLocaleString()} → {new Date(p.ends_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle.mutate(p.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      p.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {p.is_active ? "Active" : "Off"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
