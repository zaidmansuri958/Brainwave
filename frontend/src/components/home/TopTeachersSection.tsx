"use client";

import Link from "next/link";
import { Star, Users, ArrowRight, Linkedin, Twitter } from "lucide-react";

const teachers = [
  { name: "Dr. Arjun Patel",  specialty: "AI & Data Science Expert",       rating: 4.9, students: 12600, experience: "12+ Years Experience", image: "/images/teacher1.png" },
  { name: "Riya Sharma",      specialty: "Data Science Lead",               rating: 4.8, students: 9800,  experience: "8+ Years Experience",  image: "/images/teacher2.png" },
  { name: "John Smith",       specialty: "Full Stack Developer",            rating: 4.8, students: 13000, experience: "10+ Years Experience", image: "/images/teacher3.png" },
  { name: "Neha Verma",       specialty: "UI/UX Design Expert",             rating: 4.9, students: 6700,  experience: "9+ Years Experience",  image: "/images/teacher4.png" },
  { name: "Rahul Marketa",    specialty: "Digital Marketing Strategist",    rating: 4.8, students: 7700,  experience: "7+ Years Experience",  image: "/images/teacher5.png" },
];

export function TopTeachersSection() {
  return (
    <section className="py-14 bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top Teachers</h2>
            <p className="text-sm text-gray-500 mt-1">Learn from industry experts and top educators</p>
          </div>
          <Link href="/for-teachers" className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
            View all teachers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Teacher cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {teachers.map((teacher) => (
            <div key={teacher.name}
              className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">

              {/* Avatar */}
              <div className="flex justify-center mb-3">
                <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-violet-100 shadow-md">
                  <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
                </div>
              </div>

              {/* Info */}
              <h3 className="text-sm font-bold text-gray-900 mb-0.5">{teacher.name}</h3>
              <p className="text-[11px] text-gray-500 mb-2 line-clamp-1">{teacher.specialty}</p>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                <span className="text-xs font-bold text-gray-700">{teacher.rating}</span>
                <span className="text-[10px] text-gray-400">({(teacher.students/1000).toFixed(1)}k)</span>
              </div>

              <p className="text-[10px] text-gray-400 mb-3">{teacher.experience}</p>

              {/* Social */}
              <div className="flex items-center justify-center gap-2">
                <button className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                  <Linkedin className="h-3 w-3" />
                </button>
                <button className="h-6 w-6 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 hover:bg-sky-100 transition-colors">
                  <Twitter className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
