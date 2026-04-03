'use client'

import { useEffect, useState } from 'react'
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth/signIn'
import { signOut as firebaseSignOut } from '@/lib/firebase/auth/signOut'
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
      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const sessionData = await createServerSession({ idToken })

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
      // Step 1: Register with Firebase (creates both Auth user + Firestore doc)
      const userCredential = await registerWithEmail(
        email,
        password,
        displayName,
        institutionId
      )

      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const sessionData = await createServerSession({
        idToken,
        userProfile: {
          fullName: displayName,
          displayName,
          role: UserRole.STUDENT,
          institutionId,
          signUpMethod: 'email',
        },
      })

      // Step 3: Update Zustand auth store
      const user: User = {
        uid: sessionData.userId,
        id: sessionData.userId,
        fullName: displayName,
        email: sessionData.email,
        displayName: displayName,
        role: sessionData.role as UserRole,
        status: UserStatus.ACTIVE,
        language: 'en',
        mfaEnabled: false,
        photoURL: undefined,
        institutionId: institutionId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        emailVerified: false,
        metadata: { signUpMethod: 'email', loginCount: 1 }
      }

      authStore.setUser(user)
      authStore.setSessionValid(true)
      authStore.setIsAuthenticated(true)

      uiStore.addToast({
        type: 'success',
        title: 'Account created!',
        message: `Welcome to Smart Student Hub, ${displayName}`,
        duration: 3000
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
    logout,
    clearError,
    restoreSession
  }
}
