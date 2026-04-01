'use client'

import { useEffect, useState } from 'react'
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth/signIn'
import { signOut as firebaseSignOut, signOutAndRedirect } from '@/lib/firebase/auth/signOut'
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
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, displayName: string, role: UserRole, institutionId: string) => Promise<void>
  registerWithGoogleAuth: () => Promise<void>
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
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ApiError(error.error || 'Session creation failed', error.code || 'SESSION_ERROR')
      }

      const sessionData = await response.json()

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
        institutionId: '', // Will be set by session endpoint
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
  const loginWithGoogle = async (): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      // Step 1: Sign in with Google
      const userCredential = await signInWithGoogle()
      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          userProfile: {
            fullName: userCredential.user.displayName || 'User',
            displayName: userCredential.user.displayName || 'User',
            role: UserRole.STUDENT,
            institutionId: '',
            signUpMethod: 'google',
          },
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ApiError(error.error || 'Session creation failed', error.code || 'SESSION_ERROR')
      }

      const sessionData = await response.json()

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
        institutionId: '', // Will be set by session endpoint
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
    role: UserRole,
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
        role,
        institutionId
      )

      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          userProfile: {
            fullName: displayName,
            displayName,
            role,
            institutionId,
            signUpMethod: 'email',
          },
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ApiError(error.error || 'Session creation failed', error.code || 'SESSION_ERROR')
      }

      const sessionData = await response.json()

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
  const registerWithGoogleAuth = async (): Promise<void> => {
    authStore.setIsLoading(true)
    authStore.setError(null)

    try {
      // Step 1: Register with Google
      const userCredential = await registerWithGoogle(UserRole.STUDENT, '')
      const idToken = await userCredential.user.getIdToken()

      // Step 2: Create session cookie on server
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          userProfile: {
            fullName: userCredential.user.displayName || 'User',
            displayName: userCredential.user.displayName || 'User',
            role: UserRole.STUDENT,
            institutionId: '',
            signUpMethod: 'google',
          },
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ApiError(error.error || 'Session creation failed', error.code || 'SESSION_ERROR')
      }

      const sessionData = await response.json()

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
        institutionId: '', // Will be set during onboarding
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
      // Step 1: Clear session cookie on server
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      // Step 2: Sign out from Firebase
      await firebaseSignOut()

      // Step 3: Clear Zustand auth store
      authStore.clearSession()

      uiStore.addToast({
        type: 'success',
        title: 'Logged out',
        message: 'See you soon!',
        duration: 2000
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if server logout fails
      authStore.clearSession()
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
