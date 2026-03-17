import { create } from "zustand";

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  video_url?: string;
  duration_seconds?: number;
  is_published: boolean;
}

interface CourseStore {
  currentLesson: Lesson | null;
  progress: Record<string, number>;
  setCurrentLesson: (lesson: Lesson) => void;
  updateProgress: (lessonId: string, percent: number) => void;
  clearProgress: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  currentLesson: null,
  progress: {},
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  updateProgress: (lessonId, percent) =>
    set((state) => ({
      progress: { ...state.progress, [lessonId]: percent },
    })),
  clearProgress: () => set({ progress: {} }),
}));
