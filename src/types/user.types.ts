/**
 * User Type Definitions
 *
 * Comprehensive types for user entities across the Smart Student Hub platform.
 * Covers Student, Faculty, and Admin roles with their specific attributes and relationships.
 *
 * Requirements:
 * - Firebase Auth integration (uid from Firebase)
 * - Firestore document fields (createdAt, updatedAt timestamps)
 * - Role-based access control (STUDENT, FACULTY, ADMIN)
 * - Profile completion tracking for onboarding
 */

import type { ActivityCategory } from "./activity.types";

/**
 * User Roles in the system with hierarchical permissions
 * @enum {string}
 */
export enum UserRole {
  STUDENT = "student",
  FACULTY = "faculty",
  ADMIN = "admin",
  MASTER_ADMIN = "master_admin",
}

/**
 * User account status for suspension/deactivation
 * @enum {string}
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
}

export interface SemesterCgpaEntry {
  semester: number;
  cgpa: number;
}

/**
 * Student-specific activity fields
 * Tracks participation in co-curricular activities
 */
export interface StudentProfile {
  /** Unique student ID (college-issued or generated) */
  studentId: string;

  /** Academic department (e.g., "Computer Science") */
  department: string;

  /** Academic year (1, 2, 3, 4) */
  year: number;

  /** Academic semester (1 through 8) */
  semester: number;

  /** Division / section identifier */
  division: string;

  /** Roll number assigned by the institution */
  rollNo: string;

  /** Academic branch / program name */
  branch: string;

  /** CGPA (0.0 to 10.0) */
  cgpa: number;

  /** Semester-wise CGPA values (Sem 1 to Sem 8) */
  semesterCgpa?: SemesterCgpaEntry[];

  /** Total activities submitted */
  totalActivities: number;

  /** Activities approved by faculty */
  approvedActivities: number;

  /** Activities currently under review */
  pendingActivities: number;

  /** Bio / short description */
  bio?: string;

  /** Skills list (comma-separated or array) */
  skills: string[];

  /** Interest areas / hobbies */
  interests?: string[];

  /** Links to portfolio, GitHub, LinkedIn, etc. */
  links?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };

  /** Profile completion percentage (0-100) */
  profileCompletion: number;
}

/**
 * Faculty-specific profile fields
 * Tracks reviewing and approving activities
 */
export interface FacultyProfile {
  /** Employee ID (college-issued) */
  employeeId: string;

  /** Department / Faculty */
  department: string;

  /** Designation (e.g., "Assistant Professor", "Professor") */
  designation: string;

  /** Office location / room number */
  office?: string;

  /** Office phone extension */
  phoneExt?: string;

  /** Specialization / expertise areas */
  specializations: string[];

  /** Categories this faculty member is allowed to review */
  reviewCategories?: ActivityCategory[];

  /** Total activities reviewed */
  activitiesReviewed: number;

  /** Bio / expertise summary */
  bio?: string;

  /** Office hours (e.g., "Mon-Wed 2-4 PM") */
  officeHours?: string;

  /** Available for review (true/false) */
  isAvailable: boolean;

  /** Profile completion percentage */
  profileCompletion: number;
}

/**
 * Admin-specific profile fields
 * For system administrators managing users and content
 */
export interface AdminProfile {
  /** Admin title / position */
  adminTitle: string;

  /** Department / Section managing */
  department?: string;

  /** Permissions level (super-admin, moderator, analyst) */
  permissionLevel: "super-admin" | "moderator" | "analyst";

  /** Users managed (count) */
  usersManagedCount: number;

  /** Last activity log timestamp */
  lastActivityLogAt?: number;
}

/**
 * Core user document in Firestore
 * Shared across all roles with conditional profile data
 *
 * Firestore path: `/users/{uid}`
 * where uid is Firebase Auth UID
 */
export interface User {
  /** Firebase Authentication UID (primary key) */
  uid: string;

  /** Legacy identifier alias kept for Zustand compatibility */
  id?: string;

  /** User's full name */
  fullName: string;

  /** Optional short display name used by legacy auth flows */
  displayName?: string;

  /** Email address (unique, from Firebase Auth) */
  email: string;

  /** Contact phone number (optional) */
  phone?: string;

  /** Institution identifier used for multi-campus deployments */
  institutionId?: string;

  /** User's role in the system */
  role: UserRole;

  /** Current account status */
  status: UserStatus;

