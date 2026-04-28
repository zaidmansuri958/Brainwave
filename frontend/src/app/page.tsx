import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CTASection } from "@/components/home/CTASection";
import { CoursesPreview } from "@/components/home/CoursesPreview";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { StatsSection } from "@/components/home/StatsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { AppShell } from "@/components/ui/app-shell";

export default function HomePage() {
  return (
    <AppShell className="flex flex-col">
      <Navbar />
      <main className="flex-1 pb-4">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CoursesPreview />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </AppShell>
  );
}
