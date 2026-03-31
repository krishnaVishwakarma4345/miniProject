'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AnimatedText } from '@/features/landing/components/AnimatedText'
import { FloatingCard } from '@/features/landing/components/FloatingCard'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className='relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_20%_15%,rgba(45,212,191,0.25),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(59,130,246,0.28),transparent_45%),#020617]'>
      <div className='pointer-events-none absolute inset-0 opacity-30 [background:linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_30%,transparent_60%)]' />

      <div className='mx-auto grid min-h-[88vh] w-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8'>
        <div>
          <p className='mb-4 text-xs uppercase tracking-[0.22em] text-cyan-300'>Google Lens-level product polish</p>
          <AnimatedText
            text='Transform Co-Curricular Data Into Institutional Reputation'
            className='text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl'
          />

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.45 }}
            className='mt-6 max-w-xl text-base text-slate-200 sm:text-lg'
          >
            Smart Student Hub helps HEIs streamline student achievements, faculty review workflows,
            and accreditation-ready reporting from one elegant platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.4 }}
            className='mt-8 flex flex-wrap items-center gap-3'
          >
            <Link href='/register'>
              <Button size='lg' className='bg-cyan-300 text-slate-950 hover:bg-cyan-200'>Start Free Pilot</Button>
            </Link>
            <Link href='/login'>
              <Button variant='outline' size='lg' className='border-white/30 bg-white/5 text-white hover:bg-white/15'>
                Faculty Demo Access
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
          className='grid gap-4 sm:grid-cols-2'
        >
          <FloatingCard title='2.4x Faster Reviews' subtitle='Faculty workflow'>
            Queue triage, remarks templates, and status transitions with smooth micro-feedback.
          </FloatingCard>
          <FloatingCard title='Audit-Ready Portfolio' subtitle='Student impact'>
            Auto-organized evidence and timeline narratives aligned to NAAC and NIRF expectations.
          </FloatingCard>
          <FloatingCard title='Realtime Notifications' subtitle='Zero lag'>
            Immediate updates for approvals, rejections, and assignments.
          </FloatingCard>
          <FloatingCard title='Institution Analytics' subtitle='Admin command center'>
            Participation trends, department-level performance, and exportable insights.
          </FloatingCard>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
