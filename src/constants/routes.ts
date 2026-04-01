/**
 * Application Route Constants
 *
 * Centralized routing configuration for the entire application.
 * Used by navigation, middleware, and link generation.
 *
 * Routes are organized by user role:
 * - PUBLIC: No authentication required
 * - STUDENT: Student dashboard and features
 * - FACULTY: Faculty review and management
 * - ADMIN: System administration and analytics
 */

/**
 * Public routes (no authentication required)
 * Accessible to all users, including logged out
 */
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/not-found",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  CONTACT: "/contact",
  HELP: "/help",
} as const;

/**
 * Student routes (authenticated, role: student)
 * Student dashboard, activity management, portfolio
 */
export const STUDENT_ROUTES = {
  DASHBOARD: "/student/dashboard",
  ACTIVITIES: "/student/activities",
  ACTIVITY_CREATE: "/student/activities/add",
  ACTIVITY_DETAIL: (id: string) => `/student/activities/${id}`,
  ACTIVITY_EDIT: (id: string) => `/student/activities/${id}/edit`,
  PORTFOLIO: "/student/portfolio",
  PORTFOLIO_PUBLIC: (studentId: string) => `/student/portfolio/${studentId}`,
  PROFILE: "/student/profile",
  PROFILE_EDIT: "/student/profile/edit",
  NOTIFICATIONS: "/student/notifications",
  SETTINGS: "/student/settings",
} as const;

/**
 * Faculty routes (authenticated, role: faculty)
 * Activity review queue, student portfolios, department management
 */
export const FACULTY_ROUTES = {
  DASHBOARD: "/faculty/dashboard",
  REVIEW_QUEUE: "/faculty/review",
  REVIEW_DETAIL: (id: string) => `/faculty/review/${id}`,
  STUDENTS: "/faculty/students",
  STUDENT_DETAIL: (id: string) => `/faculty/students/${id}`,
  PORTFOLIOS: "/faculty/portfolios",
  PORTFOLIO_VIEW: (id: string) => `/faculty/portfolios/${id}`,
  DEPARTMENT: "/faculty/department",
  REPORTS: "/faculty/reports",
  PROFILE: "/faculty/profile",
  PROFILE_EDIT: "/faculty/profile/edit",
  NOTIFICATIONS: "/faculty/notifications",
  SETTINGS: "/faculty/settings",
} as const;

/**
 * Admin routes (authenticated, role: admin)
 * User management, analytics, system configuration
 */
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  USERS: "/admin/users",
  USER_DETAIL: (id: string) => `/admin/users/${id}`,
  USER_EDIT: (id: string) => `/admin/users/${id}/edit`,
  ANALYTICS: "/admin/analytics",
  REPORTS: "/admin/reports",
  ACTIVITIES: "/admin/activities",
  ACTIVITY_DETAIL: (id: string) => `/admin/activities/${id}`,
  DEPARTMENTS: "/admin/departments",
  SETTINGS: "/admin/settings",
  AUDIT_LOG: "/admin/audit-log",
  SYSTEM_HEALTH: "/admin/system-health",
} as const;

/**
 * Master admin routes (authenticated, role: master_admin)
 * Institution tenancy administration only
 */
export const MASTER_ADMIN_ROUTES = {
  INSTITUTIONS: "/master-admin/institutions",
} as const;

/**
 * API route prefixes
 * Used for fetching data, form submissions, file uploads
 */
