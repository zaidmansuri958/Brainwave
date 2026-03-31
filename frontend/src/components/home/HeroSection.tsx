"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const up = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as any },
});

export function HeroSection() {
  return (
    <section style={{ background: "#FCF8F1" }} className="py-10 sm:py-16 lg:py-24 overflow-hidden">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">

          {/* ── LEFT ── */}
          <div>
            <motion.p {...up(0)} className="text-base font-semibold tracking-wider text-indigo-600 uppercase">
              AI-powered learning &amp; teaching platform
            </motion.p>

            <motion.h1
              {...up(0.07)}
              className="mt-4 lg:mt-8 font-display font-bold text-black"
              style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              Learn smarter,<br />teach better.
            </motion.h1>

            <motion.p {...up(0.14)} className="mt-4 lg:mt-8 text-base sm:text-xl text-gray-600 max-w-md leading-relaxed">
              Upload your lectures — our AI builds chapters, quizzes, summaries
              and a personal tutor for every student. In minutes.
            </motion.p>

            <motion.div {...up(0.22)}>
              <Link
                href="/register"
                className="inline-flex items-center gap-4 px-7 py-4 mt-8 lg:mt-16 font-semibold text-black transition-all duration-200 rounded-full hover:opacity-90 active:scale-[0.97]"
                style={{ background: "#FBBF24" }}
              >
                Join for free
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>

            <motion.p {...up(0.28)} className="mt-5 text-gray-500 text-sm">
              Already a member?{" "}
              <Link href="/login" className="text-black font-semibold transition-all duration-200 hover:underline underline-offset-2">
                Sign in
              </Link>
            </motion.p>
          </div>

          {/* ── RIGHT — illustration, not a card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            {/* Main blob */}
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(circle at 60% 40%, #6366f1 0%, #8b5cf6 50%, transparent 75%)" }}
            />

            {/* Illustration SVG */}
            <svg viewBox="0 0 520 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto relative">

              {/* Background circle */}
              <circle cx="280" cy="240" r="200" fill="#F0EDFF" opacity="0.6" />
              <circle cx="280" cy="240" r="155" fill="#E8E4FF" opacity="0.5" />

              {/* Central glow */}
              <circle cx="280" cy="240" r="110" fill="url(#centerGlow)" opacity="0.9" />

              {/* Book / Course card — main element */}
              <rect x="170" y="155" width="220" height="170" rx="16" fill="white" filter="url(#cardShadow)" />
              {/* Card header strip */}
              <rect x="170" y="155" width="220" height="52" rx="16" fill="url(#headerGrad)" />
              <rect x="170" y="187" width="220" height="20" fill="url(#headerGrad)" />
              {/* Title text lines */}
              <rect x="188" y="168" width="120" height="8" rx="4" fill="white" opacity="0.9" />
              <rect x="188" y="182" width="80" height="6" rx="3" fill="white" opacity="0.55" />
              {/* Progress bar */}
              <rect x="188" y="222" width="184" height="6" rx="3" fill="#F3F4F6" />
              <rect x="188" y="222" width="115" height="6" rx="3" fill="url(#progressGrad)" />
              {/* Lesson rows */}
              <circle cx="198" cy="248" r="8" fill="#6366f1" />
              <path d="M195 248l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="212" y="244" width="100" height="6" rx="3" fill="#E5E7EB" />
              <circle cx="198" cy="270" r="8" fill="#6366f1" />
              <path d="M195 270l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="212" y="266" width="80" height="6" rx="3" fill="#E5E7EB" />
              <circle cx="198" cy="292" r="8" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
              <rect x="212" y="288" width="120" height="6" rx="3" fill="#F3F4F6" />

              {/* AI bubble — top right */}
              <rect x="340" y="110" width="140" height="72" rx="14" fill="white" filter="url(#cardShadow)" />
              <rect x="340" y="110" width="140" height="72" rx="14" fill="url(#aiBubbleGrad)" opacity="0.08" />
              <circle cx="358" cy="128" r="10" fill="url(#headerGrad)" />
              <path d="M354 128l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="374" y="122" width="68" height="7" rx="3.5" fill="#6366f1" opacity="0.15" />
              <rect x="374" y="133" width="50" height="5" rx="2.5" fill="#6366f1" opacity="0.10" />
              <rect x="350" y="147" width="112" height="5" rx="2.5" fill="#6B7280" opacity="0.25" />
              <rect x="350" y="156" width="90" height="5" rx="2.5" fill="#6B7280" opacity="0.18" />

              {/* Teacher card — bottom left */}
              <rect x="50" y="290" width="148" height="76" rx="14" fill="white" filter="url(#cardShadow)" />
              <circle cx="76" cy="316" r="16" fill="url(#avatarGrad)" />
              <text x="70" y="321" fontSize="12" fontWeight="700" fill="white" fontFamily="system-ui">T</text>
              <rect x="100" y="308" width="80" height="7" rx="3.5" fill="#111827" opacity="0.7" />
              <rect x="100" y="320" width="56" height="5" rx="2.5" fill="#6B7280" opacity="0.4" />
              {/* Star rating */}
              <text x="98" y="352" fontSize="11" fill="#FBBF24" fontFamily="system-ui">★★★★★</text>
              <text x="143" y="352" fontSize="10" fill="#9CA3AF" fontFamily="system-ui">4.9</text>

              {/* Students joined badge — top left */}
              <rect x="32" y="148" width="128" height="48" rx="12" fill="white" filter="url(#cardShadow)" />
              <rect x="44" y="158" width="32" height="28" rx="8" fill="#F0EDFF" />
              <text x="51" y="177" fontSize="14" fontFamily="system-ui">🎓</text>
              <rect x="84" y="160" width="60" height="7" rx="3.5" fill="#111827" opacity="0.75" />
              <rect x="84" y="172" width="44" height="5" rx="2.5" fill="#6366f1" opacity="0.5" />

              {/* Floating dots decoration */}
              <circle cx="90"  cy="240" r="5" fill="#6366f1" opacity="0.2" />
              <circle cx="460" cy="200" r="4" fill="#8b5cf6" opacity="0.25" />
              <circle cx="440" cy="340" r="6" fill="#6366f1" opacity="0.15" />
              <circle cx="130" cy="390" r="4" fill="#8b5cf6" opacity="0.2" />
              <circle cx="390" cy="400" r="5" fill="#6366f1" opacity="0.15" />

              {/* Connecting lines */}
              <line x1="200" y1="228" x2="340" y2="175" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
              <line x1="195" y1="305" x2="198" y2="305" stroke="#6366f1" strokeWidth="1" opacity="0" />

              {/* Defs */}
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#EDE9FE" />
                  <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"   stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="aiBubbleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.07" />
                </filter>
              </defs>
            </svg>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
