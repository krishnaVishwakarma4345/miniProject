'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/ui.store'
import gsap from 'gsap'

export interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * LoginForm Component
 * Email/password login form with animations
 * 
 * Features:
 * - Form field slide-up stagger animation on mount
 * - Underline expand animation on input focus
 * - Shake animation on validation error
 * - Loading state with spinner
 * - Success state with checkmark draw animation
 * - Password visibility toggle
 */
export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { login, isLoading, error: authError } = useAuth()
  const uiStore = useUIStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const emailFieldRef = useRef<HTMLDivElement>(null)
  const passwordFieldRef = useRef<HTMLDivElement>(null)

  // Stagger animation on mount
  useEffect(() => {
    if (!formRef.current) return

    const fields = formRef.current.querySelectorAll('[data-field]')
    gsap.fromTo(
      fields,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out'
      }
    )
  }, [])

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Shake animation for error
   */
  const shakeField = (ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current) return
    gsap.to(ref.current, {
      keyframes: [{ x: -5 }, { x: 5 }, { x: -5 }, { x: 5 }, { x: 0 }],
      duration: 0.4,
      ease: 'power2.out'
    })
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      if (Object.keys(errors).some(key => key === 'email')) {
        shakeField(emailFieldRef)
      }
      if (Object.keys(errors).some(key => key === 'password')) {
        shakeField(passwordFieldRef)
      }
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      
      // Success animation and callback
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          onComplete: () => {
            onSuccess?.()
          }
        })
      }
    } catch (error) {
      shakeField(formRef)
      onError?.(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {/* Email Field */}
      <div ref={emailFieldRef} data-field className="relative">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors({ ...errors, email: '' })
            }}
            placeholder="your@email.com"
            className={`w-full px-4 py-2 border-b-2 bg-transparent transition-colors duration-200 ${
              errors.email
                ? 'border-red-500 text-red-600'
                : 'border-gray-300 focus:border-blue-500'
            } outline-none`}
            disabled={isSubmitting}
          />
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
            initial={{ scaleX: 0 }}
            whileFocus={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
            style={{ originX: 0 }}
          />
        </div>
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password Field */}
      <div ref={passwordFieldRef} data-field className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors({ ...errors, password: '' })
            }}
            placeholder="••••••••"
            className={`w-full px-4 py-2 border-b-2 bg-transparent pr-10 transition-colors duration-200 ${
              errors.password
                ? 'border-red-500 text-red-600'
                : 'border-gray-300 focus:border-blue-500'
            } outline-none`}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2"
            disabled={isSubmitting}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
            initial={{ scaleX: 0 }}
            whileFocus={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
            style={{ originX: 0 }}
          />
        </div>
        <AnimatePresence>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Error */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {authError.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        data-field
        type="submit"
        disabled={isSubmitting || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
      >
        {isSubmitting || isLoading ? (
          <motion.div className="flex items-center justify-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            Signing in...
          </motion.div>
        ) : (
          'Sign In'
        )}
      </motion.button>

      {/* Forgot Password Link */}
      <div data-field className="text-center">
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
          Forgot password?
        </a>
      </div>
    </form>
  )
}
