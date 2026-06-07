"use client";
import { Users, GraduationCap, BookOpen, Heart } from "lucide-react";

const logos = [
  { name: "Google",    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",          w: 52 },
  { name: "Microsoft", src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", w: 76 },
  { name: "AWS",       src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",  w: 36 },
  { name: "NVIDIA",    src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",               w: 58 },
];

export function StatsSection() {
  const stats = [
    { icon: Users,         value: "50K+", label: "Active Learners"  },
    { icon: GraduationCap, value: "2K+",  label: "Expert Teachers"  },
    { icon: BookOpen,      value: "1K+",  label: "Courses"          },
    { icon: Heart,         value: "95%",  label: "Satisfaction Rate" },
  ];

  return (
    <section className="border-y border-gray-100 bg-gray-50/50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <p className="text-sm font-medium text-gray-400 whitespace-nowrap shrink-0">
            Trusted by learners &amp; educators worldwide
          </p>

          {/* Company logos */}
          <div className="flex flex-1 items-center justify-center flex-nowrap gap-6 lg:gap-10 overflow-x-auto no-scrollbar">
            {logos.map(({ name, src, w }) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={name}
                src={src}
                alt={name}
                width={w}
                height={24}
                className="h-4 w-auto object-contain opacity-50 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-200"
              />
            ))}
          </div>

          {/* Stats */}
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
