"use client";

import Link from "next/link";
import { ArrowRight, Upload, Cpu, Users, DollarSign, Video, BarChart3, Award, HelpCircle } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const steps = [
  { step: "01", icon: Upload, title: "Upload your material", desc: "Upload video lectures, PDFs, or slides in any format." },
  { step: "02", icon: Cpu, title: "AI builds the course", desc: "AI auto-generates chapters, lessons, quizzes, and summaries." },
  { step: "03", icon: Users, title: "Students enroll", desc: "Publish and students can find, enroll, and pay directly." },
  { step: "04", icon: DollarSign, title: "Earn and grow", desc: "Get paid with transparent payouts and track analytics." },
];

const features = [
  { icon: Video, title: "Live Sessions", desc: "Host live classes with Jitsi — recording, screen share, 100 participants." },
  { icon: HelpCircle, title: "Doubt Sessions", desc: "Create bookable 1-on-1 or group doubt clearing sessions." },
  { icon: BarChart3, title: "Analytics", desc: "Track enrollments, revenue, completion rates, and student progress." },
  { icon: Award, title: "Certificates", desc: "Auto-issue verified digital certificates on course completion." },
];

export default function ForTeachersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/40 to-white section-padding">
        <div className="page-container">
          <div className="max-w-3xl">
            <span className="section-eyebrow">For Educators</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mt-3">
              Turn your expertise into<br />
              <span className="text-blue-600">a thriving online course</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-xl">
              Upload your content and let AI build the course structure, quizzes, thumbnails, and more — in under an hour.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register?role=teacher" className="btn btn-lg btn-primary">
                Start teaching free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn btn-lg btn-secondary">View pricing</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">✓ No subscription fees</span>
              <span className="flex items-center gap-1.5">✓ Keep 90–92% of revenue</span>
              <span className="flex items-center gap-1.5">✓ Go live in under an hour</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="section-eyebrow">How it works</span>
            <h2 className="section-title">From upload to earning in hours</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="card p-6 relative">
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-11 -right-3 w-6 h-px bg-gray-200 z-10" />}
                <div className="h-11 w-11 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">{step}</span>
                <h3 className="text-[15px] font-semibold text-gray-900 mt-1 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="section-eyebrow">Platform Features</span>
            <h2 className="section-title">Everything a teacher needs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 card-hover flex gap-4">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 section-padding">
        <div className="page-container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to start teaching?</h2>
          <p className="text-blue-200 mb-8">Join 200+ educators already earning on Brainwave.</p>
          <Link href="/register?role=teacher" className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 font-semibold border-0">
            Create free teacher account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
