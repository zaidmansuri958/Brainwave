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
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#e2e5ec] bg-[#f7f8fa]">
              <span className="text-4xl">📚</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-ink-heading">Course Not Found</h1>
            <p className="mb-6 text-ink-muted">This course may have been removed or the URL is incorrect.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
              Browse All Courses
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CourseDetailClient course={course} />
      <Footer />
    </div>
  );
}
