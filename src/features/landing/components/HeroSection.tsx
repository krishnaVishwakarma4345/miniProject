'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export function HeroSection() {
  return (
    <section className='relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_12%_15%,rgba(251,191,36,0.28),transparent_36%),radial-gradient(circle_at_84%_16%,rgba(96,165,250,0.3),transparent_33%),radial-gradient(circle_at_55%_88%,rgba(52,211,153,0.24),transparent_38%),#f8fafc]'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.72),rgba(255,255,255,0.45)_46%,rgba(240,249,255,0.8))]' />

      <div className='relative mx-auto grid min-h-[88vh] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20'>
        <ScrollReveal from='left' className='max-w-2xl'>
          <p className='mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700'>Inspired by visual search experiences</p>
          <h1 className='text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl'>
            The first campus activity platform that feels alive while you scroll
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className='mt-6 text-base text-slate-700 sm:text-lg'
          >
            Smart Student Hub turns activity submissions, faculty approvals, and accreditation-ready analytics into one fluid workflow with fast visual clarity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className='mt-8 flex flex-wrap gap-3'
          >
            <Link href='/register'>
              <Button size='lg' className='rounded-full bg-slate-900 px-7 text-white hover:bg-slate-800'>Sign up</Button>
            </Link>
            <Link href='/login'>
              <Button variant='outline' size='lg' className='rounded-full border-slate-300 bg-white/70 px-7 text-slate-800 hover:bg-white'>
                Login to your account
              </Button>
            </Link>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal from='right' className='relative'>
          <div className='relative mx-auto w-full max-w-xl'>
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className='rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.14)] backdrop-blur'
            >
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'>Live queue</p>
              <h3 className='mt-2 text-xl font-bold text-slate-900'>Faculty Review Feed</h3>
              <div className='mt-5 space-y-3'>
                {[
                  'Community Outreach - awaiting evidence check',
                  'Hackathon finalist certificate verified',
                  'Research paper accepted for publication',
                ].map((item, index) => (
                  <div key={item} className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                    <span className='mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800'>
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className='absolute -left-6 top-8 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg'
            >
              2.4x faster approvals
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 }}
              className='absolute -bottom-6 right-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg'
            >
              Accreditation packs auto-generated
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default HeroSection
