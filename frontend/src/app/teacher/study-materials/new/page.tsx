"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { materialsApi } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewMaterialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("499");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await materialsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
      });
      toast({ title: "Product created" });
      router.push(`/teacher/study-materials/${data.id}`);
    } catch {
      toast({ title: "Could not create", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/teacher/study-materials" className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-display font-extrabold text-2xl text-gray-900 mb-6">New study material</h1>
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-semibold text-gray-500">Title</label>
            <input className={`${input} mt-1`} required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Description</label>
            <textarea className={`${input} mt-1 resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Price (INR)</label>
            <input
              type="number"
              min={0}
              className={`${input} mt-1`}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-60 flex justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create & upload files"}
          </button>
        </form>
      </div>
    </div>
  );
}
