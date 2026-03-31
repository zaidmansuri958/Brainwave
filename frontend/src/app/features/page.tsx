import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Brain, Video, Award, BarChart2, BookOpen, Zap,
  Upload, MessageSquare, Shield, Users, Clock, Star,
} from "lucide-react";

const teacherFeatures = [
  {
    icon:  Upload,
    color: "bg-indigo-50 text-indigo-600",
    title: "AI Course Builder",
    description: "Upload your lecture recording — our AI transcribes it, creates structured chapters, generates quizzes, and writes a course description. Done in minutes.",
  },
  {
    icon:  Video,
    color: "bg-rose-50 text-rose-600",
    title: "Live Sessions",
    description: "Schedule live video classes with up to 500 students. Whiteboard, screen share, polls, and Q&A built in. Recordings auto-saved.",
  },
  {
    icon:  BarChart2,
    color: "bg-emerald-50 text-emerald-600",
    title: "Analytics Dashboard",
    description: "See which lessons students re-watch, where they drop off, who's at risk, and how your course ratings trend over time.",
  },
  {
    icon:  MessageSquare,
    color: "bg-amber-50 text-amber-600",
    title: "Doubt Sessions",
    description: "Offer 1-on-1 or group doubt clearing sessions. Students book slots and pay. You get a direct revenue stream beyond course sales.",
  },
];

const studentFeatures = [
  {
    icon:  Brain,
    color: "bg-violet-50 text-violet-600",
    title: "Personal AI Tutor",
    description: "An AI that has read your entire course and knows your progress. Ask it anything, get step-by-step explanations, request practice problems.",
  },
  {
    icon:  BookOpen,
    color: "bg-sky-50 text-sky-600",
    title: "Smart Quizzes",
    description: "AI-generated quizzes target exactly where you're weak. Spaced repetition keeps concepts fresh. Detailed explanations for every wrong answer.",
  },
  {
    icon:  Award,
    color: "bg-amber-50 text-amber-600",
    title: "Blockchain Certificates",
    description: "Every certificate is issued on-chain — tamper-proof, verifiable by anyone, shareable on LinkedIn with one click. Employers trust it.",
  },
  {
    icon:  Shield,
    color: "bg-emerald-50 text-emerald-600",
    title: "Progress Tracking",
    description: "A detailed learning journal: time spent, chapters completed, quiz scores, streaks. Set goals and get reminders when you fall behind.",
  },
];

const platformStats = [
  { value: "500+",   label: "Courses",          sub: "Across all subjects" },
  { value: "50k+",  label: "Active learners",   sub: "Learn every day" },
  { value: "98%",   label: "Completion rate",   sub: "Industry-leading" },
  { value: "2 min", label: "Course setup time", sub: "With AI Builder" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pt-20 pb-16 text-center">
        <p className="eyebrow mb-4">Platform Features</p>
        <h1 className="font-display font-extrabold text-5xl lg:text-6xl text-gray-900 tracking-tight leading-[1.08] mb-6">
          One platform.
          <br />
          <span className="text-gradient-indigo">Two superpowers.</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
          AI tools so teachers can create and sell courses effortlessly.
          Smart tutoring so students can master any subject deeply.
        </p>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {platformStats.map((s, i) => (
              <div
                key={i}
                className={`py-10 px-6 text-center ${i < 3 ? "md:border-r border-gray-100" : ""} ${i === 0 ? "border-r border-gray-100" : ""}`}
              >
                <p className="font-display font-extrabold text-3xl text-gray-900 mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-gray-700">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            For Teachers
          </span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 tracking-tight leading-[1.1]">
            Create a course in minutes,
            <br />
            not months.
          </h2>
          <p className="text-lg text-gray-500 mt-4 max-w-xl">
            Just hit record. Our AI does the editing, structuring, and quiz writing for you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {teacherFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student features */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold mb-4">
              <Brain className="w-3.5 h-3.5" />
              For Students
            </span>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 tracking-tight leading-[1.1]">
              Learn at your pace,
              <br />
              with an AI in your corner.
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-xl">
              Not just video lectures — an adaptive system that figures out what you know and fills the gaps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {studentFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-[#FAFAF9] rounded-2xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
