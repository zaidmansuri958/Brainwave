"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const featured = {
  quote: "Brainwave is the first EdTech product that actually respects the teacher. I uploaded my 3-hour lecture and had a fully structured course with AI-generated quizzes ready before my next class. My students' completion rate went from 40% to 91%.",
  name:  "Dr. Priya Nair",
  role:  "Professor, BITS Pilani",
  stat:  "91% completion rate",
  avatar:"PN",
  color: "bg-indigo-500",
};

const cards = [
  {
    quote:  "Brainwave's AI tutor explained what my textbook never could. I cracked JEE Advanced after three months on the platform.",
    name:   "Arjun Sharma", role: "IIT Delhi, 2024",
    avatar: "AS", color: "bg-indigo-500",
  },
  {
    quote:  "Live sessions feel completely different from recorded videos — you can ask questions in real time and the AI fills gaps between classes.",
    name:   "Riya Mehta", role: "CA Foundation student",
    avatar: "RM", color: "bg-rose-500",
  },
  {
    quote:  "Got my blockchain certificate, shared it on LinkedIn, and had three recruiter calls within a week. Career-changing.",
    name:   "Sahil Gupta", role: "Software Engineer, Razorpay",
    avatar: "SG", color: "bg-violet-500",
  },
  {
    quote:  "Finally EdTech that's beautiful AND works. The progress tracking keeps me accountable without feeling like surveillance.",
    name:   "Neha Kapoor", role: "Product Manager, Swiggy",
    avatar: "NK", color: "bg-amber-500",
  },
  {
    quote:  "My daughter went from 52% to 87% in math over two months. The adaptive quizzes found exactly where she was stuck.",
    name:   "Rajesh Verma", role: "Parent, Mumbai",
    avatar: "RV", color: "bg-emerald-500",
  },
  {
    quote:  "The AI-generated course summaries are surprisingly good — my students say they use them to revise before exams more than my own notes.",
    name:   "Karan Mehrotra", role: "IIT Bombay Professor",
    avatar: "KM", color: "bg-sky-500",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#FAFAF9] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}
            className="eyebrow mb-3"
          >Loved by thousands</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.06 }}
            className="font-display font-extrabold text-gray-900 tracking-tight leading-[1.08]"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Real results from<br /><span className="text-gradient-indigo">real people.</span>
          </motion.h2>
        </div>

        {/* Featured testimonial — full width, editorial */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 lg:p-12 mb-6 relative overflow-hidden"
        >
          {/* Decorative quote mark */}
          <span
            className="absolute top-6 right-8 font-display font-extrabold text-gray-100 select-none pointer-events-none leading-none"
            style={{ fontSize: "8rem" }}
          >
            &ldquo;
          </span>

          <Stars />
          <blockquote className="mt-4 mb-6 text-gray-800 leading-relaxed font-medium relative z-10"
            style={{ fontSize: "clamp(1.05rem, 2vw, 1.25rem)" }}>
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${featured.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {featured.avatar}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{featured.name}</p>
                <p className="text-xs text-gray-400">{featured.role}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
              📈 {featured.stat}
            </span>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 + i * 0.07 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-card-hover transition-all duration-300"
            >
              <Stars />
              <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
