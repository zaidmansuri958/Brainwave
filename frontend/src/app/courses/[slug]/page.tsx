import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseDetailClient } from "./CourseDetailClient";
import { Metadata } from "next";
import { BookOpen } from "lucide-react";

async function getCourse(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api/v1"}/courses/${slug}`,
      { next: { revalidate: 60 } }
    );
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center glass-card p-12 rounded-3xl max-w-md mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Course Not Found</h1>
            <p className="text-muted-foreground mt-2">This course may have been removed or the URL is incorrect.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CourseDetailClient course={course} />
      <Footer />
    </div>
  );
}
