'use client'

import { motion } from 'framer-motion'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'

export default function GlobalLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16'>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-2xl rounded-3xl border border-slate-100 bg-white/90 p-10 shadow-2xl backdrop-blur'
      >
        <div className='mb-6 space-y-2'>
          <span className='text-xs uppercase tracking-[0.4em] text-slate-400'>Loading</span>
          <h2 className='text-2xl font-semibold text-slate-900'>Assembling your dashboard…</h2>
          <p className='text-sm text-slate-500'>Fetching analytics, user data, and timelines in real time.</p>
        </div>
        <LoadingSkeleton variant='card' showAvatar className='mb-8' />
        <LoadingSkeleton variant='table' lines={4} />
      </motion.div>
    </div>
  )
}
