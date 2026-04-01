'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { useAuthStore } from '@/store/auth.store'

/**
 * Login Page
 * Public login page for email/password and Google OAuth
 * Redirects to dashboard if already authenticated
 * Supports redirect query param for returning to protected page after login
 */
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authStore = useAuthStore()
  const redirect = searchParams.get('redirect')

  // Redirect if already authenticated
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.user) {
      const roleDashboards: Record<string, string> = {
        admin: '/admin/dashboard',
        master_admin: '/master-admin/institutions',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      }
      const dashboardUrl = roleDashboards[authStore.user.role] || '/student/dashboard'
      router.push(dashboardUrl)
    }
  }, [authStore.isAuthenticated, authStore.user, router])

  const handleSuccess = () => {
    if (redirect) {
      router.push(decodeURIComponent(redirect))
    } else {
      const roleDashboards: Record<string, string> = {
        admin: '/admin/dashboard',
        master_admin: '/master-admin/institutions',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      }
      const userRole = authStore.userRole()
      const dashboardUrl = roleDashboards[userRole || 'student'] || '/student/dashboard'
      router.push(dashboardUrl)
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      {/* Login Form */}
      <LoginForm onSuccess={handleSuccess} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton onSuccess={handleSuccess} />

      {/* Sign Up Link */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-gray-600"
      >
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one here
        </Link>
      </motion.div>
    </motion.div>
  )
}
