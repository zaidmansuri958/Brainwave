"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { certApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Award, Download, ExternalLink, Loader2, CheckCircle2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CertificatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn:  () => certApi.myCertificates().then(r => r.data),
  });

  const certificates: any[] = data?.certificates || [];

  return (
    <DashboardLayout
      title="My Certificates"
      subtitle="Verified certificates earned by completing courses"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Certificates" }]}
    >
      <div className="max-w-4xl py-6">

        {/* Count badge */}
        {certificates.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-2 text-sm font-semibold text-violet-700 mb-6">
            <Award className="h-4 w-4" />
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
              <Award className="h-8 w-8 text-violet-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">No certificates yet</p>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-sm">
              Complete a course with certificate enabled to earn your first verified certificate.
            </p>
            <Link href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-5 py-2.5 transition-colors">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert: any) => (
              <div key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all overflow-hidden">

                {/* Certificate banner */}
                <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 px-6 py-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Certificate of Completion</span>
                    </div>
                    <p className="text-white font-extrabold text-base leading-tight line-clamp-2">
                      {cert.course_title || cert.course?.title || "Course"}
                    </p>
                  </div>
                  {/* Decorative checkmark */}
                  <div className="absolute bottom-3 right-4">
                    <CheckCircle2 className="h-10 w-10 text-white/20" />
                  </div>
                </div>

                {/* Details */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <Calendar className="h-3.5 w-3.5" />
                    Issued {cert.issued_at ? formatDate(cert.issued_at) : "—"}
                  </div>

                  {/* Verify ID */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400">Certificate ID</span>
                    <span className="text-[11px] font-mono text-gray-600 truncate max-w-[140px]">
                      {cert.id?.slice(0, 8).toUpperCase()}…
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/certificates/${cert.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 transition-colors shadow-sm shadow-violet-200">
                      <ExternalLink className="h-3.5 w-3.5" /> View &amp; Download
                    </Link>
                    <Link href={`/verify/${cert.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3 py-2.5 transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
