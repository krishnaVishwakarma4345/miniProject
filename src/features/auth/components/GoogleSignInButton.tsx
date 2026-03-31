'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export interface GoogleSignInButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  variant?: 'button' | 'icon'
}

/**
 * GoogleSignInButton Component
 * Handles Google OAuth authentication
 * 
 * Features:
 * - Animated Google icon on hover (360° rotation)
 * - Border trace animation on hover
 * - Loading spinner during authentication
 * - Error handling
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  variant = 'button'
}: GoogleSignInButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleGoogleSignIn = async () => {
    setError(null)

    try {
      await loginWithGoogle()
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(message)
      onError?.(message)
    }
  }

  if (variant === 'icon') {
    return (
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="p-3 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-full transition-colors disabled:opacity-50"
        title="Sign in with Google"
      >
        <motion.div
          animate={isHovering ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6 }}
          className="w-6 h-6 flex items-center justify-center text-xl"
        >
          🔵
        </motion.div>
      </motion.button>
    )
  }

  return (
    <div>
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2 px-4 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={isHovering && !isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl"
          >
            {isLoading ? '⏳' : '🔵'}
          </motion.div>
          <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </div>
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-2 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
