"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import {
  ClipboardList, Loader2, Plus, FileText,
  Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight,
  BookOpen, Timer,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function fmtRupee(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:     "bg-amber-50  text-amber-700  border-amber-200",
    published: "bg-green-50  text-green-700  border-green-200",
    archived:  "bg-gray-100  text-gray-500   border-gray-200",
  };
  const icons: Record<string, React.ElementType> = {
    draft:     AlertCircle,
    published: CheckCircle2,
    archived:  EyeOff,
  };
  const Icon = icons[status] ?? Eye;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${map[status] ?? map.draft}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}

export default function TeacherMockTestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-mock-packages"],
    queryFn:  () => mockTestsApi.teacherList().then(r => r.data),
  });

  const packages: any[] = data?.packages || [];

  const published = packages.filter(p => p.status === "published").length;
  const draft     = packages.filter(p => p.status === "draft").length;

  return (
    <DashboardLayout
      title="Mock Test Packages"
      subtitle="Build timed test papers with MCQs — students get instant scores"
      breadcrumbs={[{ label: "Teacher", href: "/teacher/dashboard" }, { label: "Mock Tests" }]}
    >
      <div className="max-w-4xl py-6">

        {/* Header action + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-4">
            {[
              { label: "Total",     value: packages.length, color: "text-gray-900"  },
              { label: "Published", value: published,       color: "text-green-600" },
              { label: "Draft",     value: draft,           color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 text-center min-w-[72px]">
                <p className={`text-xl font-extrabold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <Link
            href="/teacher/mock-tests/new"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" /> New Package
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
              <ClipboardList className="h-8 w-8 text-violet-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">No packages yet</p>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              Create a test package with multiple papers, sections, and MCQs. Students pay once and get timed attempts with instant scores.
            </p>
            <Link
              href="/teacher/mock-tests/new"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition-colors"
            >
              <Plus className="h-4 w-4" /> Create a package
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/teacher/mock-tests/${p.id}`}
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all"
                >
                  {/* Icon */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shrink-0">
                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors truncate">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={p.status} />
                      {p.papers_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <BookOpen className="h-3 w-3" />
                          {p.papers_count} paper{p.papers_count !== 1 ? "s" : ""}
                        </span>
                      )}
                      {p.total_duration_minutes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Timer className="h-3 w-3" />
                          {p.total_duration_minutes} mins total
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-base font-extrabold ${p.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                      {p.price === 0 ? "Free" : fmtRupee(p.price)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* How it works banner */}
        {packages.length > 0 && (
          <div className="mt-6 bg-indigo-50 rounded-2xl border border-indigo-100 p-5 flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 shrink-0">
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Published packages appear in the <strong>Mock Tests catalog</strong>. Each package can contain multiple papers with timed sections and MCQs. Students are auto-graded on submission.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
