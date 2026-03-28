"use client";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "B.Tech Student, IIT Delhi",
    avatar: "P",
    color: "from-blue-500 to-violet-500",
    quote:
      "The AI tutor answered my doubts at 2 AM when no one else could. My semester scores improved by 30%. This platform is genuinely different.",
    stars: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Full Stack Developer",
    avatar: "R",
    color: "from-cyan-500 to-blue-500",
    quote:
      "As a self-learner, the AI-generated course structure is a game-changer. It feels like someone packaged years of expertise into perfectly organized lessons.",
    stars: 5,
  },
  {
    name: "Dr. Ananya Krishnan",
    role: "Physics Teacher, Kota",
    avatar: "A",
    color: "from-violet-500 to-pink-500",
    quote:
      "I just recorded my lectures and Brainwave handled everything else — quizzes, summaries, thumbnails. I earned ₹2.4L in my first month teaching here.",
    stars: 5,
  },
  {
    name: "Siddharth Patel",
    role: "MBA Student, IIM Ahmedabad",
    avatar: "S",
    color: "from-emerald-500 to-cyan-500",
    quote:
      "The live doubt sessions saved my semester. I booked a 30-minute slot with the professor and understood 3 weeks of content. Worth every rupee.",
    stars: 5,
  },
  {
    name: "Meera Nair",
    role: "Data Science Engineer",
    avatar: "M",
    color: "from-amber-500 to-orange-500",
    quote:
      "My blockchain-verified Brainwave certificate got more comments from recruiters than my degree. The quality of courses here is exceptional.",
    stars: 5,
  },
  {
    name: "Arjun Verma",
    role: "CA Aspirant",
    avatar: "A",
    color: "from-red-500 to-rose-500",
    quote:
      "The dropout prediction feature is wild — my teacher reached out proactively when I was falling behind. That kind of care doesn't exist anywhere else.",
    stars: 5,
  },
  {
    name: "Kavya Reddy",
    role: "UX Designer & Teacher",
    avatar: "K",
    color: "from-pink-500 to-violet-500",
    quote:
      "I went from zero to 800+ enrolled students in 2 months. The AI built my course from my Figma tutorial recordings and it looked more professional than I ever could have done myself.",
    stars: 5,
  },
  {
    name: "Nikhil Agarwal",
    role: "Python Developer",
    avatar: "N",
    color: "from-blue-500 to-cyan-500",
    quote:
      "The course community is underrated. I got help from three different people within 10 minutes of posting my doubt. The AI answer was already there too.",
    stars: 5,
  },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[320px] rounded-2xl border border-white/[0.06] bg-[#0C1526] p-6 mx-2.5">
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(t.stars)].map((_, i) => (
          <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-400 text-sm leading-relaxed mb-5">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{t.name}</p>
          <p className="text-slate-600 text-xs">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-28 bg-[#080E1D] overflow-hidden relative">
      {/* Top/bottom mask */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block text-cyan-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Student Stories
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Real results from
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              real learners
            </span>
          </h2>
          <p className="text-slate-400 text-lg mt-5 max-w-xl mx-auto">
            50,000+ students and teachers trust Brainwave to learn, teach, and grow.
          </p>
        </motion.div>
      </div>

      {/* Marquee rows */}
      {/* Row 1 — left */}
      <div className="relative overflow-hidden mb-4 marquee-container">
        <div
          className="flex animate-marquee-left"
          style={{ width: "max-content" }}
        >
          {doubled.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
        {/* Edge masks */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#080E1D] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#080E1D] to-transparent pointer-events-none z-10" />
      </div>

      {/* Row 2 — right (reverse direction) */}
      <div className="relative overflow-hidden marquee-container">
        <div
          className="flex"
          style={{
            width: "max-content",
            animation: "marquee-left 50s linear infinite reverse",
          }}
        >
          {[...doubled].reverse().map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#080E1D] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#080E1D] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
