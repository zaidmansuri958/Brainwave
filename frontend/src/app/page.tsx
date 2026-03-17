import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomePageClient } from "@/components/home/HomePageClient";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HomePageClient featuredCourses={featuredCourses} />
      <Footer />
    </div>
  );
}
