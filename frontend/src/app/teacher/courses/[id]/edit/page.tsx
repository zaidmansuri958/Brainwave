"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Eye, Plus, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    level: "beginner",
    category: "",
    language: "English",
    what_you_will_learn: [] as string[],
    prerequisites: [] as string[],
    tags: [] as string[],
  });

  const [newLearning, setNewLearning] = useState("");
  const [newPrereq, setNewPrereq] = useState("");
  const [newTag, setNewTag] = useState("");

  const { data: course, isLoading } = useQuery({
    queryKey: ["teacher-course", params.id],
    queryFn: () => teacherApi.getCourse(params.id).then((r) => r.data),
  });

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
        level: course.level || "beginner",
        category: course.category || "",
        language: course.language || "English",
        what_you_will_learn: course.what_you_will_learn || [],
        prerequisites: course.prerequisites || [],
        tags: course.tags || [],
      });
    }
  }, [course]);

  const updateCourse = useMutation({
    mutationFn: (data: typeof form) => teacherApi.updateCourse(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-course", params.id] });
      toast({ title: "Course updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
    },
  });

  const publishCourse = useMutation({
    mutationFn: () => courseApi.publish(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-course", params.id] });
      toast({ title: "Course published!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourse.mutate(form);
  };

  const addToList = (field: "what_you_will_learn" | "prerequisites" | "tags", value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setter("");
  };

  const removeFromList = (field: "what_you_will_learn" | "prerequisites" | "tags", index: number) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/teacher/courses" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
            <p className="text-muted-foreground text-sm">
              Status: <Badge variant={course?.status === "published" ? "success" : "warning"}>{course?.status}</Badge>
            </p>
          </div>
          <div className="flex gap-2">
            {course?.status !== "published" && (
              <Button variant="glass" onClick={() => publishCourse.mutate()} loading={publishCourse.isPending} className="gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Eye className="h-4 w-4" /> Publish
              </Button>
            )}
            <Button form="edit-form" type="submit" variant="gradient" loading={updateCourse.isPending} className="gap-1.5">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 space-y-5 rounded-3xl">
            <h2 className="text-foreground font-bold">Basic Information</h2>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Course Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required variant="glass" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Price (INR)</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} min={0} variant="glass" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Level</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full glass-input rounded-xl px-4 py-3 text-sm">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Category</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Programming" variant="glass" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Language</label>
                <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} variant="glass" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-foreground font-bold mb-4">What Students Will Learn</h2>
            <div className="flex gap-2 mb-3">
              <Input value={newLearning} onChange={(e) => setNewLearning(e.target.value)} placeholder="Add a learning outcome..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("what_you_will_learn", newLearning, setNewLearning))} variant="glass" />
              <Button type="button" onClick={() => addToList("what_you_will_learn", newLearning, setNewLearning)} variant="gradient"><Plus className="h-4 w-4" /></Button>
            </div>
            <ul className="space-y-2">
              {form.what_you_will_learn.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground/80 glass rounded-xl px-4 py-2.5">
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={() => removeFromList("what_you_will_learn", i)} className="text-red-500 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-foreground font-bold mb-4">Prerequisites</h2>
            <div className="flex gap-2 mb-3">
              <Input value={newPrereq} onChange={(e) => setNewPrereq(e.target.value)} placeholder="Add a prerequisite..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("prerequisites", newPrereq, setNewPrereq))} variant="glass" />
              <Button type="button" onClick={() => addToList("prerequisites", newPrereq, setNewPrereq)} variant="gradient"><Plus className="h-4 w-4" /></Button>
            </div>
            <ul className="space-y-2">
              {form.prerequisites.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground/80 glass rounded-xl px-4 py-2.5">
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={() => removeFromList("prerequisites", i)} className="text-red-500 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-foreground font-bold mb-4">Tags</h2>
            <div className="flex gap-2 mb-3">
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("tags", newTag, setNewTag))} variant="glass" />
              <Button type="button" onClick={() => addToList("tags", newTag, setNewTag)} variant="gradient"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, i) => (
                <Badge key={i} variant="default" className="gap-1.5 py-1.5 px-3">
                  {tag}
                  <button type="button" onClick={() => removeFromList("tags", i)} className="hover:text-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
