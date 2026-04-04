'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { getAuthInstance } from '@/lib/firebase/client'
import { PageContainer } from '@/components/layout/PageContainer'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const validateCode = async () => {
      if (!oobCode) {
        setError('Invalid or missing reset code.')
        setLoading(false)
        return
      }

      try {
        const auth = await getAuthInstance()
        const accountEmail = await verifyPasswordResetCode(auth, oobCode)
        setEmail(accountEmail)
      } catch (validationError) {
        setError(validationError instanceof Error ? validationError.message : 'Reset link is invalid or expired.')
      } finally {
        setLoading(false)
      }
    }

    void validateCode()
  }, [oobCode])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const auth = await getAuthInstance()
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess('Password reset successful. Redirecting to login...')
      setTimeout(() => {
        router.replace('/login')
      }, 1200)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to reset password.')
    } finally {
      setSubmitting(false)
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
          <h1 className='text-2xl font-bold text-slate-900'>Reset Password</h1>
          <p className='text-sm text-slate-600'>Set a new password for your account.</p>
        </div>

        {loading ? (
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
            Validating reset link...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
              Resetting password for <span className='font-medium'>{email || 'your account'}</span>
            </div>

            <div>
              <label htmlFor='password' className='mb-2 block text-sm font-medium text-slate-700'>
                New Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500'
                placeholder='Enter new password'
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='mb-2 block text-sm font-medium text-slate-700'>
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500'
                placeholder='Confirm new password'
                disabled={submitting}
              />
            </div>

            {success ? (
              <div className='rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800'>{success}</div>
            ) : null}

            {error ? (
              <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>
            ) : null}

            <button
              type='submit'
              disabled={submitting || Boolean(success)}
              className='w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-slate-400'
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className='text-center text-sm text-slate-600'>
          <Link href='/login' className='font-medium text-blue-600 hover:text-blue-700'>
            Back to login
          </Link>
        </div>
      </motion.div>
    </PageContainer>
  )
}
