/**
 * Role Utility Functions
 *
 * Permission checking, role validation, and access control helpers.
 */

import { UserRole } from "@/types";
import { ROLE_PERMISSIONS, ROLE_HIERARCHY, hasPermission as checkPermission } from "@/constants/roles";

/**
 * Check if user has specific permission
 * @param role - User role
 * @param permission - Permission to check (e.g., "activity:create")
 * @returns true if user has permission
 *
 * @example
 * hasPermission(UserRole.STUDENT, 'activity:create')
 * // true
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return checkPermission(role, permission);
}

/**
 * Check if user has any of the listed permissions
 * @param role - User role
 * @param permissions - Array of permissions
 * @returns true if user has any permission
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((perm) => checkPermission(role, perm));
}

/**
 * Check if user has all of the listed permissions
 * @param role - User role
 * @param permissions - Array of permissions
 * @returns true if user has all permissions
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every((perm) => checkPermission(role, perm));
}

/**
 * Check if one role is higher in hierarchy than another
 * @param userRole - User's role
 * @param requiredRole - Required role level
 * @returns true if user's role is equal or higher
 *
 * @example
 * isRoleHigher(UserRole.FACULTY, UserRole.STUDENT)
 * // true (Faculty > Student)
 */
export function isRoleHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get role hierarchy level
 * @param role - User role
 * @returns Numeric hierarchy level (lower = less privileged)
 *
 * @example
 * getRoleLevel(UserRole.ADMIN)
 * // 3
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role];
}

/**
 * Check if role is one of the allowed roles
 * @param role - User role
 * @param allowedRoles - Array of allowed roles
 * @returns true if role is in allowed list
 *
 * @example
 * isAllowedRole(UserRole.STUDENT, [UserRole.STUDENT, UserRole.FACULTY])
 * // true
 */
export function isAllowedRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role);
}

/**
 * Check if user can access resource based on their role
 * @param userRole - User role
 * @param requiredRoles - Roles allowed to access
 * @returns true if user can access
 */
export function canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some((role) => isRoleHigher(userRole, role));
}

/**
 * Get list of permissions for a role
 * @param role - User role
 * @returns Array of permission strings
 *
 * @example
 * getPermissions(UserRole.STUDENT)
 * // ['activity:create', 'activity:read:own', ...]
 */
export function getPermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if role should see admin panel
 * @param role - User role
 * @returns true if role can access admin features
 */
export function canAccessAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if role can review/approve activities
 * @param role - User role
 * @returns true if role can review
 */
export function canReview(role: UserRole): boolean {
  return hasPermission(role, "activity:approve");
}

/**
 * Check if role can submit activities
 * @param role - User role
 * @returns true if role can submit
 */
export function canSubmitActivity(role: UserRole): boolean {
  return hasPermission(role, "activity:create");
}

/**
 * Check if user can modify activity
 * @param role - User role
 * @param ownerId - Activity owner UID
 * @param userId - Current user UID
 * @returns true if user can modify
 */
export function canModifyActivity(
  role: UserRole,
  ownerId: string,
  userId: string
): boolean {
  // Owner can always modify their own
  if (ownerId === userId && hasPermission(role, "activity:update:own")) {
    return true;
  }

  // Faculty/Admin can modify any
  if (hasPermission(role, "activity:update")) {
    return true;
  }

  return false;
}

/**
 * Check if user can delete activity
 * @param role - User role
 * @param ownerId - Activity owner UID
 * @param userId - Current user UID
 * @returns true if user can delete
 */
export function canDeleteActivity(
  role: UserRole,
  ownerId: string,
  userId: string
): boolean {
  // Owner can delete their own draft/rejected
  if (ownerId === userId && hasPermission(role, "activity:delete:own")) {
    return true;
  }

  // Admin can delete any
  if (hasPermission(role, "activity:delete")) {
    return true;
  }

  return false;
}

/**
 * Check if user can view user profile
 * @param role - Current user role
 * @param targetRole - Profile owner role
 * @param isOwnProfile - Is it user's own profile
 * @returns true if user can view
 */
export function canViewProfile(
  role: UserRole,
  targetRole: UserRole,
  isOwnProfile: boolean
): boolean {
  // Users can always view their own profile
  if (isOwnProfile) return true;

  // Faculty can view student profiles
  if (role === UserRole.FACULTY && targetRole === UserRole.STUDENT) {
    return true;
  }

  // Admin can view any profile
  if (role === UserRole.ADMIN) {
    return true;
  }

  return false;
}

/**
 * Check if user can export data
 * @param role - User role
 * @returns true if user can export
 */
export function canExportData(role: UserRole): boolean {
  return hasAnyPermission(role, ["report:export", "user:export"]);
}

/**
 * Get role-based features
 * @param role - User role
 * @returns Array of available features
 */
export function getAvailableFeatures(role: UserRole): string[] {
  const features: Record<UserRole, string[]> = {
    [UserRole.STUDENT]: [
      "submit_activities",
      "view_own_portfolio",
      "share_portfolio",
    ],
    [UserRole.FACULTY]: [
      "review_activities",
      "view_student_portfolios",
      "bulk_approve",
    ],
    [UserRole.ADMIN]: [
      "manage_users",
      "view_analytics",
      "generate_reports",
      "manage_settings",
    ],
  };

  return features[role] || [];
}

/**
 * Get redirect URL based on role (e.g., on login)
 * @param role - User role
 * @returns Redirect URL path
 */
export function getRedirectUrlByRole(role: UserRole): string {
  const redirects: Record<UserRole, string> = {
    [UserRole.STUDENT]: "/student/dashboard",
    [UserRole.FACULTY]: "/faculty/dashboard",
    [UserRole.ADMIN]: "/admin/dashboard",
  };

  return redirects[role] || "/";
}

/**
 * Get role display name
 * @param role - User role
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    [UserRole.STUDENT]: "Student",
    [UserRole.FACULTY]: "Faculty",
    [UserRole.ADMIN]: "Administrator",
  };

  return names[role] || role;
}

/**
 * Validate if role change is allowed
 * @param fromRole - Current role
 * @param toRole - New role
 * @param changerRole - Role making the change
 * @returns true if change is allowed
 */
export function canChangeRole(
  fromRole: UserRole,
  toRole: UserRole,
  changerRole: UserRole
): boolean {
  // Only admins can change roles
  if (changerRole !== UserRole.ADMIN) {
    return false;
  }

  // Admin cannot be changed to other roles (needs super-admin or deletion)
  if (fromRole === UserRole.ADMIN) {
    return false;
  }

  return true;
}
