'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { applyActionCode } from 'firebase/auth'
import { getAuthInstance } from '@/lib/firebase/client'
import { PageContainer } from '@/components/layout/PageContainer'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const verify = async () => {
      if (!oobCode) {
        setError('Invalid verification link.')
        setLoading(false)
        return
      }

      try {
        const auth = await getAuthInstance()
        await applyActionCode(auth, oobCode)
        setSuccess('Email verified successfully. Redirecting to login...')
        setTimeout(() => {
          router.replace('/login?verified=1')
        }, 1200)
      } catch (verificationError) {
        setError(verificationError instanceof Error ? verificationError.message : 'Verification link is invalid or expired.')
      } finally {
        setLoading(false)
      }
    }

    void verify()
  }, [oobCode, router])

  return (
    <PageContainer className='flex justify-center'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
      >
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold text-slate-900'>Email Verification</h1>
          <p className='text-sm text-slate-600'>We are verifying your email address.</p>
        </div>

        {loading ? (
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
            Verifying your email...
          </div>
        ) : null}

        {success ? (
          <div className='rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800'>{success}</div>
        ) : null}

        {error ? (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>
        ) : null}

        <div className='text-center text-sm text-slate-600'>
          <Link href='/login' className='font-medium text-blue-600 hover:text-blue-700'>
            Go to login
          </Link>
        </div>
      </motion.div>
    </PageContainer>
  )
}
