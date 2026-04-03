'use client'

import { StatCard } from '@/components/data-display/StatCard'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export function StatsSection() {
  return (
    <section className='border-b border-slate-200 bg-white py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <ScrollReveal from='right'>
          <h2 className='mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>
            Performance institutions can trust
          </h2>
        </ScrollReveal>

        <ScrollReveal from='left'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard label='Active Students' value={18540} suffix='+' className='border border-amber-100 bg-amber-50' />
            <StatCard label='Monthly Reviews' value={7400} suffix='+' className='border border-sky-100 bg-sky-50' />
            <StatCard label='Avg Turnaround' value={42} suffix=' hrs' className='border border-emerald-100 bg-emerald-50' />
            <StatCard label='Generated Reports' value={1280} suffix='+' className='border border-violet-100 bg-violet-50' />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default StatsSection
