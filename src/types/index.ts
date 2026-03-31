/**
 * Central Type Exports
 *
 * Single source of truth for all application types.
 * Importing from '@/types' re-exports all type definitions.
 *
 * Usage:
 * import type { User, Activity, UserRole } from '@/types';
 */

// ============================================
// USER TYPES
// ============================================
export type {
  User,
  UserPublicProfile,
  UserSession,
  UserRegistrationData,
  UserProfileUpdate,
  UserPaginationCursor,
  UserListResponse,
  StudentProfile,
  FacultyProfile,
  AdminProfile,
} from "./user.types";

export {
  UserRole,
  UserStatus,
} from "./user.types";

// ============================================
// ACTIVITY TYPES
// ============================================
export type {
  Activity,
  ActivityUpdate,
  ActivityCreateRequest,
  ActivityFilterCriteria,
  ActivityListResponse,
  ActivityStats,
  ProofFile,
  ActivityReview,
  ActivityComment,
} from "./activity.types";

export {
  ActivityCategory,
  ActivityType,
  ActivityStatus,
} from "./activity.types";

// ============================================
// NOTIFICATION TYPES
// ============================================
export type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  NotificationQueryFilter,
  NotificationListResponse,
  NotificationAction,
  BatchNotificationRequest,
  ActivityNotificationPayload,
  AnnouncementNotificationPayload,
} from "./notification.types";

export {
  NotificationType,
  NotificationPriority,
} from "./notification.types";

// ============================================
// API TYPES
// ============================================
export type {
  ApiResponse,
  ApiErrorResponse,
  PaginationCursor,
  PaginatedApiResponse,
  ApiRequestHeaders,
  AuthRequest,
  AuthResponse,
  FileUploadRequest,
  FileUploadResponse,
  CloudinarySignatureRequest,
  CloudinarySignatureResponse,
  BulkActionRequest,
  ListQueryParams,
  CacheControl,
  RateLimitHeaders,
  ValidationErrorResponse,
  WebhookPayload,
} from "./api.types";
