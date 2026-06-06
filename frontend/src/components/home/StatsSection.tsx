"use client";
import { Users, GraduationCap, BookOpen, Heart } from "lucide-react";
export function StatsSection() {
  const logos = ["Google", "Microsoft", "AWS", "NVIDIA", "Airbnb", "Deloitte"];
  const stats = [
    { icon: Users, value: "50K+", label: "Active Learners" },
    { icon: GraduationCap, value: "2K+", label: "Expert Teachers" },
    { icon: BookOpen, value: "1K+", label: "Courses" },
    { icon: Heart, value: "95%", label: "Satisfaction Rate" },
  ];
  return (
    <section className="border-y border-gray-100 bg-gray-50/50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <p className="text-sm font-medium text-gray-400 whitespace-nowrap shrink-0">Trusted by learners &amp; educators worldwide</p>
          <div className="flex flex-1 items-center justify-center flex-wrap gap-8">
            {logos.map((logo) => (
              <span key={logo} className={`text-sm font-extrabold tracking-tight ${logo === "NVIDIA" ? "text-green-600" : logo === "AWS" ? "text-orange-500" : "text-gray-400"} hover:text-gray-600 transition-colors`}>{logo}</span>
            ))}
          </div>
          <div className="flex items-center gap-8 shrink-0">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-[11px] text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