  /** Quick flag for UI-level account visibility */
  isActive?: boolean;

  /** User's avatar/profile picture URL (Cloudinary CDN) */
  avatar?: string;

  /** Firebase Auth photoURL alias */
  photoURL?: string | null;

  /** Coverage colors / theme preference */
  themePreference?: "light" | "dark" | "system";

  /** Language preference (ISO 639-1 code) */
  language: string;

  /** Student profile data (only if role === STUDENT) */
  studentProfile?: StudentProfile;

  /** Faculty profile data (only if role === FACULTY) */
  facultyProfile?: FacultyProfile;

  /** Admin profile data (only if role === ADMIN) */
  adminProfile?: AdminProfile;

  /** Whether user has completed email verification */
  emailVerified: boolean;

  /** Two-factor authentication enabled */
  mfaEnabled: boolean;

  /** Last login timestamp (epoch milliseconds) */
  lastLoginAt?: number | Date;

  /** Convenience Date object for UI widgets */
  lastLogin?: number | Date;

  /** Last profile update timestamp */
  lastProfileUpdateAt?: number | Date;

  /** Document creation timestamp (auto-managed by Firestore) */
  createdAt: number | Date;

  /** Document last update timestamp (auto-managed by Firestore) */
  updatedAt: number | Date;

  /** Firebase Auth custom claims (managed server-side) */
  customClaims?: {
    role?: UserRole;
    permissions?: string[];
    org?: string;
  };

  /** Optional metadata for analytics / experimentation */
  metadata?: Record<string, unknown>;
}

/**
 * Minimal user data for public display
 * Exposed to other users (no sensitive data)
 *
 * Used in: Portfolio views, activity submissions, leaderboards
 */
export interface UserPublicProfile {
  uid: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  studentProfile?: Pick<StudentProfile, "department" | "year" | "skills" | "bio">;
  facultyProfile?: Pick<FacultyProfile, "department" | "designation" | "specializations">;
}

/**
 * User session data stored in cookies
 * Created on successful login, verified by middleware
 *
 * Custom session cookie claim structure
 */
export interface UserSession {
  /** Firebase UID */
  uid: string;

  /** User's email */
  email: string;

  /** User's role */
  role: UserRole;

  /** User's full name */
  fullName: string;

  /** User's avatar URL */
  avatar?: string;

  /** Session issued timestamp */
  iat: number;

  /** Session expiration timestamp (usually 7 days) */
  exp: number;

  /** Machine/user agent that created session (for security) */
  userAgent?: string;

  /** IP address that created session (for fraud detection) */
  ipAddress?: string;
}

/**
 * User registration data (before Firestore document created)
 * Used by signup API to validate and create user
 */
export interface UserRegistrationData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  studentId?: string; // Required if role === STUDENT
  department?: string; // Required for STUDENT & FACULTY
  year?: number; // Required if role === STUDENT
  employeeId?: string; // Required if role === FACULTY
  agreeToTerms: boolean;
}

/**
 * User profile update payload
 * Used by profile edit API
 */
export interface UserProfileUpdate {
  fullName?: string;
  phone?: string;
  avatar?: string;
  themePreference?: "light" | "dark" | "system";
  language?: string;
  bio?: string;
  studentProfile?: Partial<Omit<StudentProfile, "studentId">>;
  facultyProfile?: Partial<Omit<FacultyProfile, "employeeId">>;
}

/**
 * Pagination cursor for user listings
 * Supports cursor-based pagination for scalable queries
 */
export interface UserPaginationCursor {
  /** Last document snapshot ID */
  lastUserId?: string;

  /** Direction of pagination (next/previous) */
  direction: "next" | "previous";

  /** Number of results per page */
  limit: number;

  /** Optional filter by role */
  role?: UserRole;

  /** Optional filter by department */
  department?: string;

  /** Optional search query (full name or email) */
  searchQuery?: string;
}

/**
 * User listing response with cursor pagination
 * Returns next cursor for infinite scroll / pagination
 */
export interface UserListResponse {
  /** Array of users (minimal data for list display) */
  users: (User | UserPublicProfile)[];

  /** Cursor for next page of results */
  nextCursor?: string;

  /** Cursor for previous page of results */
  prevCursor?: string;

  /** Total count available (may be approximate for large collections) */
  totalCount?: number;

  /** Boolean indicating if more results exist */
  hasMore: boolean;
}
