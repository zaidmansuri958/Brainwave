"use client";
import { Users, GraduationCap, BookOpen, PlayCircle, Heart } from "lucide-react";
const stats = [
  { icon: Users, value: "50K+", label: "Happy Learners" },
  { icon: GraduationCap, value: "2K+", label: "Expert Teachers" },
  { icon: BookOpen, value: "1K+", label: "Online Courses" },
  { icon: PlayCircle, value: "10M+", label: "Lessons Delivered" },
  { icon: Heart, value: "95%", label: "Learner Satisfaction" },
];
export function HowItWorksSection() {
  return (
    <section className="py-14 bg-gradient-to-r from-violet-600 to-violet-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-sm text-violet-200 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
