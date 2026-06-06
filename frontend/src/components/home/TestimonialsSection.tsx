"use client";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
const testimonials = [
  { quote: "Learnova has completely transformed the way I learn. The AI Tutor and live classes are game-changers!", name: "Ananya Gupta", role: "Data Analyst", rating: 5, color: "from-violet-400 to-violet-600" },
  { quote: "The doubt sessions helped me clear my concepts so quickly. Highly recommended for serious learners.", name: "Vikram Singh", role: "Software Engineer", rating: 5, color: "from-blue-400 to-blue-600" },
  { quote: "The courses are well structured, up-to-date, and the instructors are amazing. Best investment!", name: "Sneha Iyer", role: "Product Designer", rating: 5, color: "from-pink-400 to-rose-500" },
];
export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What Our <span className="text-violet-600">Learners</span> Say</h2>
          </div>
          <Link href="/courses" className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700">
            View all reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl text-gray-200 font-serif mb-3">"</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {t.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0,1,2].map(i => <div key={i} className={`h-2 rounded-full transition-all ${i === 0 ? "w-6 bg-violet-600" : "w-2 bg-gray-200"}`} />)}
        </div>
      </div>
    </section>
  );
}
