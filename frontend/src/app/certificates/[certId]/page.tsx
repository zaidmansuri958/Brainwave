"use client";

import { useQuery } from "@tanstack/react-query";
import { certApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Download, Share2, Loader2, AlertTriangle, ExternalLink, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function fmtDuration(mins: number) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h} Hours` : `${mins} Min`;
}

// ── Certificate SVG/Canvas component ──────────────────────────────────────────
function CertificateCanvas({
  certId, studentName, courseName, teacherName,
  issuedAt, tags, durationMinutes, qrDataUrl,
}: {
  certId: string; studentName: string; courseName: string;
  teacherName: string; issuedAt: string; tags: string[];
  durationMinutes: number; qrDataUrl: string;
}) {
  const shortId  = certId.slice(0, 8).toUpperCase();
  const dateStr  = formatDate(issuedAt);
  const duration = fmtDuration(durationMinutes);

  return (
    <div id="certificate-card" style={{
      width: 1122, height: 794,
      position: "relative",
      background: "#ffffff",
      fontFamily: "Georgia, 'Times New Roman', serif",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>

      {/* ── Purple gradient border left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 28, height: "100%", background: "linear-gradient(to bottom, #7c3aed, #5b21b6, #4c1d95)" }} />
      {/* ── Purple gradient border right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 28, height: "100%", background: "linear-gradient(to bottom, #7c3aed, #5b21b6, #4c1d95)" }} />

      {/* ── Subtle top border */}
      <div style={{ position: "absolute", top: 0, left: 28, right: 28, height: 4, background: "#7c3aed" }} />
      {/* ── Subtle bottom border */}
      <div style={{ position: "absolute", bottom: 0, left: 28, right: 28, height: 4, background: "#7c3aed" }} />

      {/* ── Corner ornaments */}
      {[{t:4,l:28},{t:4,r:28},{b:4,l:28},{b:4,r:28}].map((pos, i) => (
        <div key={i} style={{
          position: "absolute",
          top:    "top"    in pos ? (pos as any).t  : undefined,
          bottom: "bottom" in pos ? (pos as any).b  : undefined,
          left:   "l"      in pos ? (pos as any).l  : undefined,
          right:  "r"      in pos ? (pos as any).r  : undefined,
          width: 40, height: 40,
          borderTop:    "top"    in pos ? "2px solid #a78bfa" : undefined,
          borderBottom: "bottom" in pos ? "2px solid #a78bfa" : undefined,
          borderLeft:   "l"      in pos ? "2px solid #a78bfa" : undefined,
          borderRight:  "r"      in pos ? "2px solid #a78bfa" : undefined,
        }} />
      ))}

      {/* ── Subtle background pattern (dots grid) */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.06) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        pointerEvents: "none",
      }} />

      {/* ── Main content area */}
      <div style={{ position: "absolute", top: 28, left: 56, right: 56, bottom: 28, display: "flex", flexDirection: "column" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 22, fontFamily: "Arial, sans-serif" }}>B</span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#1e1b4b", fontFamily: "Arial, sans-serif", lineHeight: 1 }}>Brainwave</div>
              <div style={{ fontSize: 9.5, color: "#6b7280", letterSpacing: 0.3, fontFamily: "Arial, sans-serif", marginTop: 2 }}>AI-Powered Learning Platform</div>
            </div>
          </div>

          {/* Verified Certificate image */}
          <img
            src="/images/verified-certificate.png"
            alt="Verified Certificate"
            width={96}
            height={96}
            style={{ objectFit: "contain" }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Certificate title */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#4c1d95",
            letterSpacing: 5, textTransform: "uppercase",
            fontFamily: "Arial, sans-serif", marginBottom: 8,
          }}>
            Certificate of Achievement
          </div>
          {/* Stars + line decoration */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 60, height: 1, background: "linear-gradient(to right, transparent, #7c3aed)" }} />
            <span style={{ color: "#7c3aed", fontSize: 12 }}>★ ★ ★</span>
            <div style={{ width: 60, height: 1, background: "linear-gradient(to left, transparent, #7c3aed)" }} />
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", marginBottom: 12 }}>This certifies that</div>

          {/* Student name */}
          <div style={{
            fontSize: 54, fontWeight: 900, color: "#1e1b4b",
            letterSpacing: 3, textTransform: "uppercase",
            fontFamily: "'Georgia', serif", lineHeight: 1, marginBottom: 10,
          }}>
            {studentName.toUpperCase()}
          </div>

          <div style={{ fontSize: 12.5, color: "#4b5563", marginBottom: 8 }}>has successfully completed the course</div>

          {/* Course name */}
          <div style={{
            fontSize: 26, fontWeight: 700, color: "#5b21b6",
            lineHeight: 1.2, maxWidth: 700, margin: "0 auto 8px",
            fontFamily: "Arial, sans-serif",
          }}>
            {courseName}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            as taught by <strong style={{ color: "#374151" }}>{teacherName}</strong>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {tags.slice(0, 6).map((tag, i) => (
              <div key={i} style={{
                border: "1px solid #ddd6fe", borderRadius: 20,
                padding: "4px 12px", fontSize: 10.5,
                color: "#5b21b6", background: "#f5f3ff",
                fontFamily: "Arial, sans-serif", fontWeight: 500,
              }}>
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={{
          border: "1px solid #e5e7eb", borderRadius: 12,
          display: "flex", justifyContent: "space-around",
          padding: "12px 20px", marginBottom: 18,
          background: "rgba(245,243,255,0.5)",
        }}>
          {[
            { icon: "⏱", label: "DURATION",         value: duration   },
            { icon: "📅", label: "COMPLETION DATE",  value: dateStr    },
            { icon: "🏆", label: "ACHIEVEMENT",      value: "Completed"},
            { icon: "🔐", label: "CERTIFICATE ID",   value: shortId    },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ textAlign: "center", padding: "0 12px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: "#9ca3af", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Bottom row: Instructor sig | QR code | Brainwave sig */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flex: 1 }}>

          {/* Instructor signature */}
          <div style={{ textAlign: "center", minWidth: 180 }}>
            <div style={{
              fontSize: 22, color: "#3730a3", marginBottom: 4,
              fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
              fontStyle: "italic",
            }}>
              {teacherName}
            </div>
            <div style={{ width: 140, height: 1, background: "#d1d5db", margin: "4px auto 6px" }} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{teacherName}</div>
            <div style={{ fontSize: 9.5, color: "#6b7280", fontFamily: "Arial, sans-serif" }}>Course Instructor</div>
          </div>

          {/* QR code box */}
          <div style={{
            border: "1.5px solid #ddd6fe", borderRadius: 12,
            padding: "12px 16px", textAlign: "center",
            background: "#fff",
          }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} width={90} height={90} alt="QR Code" style={{ display: "block", margin: "0 auto 6px" }} />
            ) : (
              <div style={{ width: 90, height: 90, background: "#f3f4f6", borderRadius: 8, margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "Arial" }}>QR Code</span>
              </div>
            )}
            <div style={{ fontSize: 9, color: "#6b7280", fontFamily: "Arial, sans-serif", marginBottom: 2 }}>Scan to verify</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#5b21b6", fontFamily: "Arial, sans-serif", letterSpacing: 0.5 }}>
              Certificate ID: {shortId}
            </div>
          </div>

          {/* Brainwave signature */}
          <div style={{ textAlign: "center", minWidth: 180 }}>
            <div style={{
              fontSize: 22, color: "#3730a3", marginBottom: 4,
              fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
              fontStyle: "italic",
            }}>
              Brainwave
            </div>
            <div style={{ width: 140, height: 1, background: "#d1d5db", margin: "4px auto 6px" }} />
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Brainwave Team</div>
            <div style={{ fontSize: 9.5, color: "#6b7280", fontFamily: "Arial, sans-serif" }}>AI-Powered Learning Platform</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, paddingTop: 10, marginTop: 4,
          borderTop: "1px solid #f3f4f6",
        }}>
          <span style={{ fontSize: 11, color: "#7c3aed" }}>🔒</span>
          <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "Arial, sans-serif", letterSpacing: 0.3 }}>
            This certificate is securely issued and verified by Brainwave
          </span>
        </div>

      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function CertificateDetailPage({ params }: { params: { certId: string } }) {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl]     = useState("");

  const { data: cert, isLoading, isError } = useQuery({
    queryKey: ["certificate", params.certId],
    queryFn:  () => certApi.get(params.certId).then(r => r.data),
  });

  // Fetch course for tags + duration (course_id available on cert)
  const { data: courseData } = useQuery({
    queryKey: ["cert-course", cert?.course_id],
    queryFn:  () => courseApi.get(cert!.course_id).then(r => r.data),
    enabled:  !!cert?.course_id,
  });

  // Generate QR code once cert is loaded
  useEffect(() => {
    if (!cert) return;
    const verifyUrl = `${window.location.origin}/verify/${params.certId}`;
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(verifyUrl, {
        width: 180, margin: 1,
        color: { dark: "#3730a3", light: "#ffffff" },
      }).then(url => setQrDataUrl(url));
    });
  }, [cert, params.certId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const el = document.getElementById("certificate-card");
      if (!el) return;

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF }   = await import("jspdf");

      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      // A4 landscape: 297mm × 210mm
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      const filename = `Brainwave_Certificate_${params.certId.slice(0, 8).toUpperCase()}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF generation failed. Try Ctrl+P → Save as PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/verify/${params.certId}`;
    try {
      if (navigator.share) await navigator.share({ title: "My Brainwave Certificate", url });
      else { await navigator.clipboard.writeText(url); alert("Verification link copied!"); }
    } catch {}
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
    </div>
  );

  if (isError || !cert) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <p className="text-lg font-bold text-gray-900 mb-2">Certificate not found</p>
        <Link href="/certificates" className="text-violet-600 font-semibold hover:underline">← Back to certificates</Link>
      </div>
    </div>
  );

  const studentName     = cert.student_name || user?.full_name || "Student";
  const tags: string[]  = courseData?.tags || [];
  const durationMinutes = courseData?.total_duration_minutes || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Action bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">{cert.course_name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Issued {formatDate(cert.issued_at)} · ID: {params.certId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/verify/${params.certId}`} target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold px-3 py-2.5 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Verify
            </Link>
            <button onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2.5 transition-colors">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-sm shadow-violet-200 disabled:opacity-70">
              {downloading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                : <><Download className="h-3.5 w-3.5" /> Download PDF</>}
            </button>
          </div>
        </div>
      </div>

      {/* Certificate preview — scale down to fit screen */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="overflow-x-auto rounded-2xl shadow-2xl">
          <div style={{ width: 1122 }}>
            <CertificateCanvas
              certId={params.certId}
              studentName={studentName}
              courseName={cert.course_name}
              teacherName={cert.teacher_name}
              issuedAt={cert.issued_at}
              tags={tags}
              durationMinutes={durationMinutes}
              qrDataUrl={qrDataUrl}
            />
          </div>
        </div>
        <div className="text-center mt-6">
          <Link href="/certificates" className="text-sm text-gray-400 hover:text-violet-600 transition-colors">
            ← Back to all certificates
          </Link>
        </div>
      </div>
    </div>
  );
}
