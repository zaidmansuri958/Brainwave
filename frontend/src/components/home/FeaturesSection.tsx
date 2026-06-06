"use client";
import { Bot, Video, Brain, Users, Award, BarChart3 } from "lucide-react";
const features = [
  { icon: Bot, title: "AI-Powered Learning", desc: "Personalised course recommendations, smart summaries, and AI tutor 24/7.", color: "bg-violet-50 text-violet-600" },
  { icon: Video, title: "Live Classes & Recordings", desc: "Join interactive live classes and access recordings anytime, anywhere.", color: "bg-orange-50 text-orange-500" },
  { icon: Brain, title: "Smart Quizzes & Assessments", desc: "AI-generated quizzes with instant feedback to track your progress.", color: "bg-blue-50 text-blue-600" },
  { icon: Users, title: "Doubt Sessions", desc: "Book 1-on-1 or group sessions with experts and clear your doubts.", color: "bg-green-50 text-green-600" },
  { icon: BarChart3, title: "Community & Discussions", desc: "Connect with learners, ask questions, and grow together.", color: "bg-pink-50 text-pink-600" },
  { icon: Award, title: "Certificates & Achievements", desc: "Earn verified certificates and showcase your skills with confidence.", color: "bg-amber-50 text-amber-600" },
];
export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 mb-3">
            <span className="h-px w-6 bg-violet-300" /> Why Learnova? <span className="h-px w-6 bg-violet-300" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Everything You Need to <span className="text-violet-600">Succeed</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
