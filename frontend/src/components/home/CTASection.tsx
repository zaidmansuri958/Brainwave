"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot, Video, Shield, Briefcase, Users } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const features = [
  { icon: Bot,      label: "AI Tutor",      sub: "24/7 Support"          },
  { icon: Video,    label: "Live Classes",  sub: "Interactive"           },
  { icon: Shield,   label: "Certificates",  sub: "Industry Recognized"   },
  { icon: Briefcase,label: "Job Ready",     sub: "Real Projects"         },
];

export function CTASection() {
  const { isAuthenticated, user } = useAuthStore();
  const ctaHref = isAuthenticated()
    ? user?.role === "teacher" ? "/teacher/dashboard" : "/dashboard"
    : "/register";

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="mx-auto max-w-7xl">

        {/* Outer card — taller so left content fits without clipping */}
        <div className="relative rounded-3xl overflow-hidden min-h-[540px] bg-[#ece9ff]">

          {/* ── Left dark panel (diagonal clip) ─────────────────────────── */}
          <div
            className="absolute inset-y-0 left-0 z-10 w-[52%] bg-gradient-to-br from-[#2d0f6e] via-[#3b12a0] to-[#4a1fc1] flex flex-col justify-between py-12 px-10 lg:px-14"
            style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }}
          >
            {/* Top content — constrained to safe (non-clipped) width */}
            <div className="max-w-[72%]">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-7">
                <Users className="h-3.5 w-3.5 text-white/80" />
                <span className="text-xs font-semibold text-white/90">Join 50,000+ Learners</span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                <span className="text-white">Ready to Transform</span><br />
                <span className="text-violet-300">Your Future?</span>
              </h2>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed mb-7">
                Learn in-demand skills, get certified, work on real-world projects and land your dream career.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors shadow-lg"
                >
                  {isAuthenticated() ? "Go to Dashboard" : "Start Learning Free"} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Bottom feature pills — max-w keeps them inside non-clipped zone */}
            <div className="max-w-[68%]">
              <div className="flex items-start gap-5 mt-8">
                {features.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 border border-white/20 shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-[11px] font-semibold text-white text-center leading-tight">{label}</p>
                    <p className="text-[10px] text-white/50 text-center">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right light panel ────────────────────────────────────────── */}
          <div className="absolute inset-0 flex items-end justify-end">
            <Image
              src="/images/hero-student.png"
              alt="Student learning with Brainwave"
              width={520}
              height={520}
              className="object-contain object-bottom h-full w-auto"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
