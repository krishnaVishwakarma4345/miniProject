'use client'

import { StatCard } from '@/components/data-display/StatCard'
import { motion } from 'framer-motion'

export function StatsSection() {
  return (
    <section className='border-b border-white/10 bg-slate-950 py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl'
        >
          Performance that institutions can measure
        </motion.h2>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard label='Active Students' value={18540} suffix='+' className='bg-white/95' />
          <StatCard label='Monthly Reviews' value={7400} suffix='+' className='bg-white/95' />
          <StatCard label='Avg Turnaround' value={42} suffix=' hrs' className='bg-white/95' />
          <StatCard label='Generated Reports' value={1280} suffix='+' className='bg-white/95' />
        </div>
      </div>
    </section>
  )
}

export default StatsSection
