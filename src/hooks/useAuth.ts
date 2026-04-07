'use client'

import { useEffect, useState } from 'react'
import { sendEmailVerification, sendPasswordResetEmail, signOut as firebaseClientSignOut } from 'firebase/auth'
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth/signIn'
import { signOut as firebaseSignOut } from '@/lib/firebase/auth/signOut'
import { getEmailVerificationActionCodeSettings, getPasswordResetActionCodeSettings } from '@/lib/firebase/auth/actionCode'
import { registerWithEmail, registerWithGoogle } from '@/lib/firebase/auth/createUser'
import { getAuthInstance } from '@/lib/firebase/client'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { ApiError } from '@/types/api.types'
import { User, UserRole, UserStatus } from '@/types/user.types'

export type UseAuthReturn = {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: ApiError | null

  // Auth methods
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (institutionId?: string) => Promise<void>
  register: (email: string, password: string, displayName: string, institutionId: string) => Promise<void>
  registerWithGoogleAuth: (institutionId?: string) => Promise<void>
  resendEmailVerification: (email: string, password: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void

  // Session management
  restoreSession: () => Promise<void>
}

/**
 * useAuth Hook
 * Main authentication hook for login, register, logout
 * Manages Firebase auth + session cookie + Zustand state synchronization
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth()
 */
export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore()
  const uiStore = useUIStore()
  const [initialized, setInitialized] = useState(false)
  const registrationInstitutionKey = 'auth-registration-institution-id'
  const registrationInstitutionByEmailKey = 'auth-registration-institution-by-email'

  const normalizeEmail = (value: string): string => value.trim().toLowerCase()

  const readInstitutionByEmailMap = (): Record<string, string> => {
    if (typeof window === 'undefined') return {}

    try {
      const raw = window.localStorage.getItem(registrationInstitutionByEmailKey)
      if (!raw) return {}

      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return {}

      return parsed as Record<string, string>
    } catch {
      return {}
    }
  }

  const persistInstitutionForEmail = (email: string, institutionId: string): void => {
    if (typeof window === 'undefined' || !institutionId) return

    const normalizedEmail = normalizeEmail(email)
    const byEmail = readInstitutionByEmailMap()
    byEmail[normalizedEmail] = institutionId

    try {
      window.localStorage.setItem(registrationInstitutionByEmailKey, JSON.stringify(byEmail))
      window.localStorage.setItem(registrationInstitutionKey, institutionId)
      window.sessionStorage.setItem(registrationInstitutionKey, institutionId)
    } catch {
      // Ignore storage quota/permission issues and continue auth flow.
    }
  }

  const consumeInstitutionForEmail = (email: string): string | undefined => {
    if (typeof window === 'undefined') return undefined

    const normalizedEmail = normalizeEmail(email)
    const byEmail = readInstitutionByEmailMap()
    const mappedInstitution = byEmail[normalizedEmail]

    if (mappedInstitution) return mappedInstitution

    return (
      window.sessionStorage.getItem(registrationInstitutionKey)
      || window.localStorage.getItem(registrationInstitutionKey)
      || undefined
    )
  }

  const clearInstitutionForEmail = (email: string): void => {
    if (typeof window === 'undefined') return

    const normalizedEmail = normalizeEmail(email)
    const byEmail = readInstitutionByEmailMap()

    if (Object.prototype.hasOwnProperty.call(byEmail, normalizedEmail)) {
      delete byEmail[normalizedEmail]
      try {
        if (Object.keys(byEmail).length === 0) {
          window.localStorage.removeItem(registrationInstitutionByEmailKey)
        } else {
          window.localStorage.setItem(registrationInstitutionByEmailKey, JSON.stringify(byEmail))
        }
      } catch {
        // Ignore storage failures when cleaning up.
      }
    }

    try {
      window.sessionStorage.removeItem(registrationInstitutionKey)
      window.localStorage.removeItem(registrationInstitutionKey)
    } catch {
      // Ignore storage cleanup issues.
    }
  }

  const createServerSession = async (
    payload: { idToken: string; userProfile?: Record<string, unknown> },
    timeoutMs: number = 15000
  ) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage =
          (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' && body.error) ||
          (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' && body.message) ||
          'Session creation failed'

        const errorCode =
          (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string' && body.code) ||
          'SESSION_ERROR'

        throw new ApiError(errorMessage, errorCode)
      }

      return body
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(
          'Login timed out while creating secure session. Please retry.',
          'SESSION_TIMEOUT',
          408
        )
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      const store = useAuthStore.getState()
      try {
        const auth = await getAuthInstance()
        
        // Restore session from localStorage
        await store.restoreSession()

        // Set up Firebase auth state listener
        unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (!isMounted) return
          const latestStore = useAuthStore.getState()
          if (firebaseUser) {
            latestStore.setIsAuthenticated(true)
            latestStore.setSessionValid(true)
          } else {
            // User signed out
            latestStore.clearSession()
          }
          setInitialized(true)
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) setInitialized(true)
      }
    }

    initAuth()

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [])

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmail(email, password)

      await userCredential.user.reload()

      if (!userCredential.user.emailVerified) {
        const auth = await getAuthInstance()
        let verificationMailSent = true

        try {
          await sendEmailVerification(
            userCredential.user,
            getEmailVerificationActionCodeSettings()
          )
        } catch {
          verificationMailSent = false
        }

        await firebaseClientSignOut(auth)

        throw new ApiError(
          verificationMailSent
            ? 'Email is not verified. We sent a new verification link to your inbox. Please verify first, then login again.'
            : 'Email is not verified. Please verify your email first and then login again.',
          'EMAIL_NOT_VERIFIED',
          403
        )
      }

      const idToken = await userCredential.user.getIdToken()

      // Recover institution selected during registration if profile doc bootstrap is delayed.
      const registrationInstitutionId = consumeInstitutionForEmail(email)

      // Step 2: Create session cookie on server
      const sessionData = await createServerSession({ 
        idToken,
        userProfile: registrationInstitutionId ? {
          institutionId: registrationInstitutionId,
          signUpMethod: 'email',
        } : undefined
      })

      // Step 3: Update Zustand auth store
      const user: User = {
        uid: sessionData.userId,
        id: sessionData.userId,
        fullName: userCredential.user.displayName || 'User',
        email: sessionData.email,
        displayName: userCredential.user.displayName || 'User',
        role: sessionData.role as UserRole,
        status: UserStatus.ACTIVE,
        language: 'en',
        mfaEnabled: false,
        photoURL: userCredential.user.photoURL || undefined,
        institutionId: sessionData.institutionId || '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        emailVerified: userCredential.user.emailVerified,
        metadata: { signUpMethod: 'email', loginCount: 1 }
      }

      authStore.setUser(user)
      authStore.setSessionValid(true)
      authStore.setIsAuthenticated(true)

      clearInstitutionForEmail(email)

      uiStore.addToast({
        type: 'success',
        title: 'Welcome back!',
        message: `Logged in as ${email}`,
        duration: 3000
      })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Login failed',
        'LOGIN_ERROR'
      )
      authStore.setError(apiError)
      uiStore.addToast({
        type: 'error',
        title: 'Login failed',
        message: apiError.error,
        duration: 5000
      })
      throw apiError
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = async (institutionId?: string): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      // Step 1: Sign in with Google
      const userCredential = await signInWithGoogle()
      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const sessionData = await createServerSession({
        idToken,
        userProfile: {
          fullName: userCredential.user.displayName || 'User',
          displayName: userCredential.user.displayName || 'User',
          institutionId,
          signUpMethod: 'google',
        },
      })

      // Step 3: Update Zustand auth store
      const user: User = {
        uid: sessionData.userId,
        id: sessionData.userId,
        fullName: userCredential.user.displayName || 'User',
        email: sessionData.email,
        displayName: userCredential.user.displayName || 'User',
        role: sessionData.role as UserRole,
        status: UserStatus.ACTIVE,
        language: 'en',
        mfaEnabled: false,
        photoURL: userCredential.user.photoURL || undefined,
        institutionId: sessionData.institutionId || '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        emailVerified: userCredential.user.emailVerified,
        metadata: { signUpMethod: 'google', loginCount: 1 }
      }

      authStore.setUser(user)
      authStore.setSessionValid(true)
      authStore.setIsAuthenticated(true)

      uiStore.addToast({
        type: 'success',
        title: 'Welcome!',
        message: `Logged in with Google`,
        duration: 3000
      })
    } catch (error) {
      try {
        const auth = await getAuthInstance()
        await firebaseClientSignOut(auth)
      } catch {
        // Ignore sign-out cleanup failures in error path.
      }

      const apiError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Google login failed',
        'GOOGLE_LOGIN_ERROR'
      )
      authStore.setError(apiError)
      uiStore.addToast({
        type: 'error',
        title: 'Google login failed',
        message: apiError.error,
        duration: 5000
      })
      throw apiError
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Register with email and password
   */
  const register = async (
    email: string,
    password: string,
    displayName: string,
    institutionId: string
  ): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      persistInstitutionForEmail(email, institutionId)

      // Step 1: Register with Firebase and send verification email.
      const userCredential = await registerWithEmail(
        email,
        password,
        displayName,
        institutionId
      )

      // Never keep email/password sign-up users logged in before verification.
      const auth = await getAuthInstance()
      await firebaseClientSignOut(auth)
      authStore.clearSession()

      uiStore.addToast({
        type: 'success',
        title: 'Verify your email',
        message: `We sent a verification link to ${userCredential.user.email || email}. Verify it before logging in.`,
        duration: 5000
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message ?? 'Registration failed')
            : 'Registration failed'

      const apiError = error instanceof ApiError ? error : new ApiError(
        errorMessage,
        'REGISTER_ERROR'
      )
      authStore.setError(apiError)
      uiStore.addToast({
        type: 'error',
        title: 'Registration failed',
        message: apiError.error,
        duration: 5000
      })
      throw apiError
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Send forgot-password reset email
   */
  const sendPasswordReset = async (email: string): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const auth = await getAuthInstance()

      await sendPasswordResetEmail(
        auth,
        normalizedEmail,
        getPasswordResetActionCodeSettings()
      )

      uiStore.addToast({
        type: 'success',
        title: 'Reset email sent',
        message: 'Check your inbox to reset your password.',
        duration: 4000
      })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unable to send reset email',
        'PASSWORD_RESET_EMAIL_ERROR'
      )

      authStore.setError(apiError)
      uiStore.addToast({
        type: 'error',
        title: 'Password reset failed',
        message: apiError.error,
        duration: 5000
      })
      throw apiError
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Register with Google OAuth
   */
  const registerWithGoogleAuth = async (institutionId?: string): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      if (!institutionId) {
        throw new ApiError(
          'Select an institution before continuing with Google sign-up.',
          'MISSING_INSTITUTION',
          400
        )
      }

      // Step 1: Register with Google
      const userCredential = await registerWithGoogle(institutionId)
      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const sessionData = await createServerSession({
        idToken,
        userProfile: {
          fullName: userCredential.user.displayName || 'User',
          displayName: userCredential.user.displayName || 'User',
          role: UserRole.STUDENT,
          institutionId,
          signUpMethod: 'google',
        },
      })

      // Step 3: Update Zustand auth store
      const user: User = {
        uid: sessionData.userId,
        id: sessionData.userId,
        fullName: userCredential.user.displayName || 'User',
        email: sessionData.email,
        displayName: userCredential.user.displayName || 'User',
        role: sessionData.role as UserRole,
        status: UserStatus.ACTIVE,
        language: 'en',
        mfaEnabled: false,
        photoURL: userCredential.user.photoURL || undefined,
        institutionId: sessionData.institutionId || institutionId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        emailVerified: userCredential.user.emailVerified,
        metadata: { signUpMethod: 'google', loginCount: 1 }
      }

      authStore.setUser(user)
      authStore.setSessionValid(true)
      authStore.setIsAuthenticated(true)

      uiStore.addToast({
        type: 'success',
        title: 'Account created!',
        message: 'Welcome to Smart Student Hub',
        duration: 3000
      })
    } catch (error) {
      try {
        const auth = await getAuthInstance()
        await firebaseClientSignOut(auth)
      } catch {
        // Ignore sign-out cleanup failures in error path.
      }

      const apiError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Google registration failed',
        'GOOGLE_REGISTER_ERROR'
      )
      authStore.setError(apiError)
      uiStore.addToast({
        type: 'error',
        title: 'Registration failed',
        message: apiError.error,
        duration: 5000
      })
      throw apiError
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Re-send verification email for email/password accounts
   */
  const resendEmailVerification = async (email: string, password: string): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      const userCredential = await signInWithEmail(email, password)
      await userCredential.user.reload()

      const auth = await getAuthInstance()

      if (userCredential.user.emailVerified) {
        await firebaseClientSignOut(auth)
        uiStore.addToast({
          type: 'info',
          title: 'Already verified',
          message: 'This email is already verified. You can login now.',
          duration: 4000
        })
        return
      }

      await sendEmailVerification(
        userCredential.user,
        getEmailVerificationActionCodeSettings()
      )

      await firebaseClientSignOut(auth)

      uiStore.addToast({
        type: 'success',
        title: 'Verification email sent',
        message: 'Check your inbox for a new verification link.',
        duration: 5000
      })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Failed to resend verification email',
        'RESEND_VERIFICATION_ERROR'
      )

      authStore.setError(apiError)
      uiStore.addToast({
        type: 'error',
        title: 'Unable to resend verification email',
        message: apiError.error,
        duration: 5000
      })
      throw apiError
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Logout user
   * Clears session cookie on server, signs out from Firebase, clears auth store
   */
  const logout = async (): Promise<void> => {
    authStore.setIsLoading(true)

    try {
      // Sign out service clears session cookie and Firebase auth state.
      await firebaseSignOut()

      // Clear local auth state and force navigation to login.
      authStore.clearSession()

      uiStore.addToast({
        type: 'success',
        title: 'Logged out',
        message: 'See you soon!',
        duration: 2000
      })

      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state and navigate even if server logout fails.
      authStore.clearSession()
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    } finally {
      authStore.setIsLoading(false)
    }
  }

  /**
   * Clear error state
   */
  const clearError = (): void => {
    authStore.setError(null)
  }

  /**
   * Restore session from localStorage
   */
  const restoreSession = async (): Promise<void> => {
    await authStore.restoreSession()
  }

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    login,
    loginWithGoogle,
    register,
    registerWithGoogleAuth,
    resendEmailVerification,
    sendPasswordReset,
    logout,
    clearError,
    restoreSession
  }
}
