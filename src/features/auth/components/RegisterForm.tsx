'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import gsap from 'gsap'

export interface RegisterFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * RegisterForm Component
 * Multi-step registration form with animations
 * Step 1: Email & Password
 * Step 2: Personal Info (Name)
 * Step 3: Institution Selection
 * 
 * Features:
 * - Slide transitions between steps
 * - Progress bar animation
 * - Form validation with error shakes
 * - Email availability check
 * - Student-only registration with admin-managed role upgrades
 */
export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const { register, isLoading, error: authError } = useAuth()

  const registrationInstitutionKey = 'auth-registration-institution-id'

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(true)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [institutionsLoading, setInstitutionsLoading] = useState(false)
  const [institutionsError, setInstitutionsError] = useState<string | null>(null)
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedInstitutionId = window.sessionStorage.getItem(registrationInstitutionKey)
    if (savedInstitutionId) {
      setInstitutionId(savedInstitutionId)
    }
  }, [])

  useEffect(() => {
    const fetchInstitutions = async () => {
      setInstitutionsLoading(true)
      setInstitutionsError(null)

      try {
        const response = await fetch('/api/institutions')
        const payload = await response.json()

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Unable to load institutions')
        }

        const items = Array.isArray(payload.data) ? payload.data : []
        setInstitutions(items)
      } catch (error) {
        setInstitutionsError(error instanceof Error ? error.message : 'Unable to load institutions')
      } finally {
        setInstitutionsLoading(false)
      }
    }

    void fetchInstitutions()
  }, [])

  // Progress bar animation
  useEffect(() => {
    if (!progressRef.current) return
    const progress = (step / 3) * 100
    gsap.to(progressRef.current, {
      width: `${progress}%`,
      duration: 0.5,
      ease: 'power2.out'
    })
  }, [step])

  /**
   * Check email availability (debounced)
   */
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailAvailable(true)
        return
      }

      setCheckingEmail(true)
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await response.json()
        setEmailAvailable(data.available)
      } catch (error) {
        console.error('Email check error:', error)
      } finally {
        setCheckingEmail(false)
      }
    }

    const timeout = setTimeout(checkEmail, 500)
    return () => clearTimeout(timeout)
  }, [email])

  /**
   * Validate current step
   */
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Invalid email format'
      } else if (!emailAvailable) {
        newErrors.email = 'Email is already registered'
      }

      if (!password) {
        newErrors.password = 'Password is required'
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and numbers'
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password'
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else if (step === 2) {
      if (!displayName.trim()) {
        newErrors.displayName = 'Name is required'
      }
    } else if (step === 3) {
      if (institutionsLoading) {
        newErrors.institutionId = 'Please wait while institutions are loading'
      }

      if (!institutionId) {
        newErrors.institutionId = 'Institution is required'
      }

      if (institutionsError) {
        newErrors.institutionId = institutionsError
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    setStep(step - 1)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateStep()) return

    setIsSubmitting(true)

    try {
      await register(email, password, displayName, institutionId)

      onSuccess?.()
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-blue-600"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Form Container */}
      <div ref={formRef} className="relative min-h-96">
        <AnimatePresence mode="wait" initial={false}>
          {/* Step 1: Email & Password */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Create Your Account</h3>

              {/* Email Field */}
              <div>
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
                    className={`w-full px-4 py-2 border-b-2 bg-transparent transition-colors ${
                      errors.email
                        ? 'border-red-500 text-red-600'
                        : emailAvailable === false
                        ? 'border-red-500'
                        : emailAvailable === true && email
                        ? 'border-green-500'
                        : 'border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                  {checkingEmail && (
                    <motion.div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
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
                    className={`w-full px-4 py-2 border-b-2 bg-transparent transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 p-2"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border-b-2 bg-transparent transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  } outline-none`}
                />
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Tell Us About You</h3>

              {/* Name Field */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    if (errors.displayName) setErrors({ ...errors, displayName: '' })
                  }}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 border-b-2 bg-transparent transition-colors ${
                    errors.displayName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  } outline-none`}
                />
                {errors.displayName && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                    {errors.displayName}
                  </motion.p>
                )}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                Everyone starts as a student. Institute admins can promote accounts to faculty later.
              </div>
            </motion.div>
          )}

          {/* Step 3: Institution */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Select Institution</h3>

              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <select
                  id="institution"
                  value={institutionId}
                  disabled={institutionsLoading || institutions.length === 0}
                  onChange={(e) => {
                    const nextInstitutionId = e.target.value
                    setInstitutionId(nextInstitutionId)
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.setItem(registrationInstitutionKey, nextInstitutionId)
                    }
                    if (errors.institutionId) setErrors({ ...errors, institutionId: '' })
                  }}
                  className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                    errors.institutionId ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  } outline-none`}
                >
                  <option value="">
                    {institutionsLoading
                      ? 'Loading institutions...'
                      : institutions.length
                        ? 'Choose an institution...'
                        : 'No institutions available'}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                {errors.institutionId && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                    {errors.institutionId}
                  </motion.p>
                )}
                {institutionsError && !errors.institutionId ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                    {institutionsError}
                  </motion.p>
                ) : null}
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p>You'll be able to complete your profile after registration.</p>
              </div>
            </motion.div>
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isSubmitting || isLoading}
            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-900 font-medium rounded-lg transition-colors"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            Continue
          </button>
        ) : (
          <motion.button
            type="submit"
            disabled={isSubmitting || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        )}
      </div>
    </form>
  )
}
