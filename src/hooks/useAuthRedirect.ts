'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types/user.types'

export type UseAuthRedirectReturn = {
  isAuthorized: boolean
  isLoading: boolean
  requiredRole?: UserRole
}

/**
 * useAuthRedirect Hook
 * Handles authentication and role-based redirects
 * Redirects unauthenticated users to login
 * Redirects unauthorized users (wrong role) to appropriate dashboard
 * 
 * Usage in server components:
 * const { isAuthorized, isLoading } = useAuthRedirect({ requiredRole: 'admin' })
 * if (!isAuthorized) return <div>Unauthorized</div>
 */
export function useAuthRedirect(options?: {
  requiredRole?: UserRole
  redirectTo?: string
}): UseAuthRedirectReturn {
  const router = useRouter()
  const pathname = usePathname()
  const authStore = useAuthStore()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      // Restore session in case it's not yet loaded
      if (!authStore.isAuthenticated) {
        await authStore.restoreSession()
      }

      const isAuthenticated = authStore.isAuthenticated
      const userRole = authStore.userRole()

      // Check authentication
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      // Check role authorization if required
      if (options?.requiredRole) {
        const hasRequiredRole = 
          userRole === options.requiredRole || 
          userRole === 'admin' // Admin always has access

        if (!hasRequiredRole) {
          // Wrong role, redirect to appropriate dashboard
          const roleDashboards: Record<string, string> = {
            admin: '/admin/dashboard',
            master_admin: '/master-admin/institutions',
            faculty: '/faculty/dashboard',
            student: '/student/dashboard'
          }
          const dashboardUrl = roleDashboards[userRole || ''] || '/login'
          router.push(dashboardUrl)
          setIsAuthorized(false)
          setIsLoading(false)
          return
        }
      }

      // All checks passed
      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [authStore, router, pathname, options?.requiredRole])

  return {
    isAuthorized,
    isLoading,
    requiredRole: options?.requiredRole
  }
}
