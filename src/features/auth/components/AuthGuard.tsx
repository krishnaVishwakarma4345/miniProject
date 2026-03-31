'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types/user.types'

export interface AuthGuardProps {
  children: ReactNode
  requiredRole?: UserRole
  redirectTo?: string
  fallback?: ReactNode
}

/**
 * AuthGuard Component
 * Protects routes from unauthorized access
 * Redirects unauthenticated users to login
 * Redirects users without required role to dashboard
 * 
 * Features:
 * - Checks authentication on mount
 * - Role-based access control
 * - Animated error message for unauthorized access
 * - Loading skeleton while checking auth
 * - Smooth redirect without jarring transitions
 * 
 * Usage:
 * <AuthGuard requiredRole="admin">
 *   <AdminPanel />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  requiredRole,
  redirectTo,
  fallback
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const authStore = useAuthStore()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      // Restore session if not already loaded
      if (!authStore.isAuthenticated) {
        await authStore.restoreSession()
      }

      const isAuthenticated = authStore.isAuthenticated
      const userRole = authStore.userRole()

      // Check authentication
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // Check role authorization if required
      if (requiredRole) {
        const hasRequiredRole =
          userRole === requiredRole ||
          userRole === 'admin' // Admin always has access

        if (!hasRequiredRole) {
          // Wrong role, show error then redirect
          setShowError(true)

          // Redirect after 1.2s delay for UX
          const timeout = setTimeout(() => {
            const roleDashboards: Record<string, string> = {
              admin: '/admin/dashboard',
              faculty: '/faculty/dashboard',
              student: '/student/dashboard'
            }
            const dashboardUrl = roleDashboards[userRole || ''] || '/login'
            router.push(dashboardUrl)
          }, 1200)

          return () => clearTimeout(timeout)
        }
      }

      // All checks passed
      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [authStore, router, pathname, requiredRole])

  // Loading state
  if (isLoading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gray-50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"
        />
      </motion.div>
    )
  }

  // Error state (unauthorized access)
  if (showError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex items-center justify-center min-h-screen bg-gray-50"
      >
        <div className="max-w-md w-full px-6">
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-red-500"
          >
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. You'll be redirected shortly.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 text-sm text-gray-500"
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                •
              </motion.span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.15 }}
              >
                •
              </motion.span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                •
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : null
  }

  // Authorized, render children
  return <AnimatePresence>{children}</AnimatePresence>
}
