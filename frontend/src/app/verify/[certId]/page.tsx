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
    <div className="bw-page flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {cert.valid ? (
            <div className="overflow-hidden rounded-[28px] border-2 border-black bg-white shadow-[6px_6px_0_#111111]">
              <div className="border-b-2 border-black bg-[#dff8df] p-6 text-center text-[#111111]">
                <CheckCircle className="h-16 w-16 mx-auto mb-3" />
                <h1 className="font-display text-2xl font-bold uppercase">Certificate Verified</h1>
                <p className="mt-1 font-medium">This certificate is authentic and issued by Brainwave.ai</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="border-b-2 border-black pb-4 text-center">
                  <Award className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <h2 className="font-display text-xl font-bold uppercase text-gray-900">
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
                    className="neo-primary-btn mt-4 flex w-full py-3"
                  >
                    Download Certificate PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border-2 border-black bg-white shadow-[6px_6px_0_#111111]">
              <div className="border-b-2 border-black bg-[#ffd6d6] p-6 text-center text-[#111111]">
                <XCircle className="h-16 w-16 mx-auto mb-3" />
                <h1 className="font-display text-2xl font-bold uppercase">Invalid Certificate</h1>
                <p className="mt-1 font-medium">This certificate could not be verified</p>
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
    <div className="flex items-start justify-between gap-4 rounded-[16px] border-2 border-black bg-[#fff4d6] px-4 py-3 shadow-[3px_3px_0_#111111]">
      <span className="text-sm font-extrabold uppercase text-gray-500">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 max-w-xs text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
