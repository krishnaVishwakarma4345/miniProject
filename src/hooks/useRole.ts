'use client'

import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types/user.types'

export type UseRoleReturn = {
  role: UserRole | null
  isAdmin: boolean
  isFaculty: boolean
  isStudent: boolean
  canView: (role: UserRole) => boolean
  canEdit: (role: UserRole) => boolean
  canDelete: (role: UserRole) => boolean
}

/**
 * useRole Hook
 * Query user role and permission helper methods
 * Simplifies role checking in components
 * 
 * Usage:
 * const { isAdmin, isFaculty } = useRole()
 * if (isAdmin) return <AdminPanel />
 */
export function useRole(): UseRoleReturn {
  const authStore = useAuthStore()
  const role = authStore.userRole()

  // Role-based permissions
  const isAdmin = role === 'admin'
  const isFaculty = role === 'faculty' || isAdmin
  const isStudent = role === 'student' || isFaculty

  /**
   * Check if current user can view content for given role
   * Admin can view everything
   * Faculty can view student content
   * Student can only view own content
   */
  const canView = (requiredRole: UserRole): boolean => {
    if (isAdmin) return true
    if (isFaculty && requiredRole === 'student') return true
    if (isStudent && requiredRole === 'student') return true
    return false
  }

  /**
   * Check if current user can edit content for given role
   * Only admins and content owners can edit
   */
  const canEdit = (ownerRole: UserRole): boolean => {
    if (isAdmin) return true
    // For student content, only if user is the owner (checked at component level)
    if (ownerRole === 'student' && isStudent) return true
    return false
  }

  /**
   * Check if current user can delete content for given role
   * Only admins can delete
   */
  const canDelete = (contentRole: UserRole): boolean => {
    return isAdmin
  }

  return {
    role,
    isAdmin,
    isFaculty,
    isStudent,
    canView,
    canEdit,
    canDelete
  }
}
