// API endpoints
export const API_ROUTES = {
  CHATBOT: "/api/chatbot",
  ATS_CHECKER: "/api/ats-checker",
  COURSES: "/api/courses",
  CERTIFICATES: "/api/certificates",
  STREAK: "/api/streak",
  VOICE_INTERVIEW: "/api/voice-interview",
  COURSE_GENERATOR: "/api/course-generator",
};

// Application routes
export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  RESUME: "/resume",
  RESUME_BUILD: "/resume/build",
  RESUME_ATS: "/resume/ats",
  INTERVIEW: "/interview",
  INTERVIEW_MOCK: "/interview/mock",
  VOICE_INTERVIEW: "/tools/voice-interview",
  COVER_LETTER: "/ai-cover-letter",
  COURSE_GENERATOR: "/course-generator",
  CERTIFICATES: "/certificates",
  ATS_CHECKER: "/ats-checker",
  CHATBOT: "/tools/chatbot",
  ONBOARDING: "/onboarding",
};

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Common messages
export const MESSAGES = {
  SUCCESS: {
    SAVED: "Saved successfully!",
    DELETED: "Deleted successfully!",
    UPDATED: "Updated successfully!",
    CREATED: "Created successfully!",
  },
  ERROR: {
    GENERIC: "Something went wrong. Please try again.",
    UNAUTHORIZED: "You must be logged in to perform this action.",
    NOT_FOUND: "Resource not found.",
    NETWORK: "Network error. Please check your connection.",
  },
  LOADING: {
    SAVING: "Saving...",
    LOADING: "Loading...",
    PROCESSING: "Processing...",
    GENERATING: "Generating...",
  },
};

// Form validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s()+-]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Course difficulty levels
export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Course categories
export const COURSE_CATEGORIES = [
  "Programming",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "AI & Machine Learning",
  "Blockchain",
  "UI/UX Design",
  "Business",
  "Other",
];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  RESUME: 5 * 1024 * 1024, // 5MB
  IMAGE: 2 * 1024 * 1024, // 2MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
};

// Supported file types
export const FILE_TYPES = {
  RESUME: [".pdf", ".doc", ".docx"],
  IMAGE: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  DOCUMENT: [".pdf", ".doc", ".docx", ".txt"],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "theme",
  USER_PREFERENCES: "user_preferences",
  DRAFT_RESUME: "draft_resume",
  ONBOARDING_COMPLETE: "onboarding_complete",
};

// Animation durations (in ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
