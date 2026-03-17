import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, XCircle, Award } from "lucide-react";
import { Metadata } from "next";

async function getCertificate(certId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api/v1"}/certificates/verify/${certId}`,
      { cache: "no-store" }
    );
    return res.json();
  } catch {
    return { valid: false };
  }
}

export async function generateMetadata({ params }: { params: { certId: string } }): Promise<Metadata> {
  const cert = await getCertificate(params.certId);
  if (!cert.valid) return { title: "Invalid Certificate | Brainwave.ai" };
  return {
    title: `Certificate: ${cert.course_name} | Brainwave.ai`,
    description: `${cert.student_name} completed ${cert.course_name} on Brainwave.ai`,
  };
}

export default async function CertificateVerifyPage({ params }: { params: { certId: string } }) {
  const cert = await getCertificate(params.certId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full">
          {cert.valid ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-green-200 dark:border-green-800 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-3" />
                <h1 className="text-2xl font-bold">Certificate Verified ✓</h1>
                <p className="text-green-100 mt-1">This certificate is authentic and issued by Brainwave.ai</p>
              </div>

              {/* Certificate Details */}
              <div className="p-6 space-y-4">
                <div className="text-center border-b border-gray-100 dark:border-gray-700 pb-4">
                  <Award className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Certificate of Completion
                  </h2>
                </div>

                <div className="space-y-3">
                  <InfoRow label="Student Name" value={cert.student_name} />
                  <InfoRow label="Course" value={cert.course_name} />
                  <InfoRow label="Instructor" value={cert.teacher_name} />
                  <InfoRow
                    label="Issue Date"
                    value={new Date(cert.issued_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <InfoRow label="Certificate ID" value={params.certId.slice(0, 16) + "..."} mono />
                </div>

                {cert.pdf_url && (
                  <a
                    href={cert.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors mt-4"
                  >
                    Download Certificate PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
                <XCircle className="h-16 w-16 mx-auto mb-3" />
                <h1 className="text-2xl font-bold">Invalid Certificate</h1>
                <p className="text-red-100 mt-1">This certificate could not be verified</p>
              </div>
              <div className="p-6 text-center text-gray-500">
                <p>This certificate may be expired, revoked, or the ID is incorrect.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}:</span>
      <span className={`text-sm font-semibold text-gray-900 dark:text-white max-w-xs text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
