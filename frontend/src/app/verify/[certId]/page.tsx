import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, XCircle, Award, Download } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

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
  if (!cert.valid) return { title: "Invalid Certificate | Brainwave" };
  return {
    title: `Certificate: ${cert.course_name} | Brainwave`,
    description: `${cert.student_name} completed ${cert.course_name} on Brainwave`,
  };
}

export default async function CertificateVerifyPage({ params }: { params: { certId: string } }) {
  const cert = await getCertificate(params.certId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {cert.valid ? (
            <div className="card overflow-hidden">
              <div className="bg-green-50 border-b border-green-100 p-6 text-center">
                <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="text-lg font-bold text-green-800">Certificate Verified</h1>
                <p className="text-sm text-green-600 mt-1">This certificate is authentic and issued by Brainwave</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-5 pb-5 border-b border-gray-100">
                  <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Certificate of Completion</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Student", value: cert.student_name },
                    { label: "Course", value: cert.course_name },
                    { label: "Instructor", value: cert.teacher_name },
                    { label: "Issued", value: new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "Certificate ID", value: params.certId.slice(0, 16) + "...", mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">{label}</span>
                      <span className={`text-sm font-medium text-gray-800 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>

                {cert.pdf_url && (
                  <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="btn btn-md btn-primary w-full justify-center mt-5">
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="bg-red-50 border-b border-red-100 p-6 text-center">
                <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="h-7 w-7 text-red-500" />
                </div>
                <h1 className="text-lg font-bold text-red-800">Invalid Certificate</h1>
                <p className="text-sm text-red-500 mt-1">This certificate could not be verified</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">This certificate may be expired, revoked, or the ID is incorrect.</p>
                <Link href="/" className="btn btn-md btn-secondary mt-4 inline-flex">Go home</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
