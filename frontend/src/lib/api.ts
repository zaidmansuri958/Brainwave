import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refresh,
          });
          localStorage.setItem("access_token", data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api.request(error.config);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  googleAuth: (token: string, role: string) => api.post("/auth/google", { google_token: token, role }),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Courses
export const courseApi = {
  list: (params?: any) => api.get("/courses", { params }),
  get: (slug: string) => api.get(`/courses/${slug}`),
  create: (data: any) => api.post("/courses", data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  publish: (id: string) => api.post(`/courses/${id}/publish`),
  uploadMaterials: (id: string, files: FormData) =>
    api.post(`/courses/${id}/materials/upload`, files, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  aiStatus: (id: string) => api.get(`/courses/${id}/ai-status`),
  approveStructure: (id: string, data: any) => api.post(`/courses/${id}/structure/approve`, data),
  retryAi: (id: string) => api.post(`/courses/${id}/retry-ai`),
  getReviews: (id: string) => api.get(`/courses/${id}/reviews`),
  featured: () => api.get("/courses/featured"),
};

// Enrollments
export const enrollmentApi = {
  initiate: (courseId: string) => api.post("/enrollments/initiate", { course_id: courseId }),
  confirm: (data: any) => api.post("/enrollments/confirm", data),
  myCourses: () => api.get("/enrollments/my-courses"),
  check: (courseId: string) => api.get(`/enrollments/check/${courseId}`),
};

// Lessons & Progress
export const lessonApi = {
  get: (courseId: string, lessonId: string) => api.get(`/courses/${courseId}/lessons/${lessonId}`),
  updateProgress: (courseId: string, lessonId: string, data: any) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/progress`, null, { params: data }),
  myProgress: (courseId: string) => api.get(`/courses/${courseId}/my-progress`),
  videoUrl: (lessonId: string) => api.get(`/lessons/${lessonId}/video-url`),
};

// Quizzes
export const quizApi = {
  get: (quizId: string) => api.get(`/quizzes/${quizId}`),
  submit: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/attempt`, data),
  leaderboard: (quizId: string) => api.get(`/quizzes/${quizId}/leaderboard`),
};

// Community
export const communityApi = {
  list: (courseId: string, params?: any) => api.get(`/community/${courseId}/posts`, { params }),
  create: (courseId: string, data: any) => api.post(`/community/${courseId}/posts`, data),
  reply: (courseId: string, postId: string, data: any) =>
    api.post(`/community/${courseId}/posts/${postId}/replies`, data),
  upvote: (courseId: string, postId: string) =>
    api.post(`/community/${courseId}/posts/${postId}/upvote`),
  markOfficial: (courseId: string, postId: string, replyId: string) =>
    api.patch(`/community/${courseId}/posts/${postId}/replies/${replyId}/official`),
  pinPost: (courseId: string, postId: string) =>
    api.patch(`/community/${courseId}/posts/${postId}/pin`),
  // Aliases for legacy usage
  getPosts: (courseId: string, params?: any) => api.get(`/community/${courseId}/posts`, { params }),
};

// Certificates
export const certApi = {
  myCertificates: () => api.get("/certificates/my"),
  verify: (certId: string) => api.get(`/certificates/verify/${certId}`),
};

// Notifications
export const notifApi = {
  get: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// Teacher
export const teacherApi = {
  dashboard: () => api.get("/teacher/dashboard"),
  myCourses: () => api.get("/teacher/courses"),
  getCourse: (courseId: string) => api.get(`/teacher/courses/${courseId}`),
  updateCourse: (courseId: string, data: any) => api.patch(`/courses/${courseId}`, data),
  archiveCourse: (courseId: string) => api.post(`/courses/${courseId}/archive`),
  students: (courseId: string) => api.get(`/teacher/courses/${courseId}/students`),
  nudge: (courseId: string, studentId: string) =>
    api.post(`/teacher/courses/${courseId}/students/${studentId}/nudge`),
  earnings: () => api.get("/teacher/earnings"),
  updateProfile: (data: any) => api.patch("/teacher/profile", data),
  onboardingStatus: () => api.get("/teacher/onboarding/status"),
  saveOnboarding: (data: any) => api.patch("/teacher/onboarding", data),
  submitOnboarding: () => api.post("/teacher/onboarding/submit"),
  onboardingUpload: (docType: string, file: File) => {
    const fd = new FormData();
    fd.append("doc_type", docType);
    fd.append("file", file);
    return api.post("/teacher/onboarding/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  analytics: (courseId?: string) =>
    api.get("/teacher/analytics", { params: courseId ? { course_id: courseId } : {} }),
  regenerateThumbnail: (courseId: string, params?: { lesson_id?: string; custom_prompt?: string }) =>
    api.post(`/teacher/courses/${courseId}/thumbnails/regenerate`, null, { params }),
};

export const learnApi = {
  courseAccess: (slug: string) => api.get(`/learn/courses/${slug}/access`),
};

export const promotionsApi = {
  create: (data: {
    course_id: string;
    discount_percent?: number;
    price_override?: number;
    starts_at: string;
    ends_at: string;
  }) => api.post("/teacher/promotions", data),
  listByCourse: (courseId: string) => api.get(`/teacher/promotions/courses/${courseId}`),
  toggle: (promotionId: string) => api.patch(`/teacher/promotions/${promotionId}/toggle`),
};

export const materialsApi = {
  teacherList: () => api.get("/study-materials/teacher/my"),
  create: (data: { title: string; description?: string; price: number }) => api.post("/study-materials", data),
  uploadFiles: (productId: string, files: FormData) =>
    api.post(`/study-materials/${productId}/files`, files, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  publish: (productId: string) => api.post(`/study-materials/${productId}/publish`),
  catalog: () => api.get("/study-materials/catalog"),
  bySlug: (slug: string) => api.get(`/study-materials/slug/${slug}`),
  purchaseInitiate: (productId: string) =>
    api.post("/study-materials/purchase/initiate", null, { params: { product_id: productId } }),
  purchaseConfirm: (data: {
    product_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post("/study-materials/purchase/confirm", data),
  myPurchases: () => api.get("/study-materials/my-purchases"),
  purchasedFiles: (productId: string) => api.get(`/study-materials/purchased/${productId}/files`),
};

export const mockTestsApi = {
  teacherList: () => api.get("/mock-tests/teacher/my-packages"),
  createPackage: (data: { title: string; description?: string; price: number }) =>
    api.post("/mock-tests/packages", data),
  addPaper: (packageId: string, data: any) => api.post(`/mock-tests/packages/${packageId}/papers`, data),
  addSection: (paperId: string, data: { title: string; order_index?: number }) =>
    api.post(`/mock-tests/papers/${paperId}/sections`, data),
  addQuestion: (sectionId: string, data: any) => api.post(`/mock-tests/sections/${sectionId}/questions`, data),
  publishPackage: (packageId: string) => api.post(`/mock-tests/packages/${packageId}/publish`),
  builderDetail: (packageId: string) => api.get(`/mock-tests/packages/${packageId}/builder`),
  catalog: () => api.get("/mock-tests/catalog"),
  bySlug: (slug: string) => api.get(`/mock-tests/slug/${slug}`),
  purchaseInitiate: (packageId: string) =>
    api.post("/mock-tests/purchase/initiate", null, { params: { package_id: packageId } }),
  purchaseConfirm: (data: {
    package_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post("/mock-tests/purchase/confirm", data),
  myPackages: () => api.get("/mock-tests/my-packages"),
  paperTake: (paperId: string) => api.get(`/mock-tests/papers/${paperId}/take`),
  submitAttempt: (paperId: string, answers: Record<string, string>) =>
    api.post(`/mock-tests/papers/${paperId}/attempt`, { answers }),
};

export const availabilityApi = {
  createRule: (data: {
    weekday: number;
    start_time: string;
    end_time: string;
    timezone?: string;
    slot_duration_minutes?: number;
    price?: number;
  }) => api.post("/teacher/availability/rules", data),
  listRules: () => api.get("/teacher/availability/rules"),
  generateSlots: (daysAhead?: number) =>
    api.post("/teacher/availability/generate-slots", null, { params: { days_ahead: daysAhead } }),
  teacherSlots: (teacherId: string) => api.get(`/teacher/availability/teachers/${teacherId}/slots`),
};

export const curriculumApi = {
  listQuizzes: (courseId: string) => api.get(`/teacher/curriculum/courses/${courseId}/quizzes`),
  updateQuiz: (courseId: string, quizId: string, data: any) =>
    api.patch(`/teacher/curriculum/courses/${courseId}/quizzes/${quizId}`, data),
  updateChapter: (courseId: string, chapterId: string, data: any) =>
    api.patch(`/teacher/curriculum/courses/${courseId}/chapters/${chapterId}`, data),
  updateLesson: (courseId: string, lessonId: string, data: any) =>
    api.patch(`/teacher/curriculum/courses/${courseId}/lessons/${lessonId}`, data),
};

// Admin
export const adminApi = {
  stats: () => api.get("/admin/dashboard"),
  dashboard: () => api.get("/admin/dashboard"),
  teachers: () => api.get("/admin/teachers"),
  pendingTeachers: () => api.get("/admin/teachers/pending-verification"),
  pendingCourses: () => api.get("/admin/courses"),
  pendingVerification: () => api.get("/admin/teachers/pending-verification"),
  // backend reads identity_verified/expert_verified as query params
  verifyTeacher: (id: string, status: string) =>
    api.patch(`/admin/teachers/${id}/verify`, null, {
      params: {
        identity_verified: status === "approved",
        expert_verified:   status === "approved",
        outcome_verified:  status === "approved",
      },
    }),
  courses: () => api.get("/admin/courses"),
  // backend reads featured as query param
  featureCourse: (id: string, featured: boolean) =>
    api.patch(`/admin/courses/${id}/feature`, null, { params: { featured } }),
  payments: (params?: any) => api.get("/admin/payments", { params }),
  // backend reads teacher_id as query param
  processPayouts: (teacherId?: string) =>
    api.post("/admin/payouts/process", null, {
      params: teacherId ? { teacher_id: teacherId } : undefined,
    }),
  refunds: () => api.get("/admin/refunds"),
  reviewOnboarding: (teacherId: string, action: "approve" | "reject", reason?: string) =>
    api.patch(`/admin/teachers/${teacherId}/onboarding`, null, {
      params: { action, reason },
    }),
  moderateCourse: (courseId: string, status: "approved" | "rejected") =>
    api.patch(`/admin/courses/${courseId}/moderation`, null, { params: { moderation_status: status } }),
  approveRefund: (id: string) => api.patch(`/admin/refunds/${id}/approve`),
  // backend reads admin_note as query param
  rejectRefund: (id: string, note?: string) =>
    api.patch(`/admin/refunds/${id}/reject`, null, {
      params: note ? { admin_note: note } : undefined,
    }),
};

// Live Sessions
export const liveApi = {
  list: () => api.get("/live-sessions"),
  getSessions: (courseId: string) => api.get(`/courses/${courseId}/live-sessions`),
  create: (data: any) => api.post("/live-sessions", data),
  join: (sessionId: string) => api.get(`/live-sessions/${sessionId}/join`),
};

// Doubt Sessions
export const doubtApi = {
  mySessions: () => api.get("/doubt-sessions/my"),
  getSessions: (courseId: string) => api.get(`/courses/${courseId}/doubt-sessions`),
  create: (data: any) => api.post("/doubt-sessions", data),
  join: (sessionId: string) => api.get(`/doubt-sessions/${sessionId}/join`),
  initiate: (sessionId: string) => api.post(`/doubt-sessions/${sessionId}/initiate-booking`),
  book: (sessionId: string, data: any) =>
    api.post(`/doubt-sessions/${sessionId}/book`, data),
};
