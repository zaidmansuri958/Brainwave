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
  updateProfile: (data: any) => api.patch("/auth/me", data),
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
  captionsUrl: (lessonId: string) => `${API_URL}/lessons/${lessonId}/captions`,
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
  generate: (courseId: string) => api.post(`/certificates/generate/${courseId}`),
  get: (certId: string) => api.get(`/certificates/${certId}`),
};

// Notifications
export const notifApi = {
  get: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  unreadCount: () => api.get("/notifications/unread-count"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete("/notifications"),
};

// Teacher
export const teacherApi = {
  dashboard: () => api.get("/teacher/dashboard"),
  myCourses: () => api.get("/teacher/courses"),
  getCourse: (courseId: string) => api.get(`/teacher/courses/${courseId}`),
  updateCourse: (courseId: string, data: any) => api.patch(`/courses/${courseId}`, data),
  archiveCourse: (courseId: string) => api.post(`/courses/${courseId}/archive`),
  students: (courseId: string) => api.get(`/teacher/courses/${courseId}/students`),
  allStudents: (search?: string) => api.get("/teacher/students", { params: search ? { search } : {} }),
  nudge: (courseId: string, studentId: string) =>
    api.post(`/teacher/courses/${courseId}/students/${studentId}/nudge`),
  earnings: () => api.get("/teacher/earnings"),
  getProfile: () => api.get("/teacher/profile"),
  updateProfile: (data: any) => api.patch("/teacher/profile", data),
  requestPayout: (amount?: number) => api.post("/teacher/payouts/request", amount ? { amount } : {}),
  onboardingStatus: () => api.get("/teacher/onboarding/status"),
  saveOnboarding: (data: any) => api.patch("/teacher/onboarding", data),
  submitOnboarding: (data?: {
    legal_name?: string;
    years_teaching?: number;
    past_employers?: string[];
    highest_degree?: string;
  }) => api.post("/teacher/onboarding/submit", data ?? {}),
  onboardingUpload: (docType: string, file: File) => {
    const fd = new FormData();
    fd.append("doc_type", docType);
    fd.append("file", file);
    // Let axios set multipart boundary — a bare "multipart/form-data" header breaks uploads.
    return api.post("/teacher/onboarding/upload", fd);
  },
  analytics: (courseId?: string) =>
    api.get("/teacher/analytics", { params: courseId ? { course_id: courseId } : {} }),
  regenerateThumbnail: (courseId: string, params?: { lesson_id?: string; custom_prompt?: string }) =>
    api.post(`/teacher/courses/${courseId}/thumbnails/regenerate`, null, { params }),
};

export const learnApi = {
  courseAccess: (slug: string) => api.get(`/learn/courses/${slug}/access`),
  getProgress: (slug: string) => api.get(`/learn/courses/${slug}/progress`),
  writeProgress: (slug: string, data: { lesson_id: string; completed?: boolean; watch_position_seconds?: number }) =>
    api.post(`/learn/courses/${slug}/progress`, data),
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
  update: (promotionId: string, data: any) => api.patch(`/teacher/promotions/${promotionId}`, data),
  delete: (promotionId: string) => api.delete(`/teacher/promotions/${promotionId}`),
};

export const materialsApi = {
  teacherList: () => api.get("/study-materials/teacher/my"),
  create: (data: { title: string; description?: string; price: number }) => api.post("/study-materials", data),
  update: (productId: string, data: any) => api.patch(`/study-materials/${productId}`, data),
  delete: (productId: string) => api.delete(`/study-materials/${productId}`),
  uploadFiles: (productId: string, files: FormData) =>
    api.post(`/study-materials/${productId}/files`, files, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteFile: (productId: string, fileId: string) =>
    api.delete(`/study-materials/${productId}/files/${fileId}`),
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
  updatePackage: (packageId: string, data: any) => api.patch(`/mock-tests/packages/${packageId}`, data),
  deletePackage: (packageId: string) => api.delete(`/mock-tests/packages/${packageId}`),
  addPaper: (packageId: string, data: any) => api.post(`/mock-tests/packages/${packageId}/papers`, data),
  updatePaper: (paperId: string, data: any) => api.patch(`/mock-tests/papers/${paperId}`, data),
  deletePaper: (paperId: string) => api.delete(`/mock-tests/papers/${paperId}`),
  addSection: (paperId: string, data: { title: string; order_index?: number }) =>
    api.post(`/mock-tests/papers/${paperId}/sections`, data),
  addQuestion: (sectionId: string, data: any) => api.post(`/mock-tests/sections/${sectionId}/questions`, data),
  updateQuestion: (questionId: string, data: any) => api.patch(`/mock-tests/questions/${questionId}`, data),
  deleteQuestion: (questionId: string) => api.delete(`/mock-tests/questions/${questionId}`),
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
  submitAttempt: (paperId: string, answers: Record<string, string>, timeTakenSeconds?: number) =>
    api.post(`/mock-tests/papers/${paperId}/attempt`, { answers, time_taken_seconds: timeTakenSeconds }),
  listAttempts: (paperId: string) => api.get(`/mock-tests/papers/${paperId}/attempts`),
  getAttempt: (paperId: string, attemptId: string) =>
    api.get(`/mock-tests/papers/${paperId}/attempts/${attemptId}`),
  leaderboard: (paperId: string) => api.get(`/mock-tests/papers/${paperId}/leaderboard`),
  analytics: (paperId: string, attemptId?: string) =>
    api.get(`/mock-tests/papers/${paperId}/analytics`, { params: attemptId ? { attempt_id: attemptId } : {} }),
  packageStats: (slug: string) => api.get(`/mock-tests/slug/${slug}/stats`),
  reviews: (packageId: string) => api.get(`/mock-tests/packages/${packageId}/reviews`),
  submitReview: (packageId: string, data: { rating: number; review_text?: string }) =>
    api.post(`/mock-tests/packages/${packageId}/reviews`, data),
  updateReview: (packageId: string, reviewId: string, data: { rating?: number; review_text?: string }) =>
    api.patch(`/mock-tests/packages/${packageId}/reviews/${reviewId}`, data),
  deleteReview: (packageId: string, reviewId: string) =>
    api.delete(`/mock-tests/packages/${packageId}/reviews/${reviewId}`),
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
  getTree: (courseId: string) => api.get(`/teacher/curriculum/courses/${courseId}`),
  createChapter: (courseId: string, data: any) =>
    api.post(`/teacher/curriculum/courses/${courseId}/chapters`, data),
  deleteChapter: (courseId: string, chapterId: string) =>
    api.delete(`/teacher/curriculum/courses/${courseId}/chapters/${chapterId}`),
  updateChapter: (courseId: string, chapterId: string, data: any) =>
    api.patch(`/teacher/curriculum/courses/${courseId}/chapters/${chapterId}`, data),
  createLesson: (courseId: string, data: any) =>
    api.post(`/teacher/curriculum/courses/${courseId}/lessons`, data),
  deleteLesson: (courseId: string, lessonId: string) =>
    api.delete(`/teacher/curriculum/courses/${courseId}/lessons/${lessonId}`),
  updateLesson: (courseId: string, lessonId: string, data: any) =>
    api.patch(`/teacher/curriculum/courses/${courseId}/lessons/${lessonId}`, data),
  listQuizzes: (courseId: string) => api.get(`/teacher/curriculum/courses/${courseId}/quizzes`),
  createQuiz: (courseId: string, data: any) =>
    api.post(`/teacher/curriculum/courses/${courseId}/quizzes`, data),
  deleteQuiz: (courseId: string, quizId: string) =>
    api.delete(`/teacher/curriculum/courses/${courseId}/quizzes/${quizId}`),
  updateQuiz: (courseId: string, quizId: string, data: any) =>
    api.patch(`/teacher/curriculum/courses/${courseId}/quizzes/${quizId}`, data),
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
  payouts: () => api.get("/admin/payouts"),
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
  get: (sessionId: string) => api.get(`/live-sessions/${sessionId}`),
  getSessions: (courseId: string) => api.get(`/courses/${courseId}/live-sessions`),
  create: (data: any) => api.post("/live-sessions", data),
  update: (sessionId: string, data: any) => api.patch(`/live-sessions/${sessionId}`, data),
  delete: (sessionId: string) => api.delete(`/live-sessions/${sessionId}`),
  end: (sessionId: string, data?: { recording_url?: string }) =>
    api.post(`/live-sessions/${sessionId}/end`, data || {}),
  join: (sessionId: string) => api.get(`/live-sessions/${sessionId}/join`),
};

// Doubt Sessions
export const doubtApi = {
  mySessions: () => api.get("/doubt-sessions/my"),
  myBookings: () => api.get("/doubt-sessions/my-bookings"),
  getSessions: (courseId: string) => api.get(`/courses/${courseId}/doubt-sessions`),
  create: (data: any) => api.post("/doubt-sessions", data),
  update: (sessionId: string, data: any) => api.patch(`/doubt-sessions/${sessionId}`, data),
  delete: (sessionId: string) => api.delete(`/doubt-sessions/${sessionId}`),
  end: (sessionId: string) => api.post(`/doubt-sessions/${sessionId}/end`),
  join: (sessionId: string) => api.get(`/doubt-sessions/${sessionId}/join`),
  initiate: (sessionId: string) => api.post(`/doubt-sessions/${sessionId}/initiate-booking`),
  book: (sessionId: string, data: any) =>
    api.post(`/doubt-sessions/${sessionId}/book`, data),
};

// Enrollments
export const enrollmentCancelApi = {
  cancel: (enrollmentId: string) => api.delete(`/enrollments/${enrollmentId}`),
};

// Courses - additional
export const courseExtApi = {
  categories: () => api.get("/courses/categories"),
  submitReview: (courseId: string, data: FormData) =>
    api.post(`/courses/${courseId}/reviews`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateReview: (courseId: string, reviewId: string, data: FormData) =>
    api.patch(`/courses/${courseId}/reviews/${reviewId}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteReview: (courseId: string, reviewId: string) =>
    api.delete(`/courses/${courseId}/reviews/${reviewId}`),
};

// Platform
export const platformApi = {
  stats: () => api.get("/platform/stats"),
};
