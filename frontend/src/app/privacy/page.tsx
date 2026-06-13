"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect the information you provide when you create an account (name, email), enrol in courses, make payments, and use the platform. We also collect usage data such as lessons viewed, quiz attempts, and progress, which power your dashboard and certificates.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to deliver courses, track learning progress, issue certificates, process payments and payouts, provide the AI tutor, and send service emails (enrolment confirmations, certificates, reminders). We do not sell your personal data.",
  },
  {
    title: "3. Payments",
    body: "Payments are processed by Razorpay. We store a record of each transaction (amount, status, order/payment references) but never store your full card details — those are handled directly by the payment processor.",
  },
  {
    title: "4. Cookies & Local Storage",
    body: "We use browser local storage to keep you signed in and to remember preferences such as your AI-tutor chat history on a given device. These are not used for third-party advertising.",
  },
  {
    title: "5. Data Retention",
    body: "We retain your account and learning records for as long as your account is active. You may request deletion of your account and associated personal data by contacting us.",
  },
  {
    title: "6. Your Rights",
    body: "You can access and update your profile at any time from your account settings, request a copy of your data, or request deletion. Newsletter subscribers can unsubscribe at any time.",
  },
  {
    title: "7. Contact",
    body: "Questions about this policy can be sent to privacy@brainwave.ai.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
