"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Navbar } from "@/components/layout/Navbar";
import { materialsApi } from "@/lib/api";
import { ArrowLeft, Loader2, Upload, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";

export default function MaterialDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-materials"],
    queryFn: () => materialsApi.teacherList().then((r) => r.data),
  });

  const product = (data?.products || []).find((p: { id: string }) => p.id === id);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      try {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await materialsApi.uploadFiles(id, fd);
        toast({ title: "Files uploaded" });
        qc.invalidateQueries({ queryKey: ["teacher-materials"] });
      } catch (e) {
        toast({
          title: "Upload failed",
          description: getApiErrorMessage(e),
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [id, qc, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const publish = useMutation({
    mutationFn: () => materialsApi.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-materials"] });
      toast({ title: "Published" });
    },
    onError: (e) =>
      toast({
        title: "Publish failed",
        description: getApiErrorMessage(e),
        variant: "destructive",
      }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <p className="text-center py-20 text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/teacher/study-materials" className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>
        <h1 className="font-display font-extrabold text-2xl text-gray-900">{product.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Status: {product.status} · {product.slug}
        </p>

        <div
          {...getRootProps()}
          className={`mt-8 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-indigo-400 bg-indigo-50/50" : "border-gray-200 bg-white"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Drop PDFs or documents here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse</p>
          {uploading && <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mt-4" />}
        </div>

        {product.status !== "published" && (
          <button
            type="button"
            disabled={publish.isPending}
            onClick={() => publish.mutate()}
            className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {publish.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish to catalog
          </button>
        )}
      </div>
    </div>
  );
}
