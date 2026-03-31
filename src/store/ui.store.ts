import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  icon?: string
}

export type UIStore = {
  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void

  // Global loading state
  isGlobalLoading: boolean
  setGlobalLoading: (value: boolean) => void

  // Modal state
  modals: Record<string, boolean>
  openModal: (name: string) => void
  closeModal: (name: string) => void
  toggleModal: (name: string) => void
  isModalOpen: (name: string) => boolean

  // Auth-specific UI state
  showPassword: boolean
  toggleShowPassword: () => void
  authStep: number
  setAuthStep: (step: number) => void
}

/**
 * Zustand UI Store
 * Manages global UI state: toasts, modals, loading states
 * Not persisted (ephemeral UI state only)
 */
export const useUIStore = create<UIStore>((set, get) => ({
  // Toast management
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id }

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto-remove toast after duration (default 5s)
    const duration = toast.duration || 5000
    const timeout = setTimeout(() => {
      get().removeToast(id)
    }, duration)

    // Return id so caller can remove manually if needed
    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  // Global loading state
  isGlobalLoading: false,

  setGlobalLoading: (isGlobalLoading) => {
    set({ isGlobalLoading })
  },

  // Modal management
  modals: {},

  openModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: true }
    }))
  },

  closeModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: false }
    }))
  },

  toggleModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: !state.modals[name] }
    }))
  },

  isModalOpen: (name) => {
    return get().modals[name] || false
  },

  // Auth-specific UI state
  showPassword: false,

  toggleShowPassword: () => {
    set((state) => ({ showPassword: !state.showPassword }))
  },

  authStep: 0,

  setAuthStep: (step) => {
    set({ authStep: step })
  }
}))