export const API_ROUTES = {
  // Authentication
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_SESSION: "/api/auth/session",
  AUTH_FORGOT_PASSWORD: "/api/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/api/auth/reset-password",
  AUTH_VERIFY_EMAIL: "/api/auth/verify-email",
  AUTH_RESEND_EMAIL: "/api/auth/resend-verification",
  AUTH_SIGNUP_GOOGLE: "/api/auth/google",

  // Activities
  ACTIVITY_CREATE: "/api/activity/create",
  ACTIVITY_LIST: "/api/activity/list",
  ACTIVITY_GET: (id: string) => `/api/activity/${id}`,
  ACTIVITY_UPDATE: (id: string) => `/api/activity/${id}`,
  ACTIVITY_DELETE: (id: string) => `/api/activity/${id}`,
  ACTIVITY_SUBMIT: (id: string) => `/api/activity/${id}/submit`,
  ACTIVITY_APPROVE: (id: string) => `/api/activity/${id}/approve`,
  ACTIVITY_REJECT: (id: string) => `/api/activity/${id}/reject`,
  ACTIVITY_FILTER: "/api/activity/filter",
  ACTIVITY_BULK_ACTION: "/api/activity/bulk-action",
  ACTIVITY_STUDENT: (studentId: string) => `/api/activity/student/${studentId}`,

  // Reviews
  REVIEW_QUEUE: "/api/review/queue",
  REVIEW_ASSIGN: "/api/review/assign",
  REVIEW_BULK: "/api/review/bulk-action",
  REVIEW_HISTORY: (activityId: string) => `/api/review/history/${activityId}`,
  REVIEW_COMMENT: (activityId: string) => `/api/review/${activityId}/comment`,

  // Users
  USER_PROFILE: "/api/user/profile",
  USER_PROFILE_UPDATE: "/api/user/profile",
  USER_CHANGE_PASSWORD: "/api/user/change-password",
  USER_DELETE_ACCOUNT: "/api/user/delete-account",
  USER_LIST: "/api/users",
  USER_GET: (id: string) => `/api/users/${id}`,
  USER_UPDATE: (id: string) => `/api/users/${id}`,
  USER_CHANGE_ROLE: (id: string) => `/api/users/${id}/role`,
  USER_CHANGE_STATUS: (id: string) => `/api/users/${id}/status`,
  USER_BULK_IMPORT: "/api/users/bulk-import",

  // Portfolio
  PORTFOLIO_GET: (studentId: string) => `/api/portfolio/${studentId}`,
  PORTFOLIO_UPDATE: "/api/portfolio/update",
  PORTFOLIO_SHARE_LINK: "/api/portfolio/share-link",
  PORTFOLIO_SHARE_PUBLIC: (token: string) => `/api/portfolio/public/${token}`,

  // Uploads
  FILE_UPLOAD_SIGN: "/api/upload/sign",
  FILE_DELETE: "/api/upload/delete",
  PROFILE_PICTURE_UPLOAD: "/api/upload/profile-picture",

  // Notifications
  NOTIFICATION_LIST: "/api/notifications",
  NOTIFICATION_MARK_READ: (id: string) => `/api/notifications/${id}/read`,
  NOTIFICATION_MARK_ALL_READ: "/api/notifications/mark-all-read",
  NOTIFICATION_ARCHIVE: (id: string) => `/api/notifications/${id}/archive`,
  NOTIFICATION_PREFERENCES: "/api/notifications/preferences",
  NOTIFICATION_PREFERENCES_UPDATE: "/api/notifications/preferences",

  // Analytics
  ANALYTICS_OVERVIEW: "/api/analytics/overview",
  ANALYTICS_FILTERS: "/api/analytics/filters",
  ANALYTICS_EXPORT: "/api/analytics/export",
  ANALYTICS_PARTICIPATION: "/api/analytics/participation",
  ANALYTICS_DEPARTMENT: "/api/analytics/department",
  ANALYTICS_CATEGORY: "/api/analytics/category",
  ANALYTICS_TRENDS: "/api/analytics/trends",

  // Reports
  REPORT_LIST: "/api/reports",
  REPORT_GENERATE: "/api/reports/generate",
  REPORT_DOWNLOAD: (id: string) => `/api/reports/${id}/download`,

  // Admin
  ADMIN_STATS: "/api/admin/stats",
  ADMIN_SETTINGS: "/api/admin/settings",
  ADMIN_SETTINGS_UPDATE: "/api/admin/settings",
  ADMIN_AUDIT_LOG: "/api/admin/audit-log",
  ADMIN_SYSTEM_HEALTH: "/api/admin/system-health",
} as const;

/**
 * Route matching patterns for middleware
 * Used by middleware.ts to protect routes
 */
export const ROLE_ROUTES = {
  student: [
    STUDENT_ROUTES.DASHBOARD,
    STUDENT_ROUTES.ACTIVITIES,
    STUDENT_ROUTES.ACTIVITY_CREATE,
    STUDENT_ROUTES.PORTFOLIO,
    STUDENT_ROUTES.PROFILE,
    STUDENT_ROUTES.NOTIFICATIONS,
    STUDENT_ROUTES.SETTINGS,
  ],
  faculty: [
    FACULTY_ROUTES.DASHBOARD,
    FACULTY_ROUTES.REVIEW_QUEUE,
    FACULTY_ROUTES.STUDENTS,
    FACULTY_ROUTES.PORTFOLIOS,
    FACULTY_ROUTES.DEPARTMENT,
    FACULTY_ROUTES.REPORTS,
    FACULTY_ROUTES.PROFILE,
    FACULTY_ROUTES.NOTIFICATIONS,
    FACULTY_ROUTES.SETTINGS,
  ],
  admin: [
    ADMIN_ROUTES.DASHBOARD,
    ADMIN_ROUTES.USERS,
    ADMIN_ROUTES.ANALYTICS,
    ADMIN_ROUTES.REPORTS,
    ADMIN_ROUTES.ACTIVITIES,
    ADMIN_ROUTES.DEPARTMENTS,
    ADMIN_ROUTES.SETTINGS,
    ADMIN_ROUTES.AUDIT_LOG,
    ADMIN_ROUTES.SYSTEM_HEALTH,
  ],
  master_admin: [
    MASTER_ADMIN_ROUTES.INSTITUTIONS,
  ],
} as const;

/**
 * Redirect map on login
 * Redirects user to appropriate dashboard based on role
 */
export const LOGIN_REDIRECTS = {
  student: STUDENT_ROUTES.DASHBOARD,
  faculty: FACULTY_ROUTES.DASHBOARD,
  admin: ADMIN_ROUTES.DASHBOARD,
  master_admin: MASTER_ADMIN_ROUTES.INSTITUTIONS,
} as const;

/**
 * Route group prefixes (for layout grouping)
 * Used with Next.js folder-based routing
 */
export const ROUTE_GROUPS = {
  PUBLIC: "(public)",
  STUDENT: "(student)",
  FACULTY: "(faculty)",
  ADMIN: "(admin)",
  MASTER_ADMIN: "(master-admin)",
} as const;
