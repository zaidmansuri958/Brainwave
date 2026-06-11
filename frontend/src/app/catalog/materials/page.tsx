"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { materialsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileStack, Loader2, Search, FileText,
  Download, ArrowRight, Star, X,
  Zap, Shield, BookOpen,
} from "lucide-react";
import { useState } from "react";

function fmtRupee(n: number) {
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

type Filter = "all" | "free" | "paid" | "pdf" | "doc" | "ppt";

const FILE_CFG: Record<string, { color: string; bg: string; bar: string; label: string }> = {
  pdf:     { color: "text-red-600",    bg: "bg-red-50",    bar: "from-red-500 to-rose-500",       label: "PDF"          },
  doc:     { color: "text-blue-600",   bg: "bg-blue-50",   bar: "from-blue-500 to-indigo-500",    label: "Document"     },
  ppt:     { color: "text-orange-600", bg: "bg-orange-50", bar: "from-orange-500 to-amber-500",   label: "Presentation" },
  default: { color: "text-violet-600", bg: "bg-violet-50", bar: "from-violet-500 to-indigo-500",  label: "Bundle"       },
};

export default function MaterialsCatalogPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["materials-catalog"],
    queryFn: () => materialsApi.catalog().then((r) => r.data),
  });

  const all: any[] = data?.items || [];
  const items = all.filter((item) => {
    const q = !search || item.title?.toLowerCase().includes(search.toLowerCase());
    const f =
      filter === "free" ? item.price === 0 :
      filter === "paid" ? item.price > 0 :
      filter === "pdf"  ? item.primary_file_type === "pdf" :
      filter === "doc"  ? item.primary_file_type === "doc" :
      filter === "ppt"  ? item.primary_file_type === "ppt" :
      true;
    return q && f;
  });

  const freeCount  = all.filter((i) => i.price === 0).length;
  const totalFiles = all.reduce((s, i) => s + (i.files_count || 0), 0);
  const hasFilters = search || filter !== "all";

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all",  label: "All"          },
    { value: "free", label: "Free"         },
    { value: "paid", label: "Paid"         },
    { value: "pdf",  label: "PDF"          },
    { value: "doc",  label: "Documents"    },
    { value: "ppt",  label: "Slides"       },
  ];

  return (
    <DashboardLayout
      title="Study Materials"
      subtitle="Notes, PDFs, and bundles from verified teachers — instant access after purchase"
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: FileStack,  label: "Total Items",  value: all.length,  color: "blue"   },
          { icon: Zap,        label: "Free Items",   value: freeCount,   color: "green"  },
          { icon: Download,   label: "Total Files",  value: totalFiles,  color: "orange" },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
              s.color === "blue"   ? "bg-blue-50 text-blue-600" :
              s.color === "green"  ? "bg-green-50 text-green-600" :
              "bg-orange-50 text-orange-600"
            }`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study materials…"
            className="input !pl-10"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="btn btn-md btn-secondary flex items-center gap-1.5 shrink-0"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          {items.length} item{items.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-2 bg-gray-100 rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="flex gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <FileStack className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 mb-1">
            {hasFilters ? "No materials match your filters" : "No study materials yet"}
          </p>
          <p className="text-sm text-gray-400">
            {hasFilters
              ? "Try adjusting your search or filter"
              : "Teachers are uploading materials — check back soon!"}
          </p>
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="btn btn-md btn-secondary mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => {
            const key = (item.primary_file_type || "default") as keyof typeof FILE_CFG;
            const cfg = FILE_CFG[key] ?? FILE_CFG.default;

            return (
              <Link
                key={item.id}
                href={`/catalog/materials/${item.slug}`}
                className="card group hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Accent bar */}
                <div className={`h-1 bg-gradient-to-r ${cfg.bar}`} />

                <div className="p-5 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} shrink-0`}>
                      <FileText className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className={`text-sm font-bold ${item.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                        {fmtRupee(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                  )}

                  {/* Footer meta */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {item.files_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" />
                          {item.files_count} file{item.files_count !== 1 ? "s" : ""}
                        </span>
                      )}
                      {Number(item.avg_rating) > 0 && (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {Number(item.avg_rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Info strip */}
      {!isLoading && all.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap,      color: "bg-amber-50 text-amber-600",  title: "Instant Access",     desc: "Download immediately after purchase" },
            { icon: Shield,   color: "bg-green-50 text-green-600",  title: "Verified Teachers",  desc: "All materials by verified educators" },
            { icon: BookOpen, color: "bg-blue-50 text-blue-600",    title: "Organized Bundles",  desc: "Easy-to-follow sets and collections" },
          ].map((f) => (
            <div key={f.title} className="card p-4 flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${f.color} shrink-0`}>
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
