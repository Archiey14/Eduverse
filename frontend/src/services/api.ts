const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const TOKEN_KEY = "eduverse_token";
const USER_KEY = "eduverse_user";

/* ------------------------------------------------------------------ */
/* Token + user storage                                                */
/* ------------------------------------------------------------------ */

export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token: string, remember = true): void => {
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  other.removeItem(TOKEN_KEY);
  target.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  const target = sessionStorage.getItem(TOKEN_KEY)
    ? sessionStorage
    : localStorage;

  target.setItem(USER_KEY, JSON.stringify(user));
};

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status = 0, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export const isNetworkError = (err: unknown): boolean =>
  err instanceof ApiError && err.status === 0;

export const getErrorMessage = (
  err: unknown,
  fallback = "Something went wrong."
): string => {
  if (err instanceof ApiError) {
    if (err.errors && err.errors.length > 0) {
      return `${err.message} ${err.errors.join(" ")}`.trim();
    }

    return err.message || fallback;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};

/* ------------------------------------------------------------------ */
/* Fetch wrapper                                                       */
/* ------------------------------------------------------------------ */

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  /*
   * JSON requests use application/json.
   *
   * FormData requests must NOT manually set Content-Type because
   * the browser automatically creates the multipart boundary.
   */
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${API_BASE_URL}. Make sure the backend is running.`,
      0
    );
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || `Request failed (${response.status}).`,
      response.status,
      data?.errors
    );
  }

  return data as T;
};

/* ------------------------------------------------------------------ */
/* Query + JSON helpers                                                */
/* ------------------------------------------------------------------ */

const toQuery = (params?: Record<string, any>): string => {
  if (!params) return "";

  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");

  return qs ? `?${qs}` : "";
};

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

/* ------------------------------------------------------------------ */
/* API service modules                                                 */
/* ------------------------------------------------------------------ */

export const api = {
  /* ---------------------------------------------------------------- */
  /* Auth                                                              */
  /* ---------------------------------------------------------------- */

  auth: {
    register: (body: {
      name: string;
      email: string;
      password: string;
    }) => request<any>("/auth/register", json("POST", body)),

    login: (body: {
      email: string;
      password: string;
    }) => request<any>("/auth/login", json("POST", body)),

    verifyOTP: (body: {
      userId: string;
      code: string;
    }) => request<any>("/auth/verify-otp", json("POST", body)),

    googleAuth: (body: {
      email: string;
      name?: string;
      avatarUrl?: string;
      googleId?: string;
      idToken?: string;
    }) => request<any>("/auth/google", json("POST", body)),

    getMe: () => request<any>("/auth/me"),

    becomeMentor: (body: {
      headline?: string;
      bio?: string;
      expertise?: string[];
    }) => request<any>("/auth/become-mentor", json("POST", body)),

    updateMe: (body: any) =>
      request<any>("/auth/me", json("PATCH", body)),

    updatePassword: (body: {
      currentPassword: string;
      newPassword: string;
    }) => request<any>("/auth/password", json("PATCH", body)),

    /* Profile picture upload */
    uploadAvatar: (file: File) => {
      const formData = new FormData();

      formData.append("avatar", file);

      return request<any>("/auth/avatar", {
        method: "POST",
        body: formData,
      });
    },
  },

  /* ---------------------------------------------------------------- */
  /* Categories                                                        */
  /* ---------------------------------------------------------------- */

  categories: {
    getAll: () => request<any>("/categories"),
  },

  /* ---------------------------------------------------------------- */
  /* Courses                                                           */
  /* ---------------------------------------------------------------- */

  courses: {
    getAll: (params?: Record<string, any>) =>
      request<any>(`/courses${toQuery(params)}`),

    getByIdOrSlug: (idOrSlug: string) =>
      request<any>(
        `/courses/${encodeURIComponent(idOrSlug)}`
      ),

    getReviews: (courseId: string, page = 1) =>
      request<any>(
        `/courses/${courseId}/reviews?page=${page}`
      ),

    submitReview: (
      courseId: string,
      body: {
        rating: number;
        comment?: string;
      }
    ) =>
      request<any>(
        `/courses/${courseId}/reviews`,
        json("POST", body)
      ),

    deleteMyReview: (courseId: string) =>
      request<any>(
        `/courses/${courseId}/reviews/mine`,
        json("DELETE")
      ),
  },

  /* ---------------------------------------------------------------- */
  /* Student & learning                                               */
  /* ---------------------------------------------------------------- */

  dashboard: {
    getStudentDashboard: () =>
      request<any>("/student/dashboard"),

    getStudentQuizzes: () =>
      request<any>("/student/quizzes"),
  },

  wishlist: {
    getAll: () =>
      request<any>("/wishlist"),

    add: (courseId: string) =>
      request<any>(
        `/wishlist/${courseId}`,
        json("POST")
      ),

    remove: (courseId: string) =>
      request<any>(
        `/wishlist/${courseId}`,
        json("DELETE")
      ),
  },

  enrollments: {
    enroll: (courseId: string) =>
      request<any>(
        "/enrollments",
        json("POST", { courseId })
      ),

    getMyEnrollments: () =>
      request<any>("/enrollments/mine"),

    unenroll: (courseId: string) =>
      request<any>(
        `/enrollments/${courseId}`,
        json("DELETE")
      ),
  },

  learn: {
    getCourseView: (courseId: string) =>
      request<any>(
        `/learn/courses/${courseId}`
      ),

    getLesson: (lessonId: string) =>
      request<any>(
        `/learn/lessons/${lessonId}`
      ),

    completeLesson: (lessonId: string) =>
      request<any>(
        `/learn/lessons/${lessonId}/complete`,
        json("POST")
      ),

    uncompleteLesson: (lessonId: string) =>
      request<any>(
        `/learn/lessons/${lessonId}/complete`,
        json("DELETE")
      ),

    getQuiz: (quizId: string) =>
      request<any>(
        `/learn/quizzes/${quizId}`
      ),

    submitQuiz: (
      quizId: string,
      answers: {
        questionId: string;
        selectedIndex: number;
      }[]
    ) =>
      request<any>(
        `/learn/quizzes/${quizId}/attempts`,
        json("POST", { answers })
      ),

    getMyQuizAttempts: (quizId: string) =>
      request<any>(
        `/learn/quizzes/${quizId}/attempts`
      ),

    getDiscussions: (courseId: string, lessonId?: string) =>
      request<any>(`/learn/courses/${courseId}/discussions${lessonId ? `?lessonId=${lessonId}` : ""}`),
    
    createDiscussion: (courseId: string, content: string, lessonId?: string) =>
      request<any>(`/learn/courses/${courseId}/discussions`, json("POST", { content, lessonId })),
    
    createReply: (discussionId: string, content: string) =>
      request<any>(`/learn/discussions/${discussionId}/replies`, json("POST", { content })),
  },

  /* ---------------------------------------------------------------- */
  /* Mentor studio                                                    */
  /* ---------------------------------------------------------------- */

  mentor: {
    getDashboard: () =>
      request<any>("/mentor/dashboard"),

    getAnalytics: () =>
      request<any>("/mentor/analytics"),

    sendAnnouncement: (
      courseId: string,
      message: string
    ) =>
      request<any>(
        `/mentor/courses/${courseId}/announcement`,
        json("POST", { message })
      ),

    getMyCourses: (
      params?: Record<string, any>
    ) =>
      request<any>(
        `/mentor/courses${toQuery(params)}`
      ),

    getCourse: (id: string) =>
      request<any>(
        `/mentor/courses/${id}`
      ),

    createCourse: (body: any) =>
      request<any>(
        "/mentor/courses",
        json("POST", body)
      ),

    updateCourse: (
      id: string,
      body: any
    ) =>
      request<any>(
        `/mentor/courses/${id}`,
        json("PATCH", body)
      ),

    deleteCourse: (id: string) =>
      request<any>(
        `/mentor/courses/${id}`,
        json("DELETE")
      ),

    publishCourse: (id: string) =>
      request<any>(
        `/mentor/courses/${id}/publish`,
        json("POST")
      ),

    unpublishCourse: (id: string) =>
      request<any>(
        `/mentor/courses/${id}/unpublish`,
        json("POST")
      ),

    addSection: (
      courseId: string,
      body: {
        title: string;
      }
    ) =>
      request<any>(
        `/mentor/courses/${courseId}/sections`,
        json("POST", body)
      ),

    deleteSection: (
      courseId: string,
      sectionId: string,
      force = true
    ) =>
      request<any>(
        `/mentor/courses/${courseId}/sections/${sectionId}${
          force ? "?force=true" : ""
        }`,
        json("DELETE")
      ),

    getCourseStudents: (
      courseId: string,
      page = 1
    ) =>
      request<any>(
        `/mentor/courses/${courseId}/students?page=${page}`
      ),

    addLesson: (
      courseId: string,
      body: any
    ) =>
      request<any>(
        `/mentor/courses/${courseId}/lessons`,
        json("POST", body)
      ),

    deleteLesson: (lessonId: string) =>
      request<any>(
        `/mentor/lessons/${lessonId}`,
        json("DELETE")
      ),

    updateLesson: (
      lessonId: string,
      body: any
    ) =>
      request<any>(
        `/mentor/lessons/${lessonId}`,
        json("PATCH", body)
      ),

    getQuiz: (quizId: string) =>
      request<any>(
        `/mentor/quizzes/${quizId}`
      ),

    createQuiz: (
      courseId: string,
      body: any
    ) =>
      request<any>(
        `/mentor/courses/${courseId}/quizzes`,
        json("POST", body)
      ),

    updateQuiz: (
      quizId: string,
      body: any
    ) =>
      request<any>(
        `/mentor/quizzes/${quizId}`,
        json("PATCH", body)
      ),

    deleteQuiz: (quizId: string) =>
      request<any>(
        `/mentor/quizzes/${quizId}`,
        json("DELETE")
      ),
  },

  /* ---------------------------------------------------------------- */
  /* Admin                                                            */
  /* ---------------------------------------------------------------- */

  admin: {
    getStats: () =>
      request<any>("/admin/stats"),

    getUsers: (
      params?: Record<string, any>
    ) =>
      request<any>(
        `/admin/users${toQuery(params)}`
      ),

    updateUser: (
      id: string,
      body: {
        roles?: string[];
        isActive?: boolean;
      }
    ) =>
      request<any>(
        `/admin/users/${id}`,
        json("PATCH", body)
      ),

    getCourses: (
      params?: Record<string, any>
    ) =>
      request<any>(
        `/admin/courses${toQuery(params)}`
      ),

    updateCourseStatus: (
      id: string,
      status:
        | "draft"
        | "published"
        | "archived"
    ) =>
      request<any>(
        `/admin/courses/${id}/status`,
        json("PATCH", { status })
      ),

    getEnrollments: (
      params?: Record<string, any>
    ) =>
      request<any>(
        `/admin/enrollments${toQuery(params)}`
      ),

    createCategory: (body: {
      name: string;
      slug?: string;
      description?: string;
    }) =>
      request<any>(
        "/admin/categories",
        json("POST", body)
      ),

    updateCategory: (
      id: string,
      body: {
        name?: string;
        slug?: string;
        description?: string;
      }
    ) =>
      request<any>(
        `/admin/categories/${id}`,
        json("PATCH", body)
      ),

    deleteCategory: (id: string) =>
      request<any>(
        `/admin/categories/${id}`,
        json("DELETE")
      ),
  },

  /* ---------------------------------------------------------------- */
  /* Notifications                                                    */
  /* ---------------------------------------------------------------- */

  notifications: {
    getAll: (
      page = 1,
      role?: "student" | "mentor"
    ) =>
      request<any>(
        `/notifications?page=${page}${
          role ? `&role=${role}` : ""
        }`
      ),

    markAsRead: (id: string) =>
      request<any>(
        `/notifications/${id}/read`,
        json("PATCH")
      ),

    markAllAsRead: (
      role?: "student" | "mentor"
    ) =>
      request<any>(
        `/notifications/read-all${
          role ? `?role=${role}` : ""
        }`,
        json("PATCH")
      ),
  },

  /* ---------------------------------------------------------------- */
  /* Activity                                                         */
  /* ---------------------------------------------------------------- */

  activity: {
    getMyActivities: (
      page = 1,
      limit = 20
    ) =>
      request<any>(
        `/activity/mine?page=${page}&limit=${limit}`
      ),
  },
};