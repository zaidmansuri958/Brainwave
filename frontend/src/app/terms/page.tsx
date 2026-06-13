"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using Brainwave, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Accounts",
    body: "You are responsible for keeping your login credentials secure and for all activity under your account. You must provide accurate information when registering.",
  },
  {
    title: "3. Courses & Content",
    body: "Course content is owned by the instructors who publish it. Enrolling grants you a personal, non-transferable licence to access that content for learning. You may not redistribute, resell, or publicly share paid course materials.",
  },
  {
    title: "4. Payments & Access",
    body: "Course, mock-test, and study-material prices are shown at checkout, inclusive of any active promotions. Access is granted once payment is confirmed. Free items are added to your library immediately.",
  },
  {
    title: "5. Refunds",
    body: "Refunds may be requested within the eligibility window after purchase, provided you have not completed a substantial portion of the content. Approved refunds are returned to your original payment method. Refund requests are reviewed by our team.",
  },
  {
    title: "6. Instructor Earnings",
    body: "Instructors earn revenue from their sales, less the applicable platform fee. Payouts are made to verified bank details, subject to a minimum payout threshold.",
  },
  {
    title: "7. Acceptable Use",
    body: "You agree not to misuse the platform, attempt to access content you have not purchased, abuse the AI tutor, or disrupt the service for others.",
  },
  {
    title: "8. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "9. Contact",
    body: "Questions about these terms can be sent to support@brainwave.ai.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
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
