'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { useAuthStore } from '@/store/auth.store'
import { PageContainer } from '@/components/layout/PageContainer'

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
  const registered = searchParams.get('registered') === '1'
  const verified = searchParams.get('verified') === '1'

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
    <PageContainer className='flex justify-center'>
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      {registered ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Registration successful. Check your inbox and verify your email before logging in.
        </div>
      ) : null}

      {verified ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          Email verification completed. You can login now.
        </div>
      ) : null}

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
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one here
        </Link>
      </motion.div>
      </motion.div>
    </PageContainer>
  )
}
