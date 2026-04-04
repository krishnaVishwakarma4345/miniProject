'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { PageContainer } from '@/components/layout/PageContainer'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams])
  const { sendPasswordReset, isLoading } = useAuth()

  const [email, setEmail] = useState(initialEmail)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    try {
      await sendPasswordReset(email)
      setMessage('If this email exists, a password reset link has been sent.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to send reset email')
    }
  }

  return (
    <PageContainer className='flex justify-center'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
      >
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold text-slate-900'>Forgot Password</h1>
          <p className='text-sm text-slate-600'>Enter your email to receive a password reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='mb-2 block text-sm font-medium text-slate-700'>
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500'
              placeholder='your@email.com'
              disabled={isLoading}
            />
          </div>

          {message ? (
            <div className='rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800'>{message}</div>
          ) : null}

          {error ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>
          ) : null}

          <button
            type='submit'
            disabled={isLoading}
            className='w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-slate-400'
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className='text-center text-sm text-slate-600'>
          Remembered your password?{' '}
          <Link href='/login' className='font-medium text-blue-600 hover:text-blue-700'>
            Back to login
          </Link>
        </div>
      </motion.div>
    </PageContainer>
  )
}
