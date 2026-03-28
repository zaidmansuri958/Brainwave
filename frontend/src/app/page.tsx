import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { CoursesPreview } from "@/components/home/CoursesPreview";

async function getFeaturedCourses() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api/v1"}/courses?sort=popular&limit=6&status=published`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses();

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CoursesPreview courses={featuredCourses} />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
