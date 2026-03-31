/**
 * User Roles Constants
 * Defines role types, permissions, and access levels
 */

import { UserRole } from "@/types";

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STUDENT]: "Student",
  [UserRole.FACULTY]: "Faculty",
  [UserRole.ADMIN]: "Administrator",
} as const;

/**
 * Role descriptions for onboarding/UI
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.STUDENT]:
    "Submit co-curricular activities, build your portfolio, and track approvals",
  [UserRole.FACULTY]:
    "Review and approve student activities, provide feedback, and manage submissions",
  [UserRole.ADMIN]:
    "Manage users, view analytics, generate reports, and configure system settings",
} as const;

/**
 * Permissions per role
 * Defines what actions each role can perform
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.STUDENT]: [
    "activity:create",
    "activity:read:own",
    "activity:update:own",
    "activity:delete:own",
    "activity:submit",
    "activity:list:own",
    "portfolio:read:own",
    "portfolio:update:own",
    "portfolio:share",
    "profile:read:own",
    "profile:update:own",
    "notification:read",
    "notification:update",
  ],

  [UserRole.FACULTY]: [
    "activity:read",
    "activity:approve",
    "activity:reject",
    "activity:comment",
    "review:manage",
    "review:assign",
    "student:list",
    "student:read",
    "portfolio:read",
    "portfolio:comment",
    "report:read",
    "profile:read",
    "profile:update",
    "notification:read",
  ],

  [UserRole.ADMIN]: [
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "user:change-role",
    "user:change-status",
    "user:bulk-import",
    "user:export",
    "activity:read",
    "activity:delete",
    "portfolio:delete",
    "analytics:read",
    "report:read",
    "report:generate",
    "report:export",
    "department:manage",
    "settings:manage",
    "audit-log:read",
    "system:health-check",
  ],
} as const;

/**
 * Available roles for registration
 * Users can only sign up as Student or Faculty
 * Admin accounts are created by admins only
 */
export const PUBLICLY_REGISTRABLE_ROLES = [
  UserRole.STUDENT,
  UserRole.FACULTY,
] as const;

/**
 * Role-based feature availability
 * Used to conditionally show/hide features in UI
 */
export const ROLE_FEATURES: Record<UserRole, string[]> = {
  [UserRole.STUDENT]: [
    "activity_submission",
    "portfolio_building",
    "activity_tracking",
    "share_portfolio",
    "view_results",
  ],

  [UserRole.FACULTY]: [
    "review_activities",
    "bulk_approval",
    "student_filtering",
    "department_reports",
    "activity_assignment",
  ],

  [UserRole.ADMIN]: [
    "user_management",
    "role_management",
    "system_analytics",
    "report_generation",
    "audit_logging",
    "settings_control",
  ],
} as const;

/**
 * Role hierarchy for permission inheritance
 * Lower hierarchy levels inherit permissions from higher levels
 * student < faculty < admin
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.STUDENT]: 1,
  [UserRole.FACULTY]: 2,
  [UserRole.ADMIN]: 3,
} as const;

/**
 * Check if a role has permission for an action
 * @param role - User role
 * @param permission - Permission string (e.g., "activity:create")
 * @returns true if role has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role is equal or higher in hierarchy than another
 * @param userRole - User's role
 * @param requiredRole - Required role for access
 * @returns true if user's role is equal or higher
 */
export function hasRoleHierarchy(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all roles that can perform an action
 * @param permission - Permission string
 * @returns Array of roles with permission
 */
export function getRolesWithPermission(permission: string): UserRole[] {
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([_, perms]) => perms.includes(permission))
    .map(([role]) => role as UserRole);
}

/**
 * Color coding for roles in UI
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.STUDENT]: "blue",
  [UserRole.FACULTY]: "purple",
  [UserRole.ADMIN]: "red",
} as const;

/**
 * Icons for roles
 */
export const ROLE_ICONS: Record<UserRole, string> = {
  [UserRole.STUDENT]: "graduation-cap",
  [UserRole.FACULTY]: "chalkboard-teacher",
  [UserRole.ADMIN]: "shield-star",
} as const;
