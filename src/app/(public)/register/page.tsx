'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { useAuthStore } from '@/store/auth.store'

/**
 * Register Page
 * Public registration page for creating new accounts
 * Supports both email/password and Google OAuth registration
 * Redirects to dashboard if already authenticated
 */
export default function RegisterPage() {
  const router = useRouter()
  const authStore = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.user) {
      const roleDashboards: Record<string, string> = {
        admin: '/admin/dashboard',
        faculty: '/faculty/dashboard',
        student: '/student/dashboard'
      }
      const dashboardUrl = roleDashboards[authStore.user.role] || '/student/dashboard'
      router.push(dashboardUrl)
    }
  }, [authStore.isAuthenticated, authStore.user, router])

  const handleSuccess = () => {
    const roleDashboards: Record<string, string> = {
      admin: '/admin/dashboard',
      faculty: '/faculty/dashboard',
      student: '/student/dashboard'
    }
    const userRole = authStore.userRole()
    const dashboardUrl = roleDashboards[userRole || 'student'] || '/student/dashboard'
    router.push(dashboardUrl)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join Smart Student Hub and start managing your achievements</p>
      </div>

      {/* Registration Form */}
      <RegisterForm onSuccess={handleSuccess} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      {/* Google Sign Up */}
      <GoogleSignInButton onSuccess={handleSuccess} />

      {/* Login Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-gray-600"
      >
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in here
        </Link>
      </motion.div>

      {/* Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-gray-500 text-center"
      >
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </motion.p>
    </motion.div>
  )
}
