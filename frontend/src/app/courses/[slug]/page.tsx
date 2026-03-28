import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseDetailClient } from "./CourseDetailClient";
import { Metadata } from "next";
import Link from "next/link";

// Use internal Docker network URL for SSR; fall back to public URL for local dev
const SSR_API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api/v1";

async function getCourse(slug: string) {
  try {
    const res = await fetch(`${SSR_API}/courses/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.title} | Brainwave.ai`,
    description: course.short_description || course.description,
    openGraph: {
      title: course.title,
      description: course.short_description,
      images: course.thumbnail_url ? [{ url: course.thumbnail_url }] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-[#060B18]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="h-20 w-20 rounded-2xl bg-[#0C1526] border border-white/[0.07] flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
            <p className="text-slate-500 mb-6">This course may have been removed or the URL is incorrect.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold text-sm">
              Browse All Courses
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18]">
      <Navbar />
      <CourseDetailClient course={course} />
      <Footer />
    </div>
  );
}
