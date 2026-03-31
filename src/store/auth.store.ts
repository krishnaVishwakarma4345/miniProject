import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserRole } from '@/types/user.types'
import { ApiError } from '@/types/api.types'

export type AuthStore = {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: ApiError | null
  sessionValid: boolean

  // Actions
  setUser: (user: User | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setError: (error: ApiError | null) => void
  setSessionValid: (value: boolean) => void
  
  // Computed
  userRole: () => UserRole | null
  userId: () => string | null
  canAdminView: () => boolean
  canFacultyView: () => boolean
  canStudentView: () => boolean

  // Session management
  clearSession: () => void
  restoreSession: () => Promise<void>
}

/**
 * Zustand Auth Store
 * Manages user authentication state and session persistence
 * Persisted to localStorage key 'auth-storage' (user data only, not tokens)
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionValid: false,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: user !== null })
      },

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setSessionValid: (sessionValid) => set({ sessionValid }),

      // Computed
      userRole: () => get().user?.role || null,

      userId: () => get().user?.id || null,

      canAdminView: () => {
        const role = get().user?.role
        return role === 'admin'
      },

      canFacultyView: () => {
        const role = get().user?.role
        return role === 'faculty' || role === 'admin'
      },

      canStudentView: () => {
        const role = get().user?.role
        return role === 'student' || role === 'faculty' || role === 'admin'
      },

      // Session management
      clearSession: () => {
        set({
          user: null,
          isAuthenticated: false,
          sessionValid: false,
          error: null
        })
      },

      restoreSession: async () => {
        set({ isLoading: true, error: null })
        try {
          const state = get()
          const hasSessionCookie = typeof document !== 'undefined'
            ? document.cookie.split(';').some((cookie) => cookie.trim().startsWith('session='))
            : false

          if (state.user && hasSessionCookie) {
            set({ sessionValid: true, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false, sessionValid: false })
          }
        } catch (error) {
          const apiError = new ApiError(
            error instanceof Error ? error.message : 'Session restore failed',
            'SESSION_RESTORE_ERROR',
            500
          )
          set({ error: apiError, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionValid: state.sessionValid
      })
    }
  )
)
