"use client";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

const testimonials = [
  {
    text: "Brainwave completely transformed the way I learn. The AI Tutor answers my doubts instantly — it's like having a personal mentor available 24/7.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Ananya Gupta",
    role: "Data Analyst",
  },
  {
    text: "The live doubt sessions are a game-changer. I cleared my concepts in days, not weeks. Highly recommend for anyone serious about upskilling.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "Vikram Singh",
    role: "Software Engineer",
  },
  {
    text: "Courses are well-structured, up-to-date, and the instructors are incredible. Best investment I've made in my career so far.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Sneha Iyer",
    role: "Product Designer",
  },
  {
    text: "The AI-generated quizzes helped me prepare for interviews faster than any other platform. Got placed in 3 weeks of consistent practice.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Arjun Mehta",
    role: "Frontend Developer",
  },
  {
    text: "Verified certificates from Brainwave actually matter. My employer recognized the credential immediately during the hiring process.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Priya Nair",
    role: "UX Researcher",
  },
  {
    text: "I enrolled as a teacher and the platform handles everything — payments, student management, live classes. I just focus on teaching.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "Rahul Sharma",
    role: "Instructor & ML Engineer",
  },
  {
    text: "The progress tracking and smart recommendations kept me motivated throughout the entire course. Finished it in half the expected time.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    name: "Kavya Reddy",
    role: "Data Scientist",
  },
  {
    text: "Brainwave's community forum is incredibly active. Got my questions answered within minutes and found a study group that kept me accountable.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    name: "Aditya Rao",
    role: "Backend Engineer",
  },
  {
    text: "The mobile experience is seamless. I learned during my commute and still managed to complete a full-stack course in under a month.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    name: "Meera Joshi",
    role: "Full Stack Developer",
  },
];

const firstColumn  = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn  = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-violet-200 bg-violet-50 text-violet-700 py-1 px-4 rounded-lg text-sm font-medium">
              Testimonials
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center text-gray-900">
            What our <span className="text-violet-600">learners</span> say
          </h2>
          <p className="text-center mt-5 text-gray-500">
            Thousands of students and teachers trust Brainwave to grow their skills and careers.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn}  duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn}  className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
