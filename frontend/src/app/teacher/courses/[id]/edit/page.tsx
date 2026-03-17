"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi, courseApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/teacher/courses" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Edit Course</h1>
            <p className="text-gray-400 text-sm">
              Status: <span className={`font-semibold ${course?.status === "published" ? "text-green-400" : "text-yellow-400"}`}>
                {course?.status}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {course?.status !== "published" && (
              <button
                onClick={() => publishCourse.mutate()}
                disabled={publishCourse.isPending}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition-colors"
              >
                {publishCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Publish
              </button>
            )}
            <button
              form="edit-form"
              type="submit"
              disabled={updateCourse.isPending}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-700 transition-colors"
            >
              {updateCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>

        <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
            <h2 className="text-white font-semibold">Basic Information</h2>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Course Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                required
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Price (INR)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  min={0}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Programming, Design..."
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Language</label>
                <input
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-4">What Students Will Learn</h2>
            <div className="flex gap-2 mb-3">
              <input
                value={newLearning}
                onChange={(e) => setNewLearning(e.target.value)}
                placeholder="Add a learning outcome..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("what_you_will_learn", newLearning, setNewLearning))}
                className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={() => addToList("what_you_will_learn", newLearning, setNewLearning)}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {form.what_you_will_learn.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800 rounded-lg px-3 py-2">
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={() => removeFromList("what_you_will_learn", i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-4">Prerequisites</h2>
            <div className="flex gap-2 mb-3">
              <input
                value={newPrereq}
                onChange={(e) => setNewPrereq(e.target.value)}
                placeholder="Add a prerequisite..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("prerequisites", newPrereq, setNewPrereq))}
                className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={() => addToList("prerequisites", newPrereq, setNewPrereq)}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {form.prerequisites.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800 rounded-lg px-3 py-2">
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={() => removeFromList("prerequisites", i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-4">Tags</h2>
            <div className="flex gap-2 mb-3">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList("tags", newTag, setNewTag))}
                className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={() => addToList("tags", newTag, setNewTag)}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-primary-900/40 text-primary-400 text-xs px-3 py-1.5 rounded-full"
                >
                  {tag}
                  <button type="button" onClick={() => removeFromList("tags", i)} className="ml-1 hover:text-primary-200">×</button>
                </span>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
