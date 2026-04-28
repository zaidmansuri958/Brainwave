import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Browse Courses", href: "/courses" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Search", href: "/search" },
  ],
  Product: [
    { label: "For Teachers", href: "/for-teachers" },
    { label: "Teacher Studio", href: "/teacher/dashboard" },
    { label: "Student Dashboard", href: "/dashboard" },
    { label: "Notifications", href: "/notifications" },
  ],
  Trust: [
    { label: "Certificates", href: "/features" },
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

const trustPoints = [
  { icon: Sparkles, title: "AI-native learning", body: "Course-aware tutoring, summaries, and adaptive study support." },
  { icon: GraduationCap, title: "Teacher-first creation", body: "Record once, publish beautifully, and manage cohorts with confidence." },
  { icon: ShieldCheck, title: "Trusted outcomes", body: "Verified certificates, transparent payouts, and dependable learner flows." },
];

export function Footer() {
  return (
    <footer className="mt-16 pb-8 pt-10 text-[#111111]">
      <div className="bw-shell">
        <div className="rounded-[30px] border-2 border-black bg-[#fff4d6] p-6 shadow-[8px_8px_0_#111111] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="eyebrow mb-4">Built for modern education</span>
              <h2 className="font-display text-3xl font-extrabold uppercase text-[#111111] sm:text-4xl">
                Bold learning. Clear actions. Playful confidence.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#2f2a24] sm:text-base">
                Brainwave helps educators launch premium learning experiences and gives students a guided home for progress,
                practice, and proof of achievement.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/register" className="bw-action-primary">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/courses" className="bw-action-secondary">
                  <BookOpen className="h-4 w-4" />
                  Explore courses
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {trustPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-[22px] border-2 border-black bg-white p-4 shadow-[4px_4px_0_#111111]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-black bg-[#8ed8ff] text-[#111111]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-base font-bold uppercase text-[#111111]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#2f2a24]">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section-line my-8" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-black bg-[#ffe500] text-black">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold uppercase text-[#111111]">Brainwave.ai</p>
                  <p className="text-sm text-[#2f2a24]">AI-powered learning, built with care in India.</p>
                </div>
              </Link>
            </div>

            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="bw-kicker mb-3">{group}</p>
                <div className="grid gap-2">
                  {links.map((link) => (
                    <Link key={link.label} href={link.href} className="text-sm font-bold text-[#2f2a24] transition hover:text-[#ff6b00]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 px-2 pt-5 text-sm font-bold text-[#6f6557] sm:flex-row">
          <p>© {new Date().getFullYear()} Brainwave Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Neo-brutalist interface refresh with no backend or workflow changes.</p>
        </div>
      </div>
    </footer>
  );
}
