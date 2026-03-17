import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, XCircle, Award, Download, ExternalLink } from "lucide-react";
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
            <div className="glass-card rounded-3xl overflow-hidden shadow-glass-lg">
              <div className="relative gradient-bg p-8 md:p-10 text-white text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2" />
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold">Certificate Verified</h1>
                  <p className="text-white/80 mt-1">This certificate is authentic and issued by Brainwave.ai</p>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div className="text-center border-b border-border/50 pb-5">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Certificate of Completion</h2>
                </div>

                <div className="space-y-4">
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
                    className="w-full flex items-center justify-center gap-2 gradient-bg text-white py-3.5 rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-glow mt-6"
                  >
                    <Download className="h-4 w-4" /> Download Certificate PDF
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 md:p-10 text-white text-center">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Invalid Certificate</h1>
                <p className="text-white/80 mt-1">This certificate could not be verified</p>
              </div>
              <div className="p-6 md:p-8 text-center text-muted-foreground">
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
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className={`text-sm font-semibold text-foreground max-w-xs text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
