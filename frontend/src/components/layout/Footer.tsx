"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Linkedin, Twitter, Youtube, Instagram,
  LayoutGrid, GraduationCap, UserCheck, Building2,
  Star, Users, BookOpen, Award,
  ShieldCheck, Lock, ArrowRight, CheckCircle2,
} from "lucide-react";

// ─── Link data ─────────────────────────────────────────────────────────────────
const footerColumns = [
  {
    icon: LayoutGrid,
    title: "Platform",
    links: [
      { label: "Browse Courses",      href: "/courses" },
      { label: "How It Works",        href: "/features" },
      { label: "Pricing",             href: "/pricing" },
      { label: "Success Stories",     href: "#" },
      { label: "Certificates",        href: "/features" },
      { label: "Become an Affiliate", href: "#" },
    ],
  },
  {
    icon: GraduationCap,
    title: "For Learners",
    links: [
      { label: "Learning Paths",  href: "/courses" },
      { label: "Blog",            href: "#" },
      { label: "Community",       href: "/features" },
      { label: "Student Support", href: "#" },
      { label: "FAQs",            href: "#" },
    ],
  },
  {
    icon: UserCheck,
    title: "For Teachers",
    links: [
      { label: "Teach on Brainwave",  href: "/for-teachers" },
      { label: "Teacher Resources",   href: "/for-teachers" },
      { label: "Earnings",            href: "/for-teachers" },
      { label: "Instructor Guide",    href: "/for-teachers" },
      { label: "Help Center",         href: "#" },
    ],
  },
  {
    icon: Building2,
    title: "Company",
    links: [
      { label: "About Us",        href: "#" },
      { label: "Careers",         href: "#" },
      { label: "Contact Us",      href: "#" },
      { label: "Press Kit",       href: "#" },
      { label: "Privacy Policy",  href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

const stats = [
  { icon: Users,         iconBg: "bg-violet-100",   iconColor: "text-violet-600", value: "50K+",  label: "Active Learners"   },
  { icon: GraduationCap, iconBg: "bg-emerald-100",  iconColor: "text-emerald-600",value: "1K+",   label: "Expert Teachers"   },
  { icon: BookOpen,      iconBg: "bg-blue-100",     iconColor: "text-blue-600",   value: "10M+",  label: "Lessons Delivered" },
  { icon: Star,          iconBg: "bg-amber-100",    iconColor: "text-amber-500",  value: "95%",   label: "Satisfaction Rate" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="bg-white">

      {/* ── Newsletter banner ──────────────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-violet-50/60 border border-violet-100 rounded-2xl px-8 py-8">

            {/* Illustration */}
            <div className="shrink-0 hidden sm:block">
              <Image
                src="/images/send-ticket.png"
                alt="Newsletter"
                width={120}
                height={100}
                className="object-contain"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">
                Stay ahead.{" "}
                <span className="text-violet-600">Keep learning.</span>
              </h3>
              <p className="mt-1.5 text-sm text-gray-500 max-w-sm">
                Subscribe to our newsletter and get the latest courses, tips, and exclusive offers.
              </p>
            </div>

            {/* Subscribe form */}
            <div className="w-full md:w-auto md:min-w-[380px]">
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm justify-center md:justify-start">
                  <CheckCircle2 className="h-5 w-5" />
                  You're subscribed! Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-0">
                  <div className="flex flex-1 items-center gap-2 bg-white border border-gray-200 rounded-l-xl px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-5 py-3 rounded-r-xl transition-colors shrink-0"
                  >
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
              <div className="flex items-center gap-1.5 mt-2 justify-center md:justify-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-xs text-gray-400">No spam, unsubscribe anytime.</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main footer links ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/images/logo.png"
                alt="Brainwave"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover shrink-0"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Brainwave</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-[200px]">
              Empowering learners worldwide with high-quality education and expert-led courses.
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-5">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">4.8/5</span>
            </div>
            <p className="text-xs text-gray-400 -mt-3 mb-5">from 24k+ learners</p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map(({ icon: Icon, title, links }) => (
            <div key={title}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                  <Icon className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
              </div>
              <div className="space-y-2.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-gray-500 hover:text-violet-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <div className="mt-12 rounded-2xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200 overflow-hidden">
          {stats.map(({ icon: Icon, iconBg, iconColor, value, label }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900 leading-tight">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dark bottom bar ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1145] via-[#1e1560] to-[#0f0a2e] rounded-t-3xl mt-2">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Secure & Trusted */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30">
                <ShieldCheck className="h-6 w-6 text-violet-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure &amp; Trusted</p>
                <p className="text-xs text-white/50 mt-0.5">Your data is protected with enterprise-grade security.</p>
              </div>
            </div>

            {/* Payment methods + SSL */}
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {/* Payment card logos */}
              <div className="flex items-center gap-2">
                {/* Visa — styled text (SVG unreliable) */}
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center justify-center h-9 min-w-[56px]">
                  <span className="text-[#1a1f71] font-black text-sm tracking-widest italic">VISA</span>
                </div>

                {/* Mastercard — SVG works */}
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm flex items-center justify-center h-9 min-w-[56px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={32} height={20} className="h-5 w-auto object-contain" />
                </div>

                {/* Razorpay */}
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm flex items-center justify-center h-9 min-w-[72px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" width={70} height={16} className="h-4 w-auto object-contain" />
                </div>

                {/* PayPal — SVG works */}
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm flex items-center justify-center h-9 min-w-[64px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={60} height={16} className="h-4 w-auto object-contain" />
                </div>
              </div>

              <div className="w-px h-8 bg-white/20 hidden sm:block" />

              {/* SSL badge */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                  <Lock className="h-4 w-4 text-white/70" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">SSL Secured</p>
                  <p className="text-[10px] text-white/40">256-bit encryption</p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/40 shrink-0 text-center md:text-right">
              © {new Date().getFullYear()} Brainwave. All rights reserved.
            </p>

          </div>
        </div>
      </div>

    </footer>
  );
}
