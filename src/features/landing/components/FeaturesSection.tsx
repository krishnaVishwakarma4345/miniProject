'use client'

import { motion } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'
import { RefObject, useRef } from 'react'

const features = [
  {
    title: 'Student Activity Vault',
    description: 'Collect evidence, classify achievements, and publish dynamic portfolios with governance controls.',
  },
  {
    title: 'Faculty Review Ops',
    description: 'Smart queues and contextual moderation help faculty clear pending reviews quickly.',
  },
  {
    title: 'Institution Dashboards',
    description: 'See participation, approvals, and category performance at a department and campus level.',
  },
  {
    title: 'Cloudinary Media Pipeline',
    description: 'Signed uploads, folder strategy, and lifecycle cleanup for secure media operations.',
  },
]

function FeatureCard({ title, description, index }: { title: string; description: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useMagnetic(ref as RefObject<HTMLElement>, { magnetRadius: 120, strength: 0.5, enabled: true })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.12 }}
      className='group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-5'
    >
      <div className='mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200 transition group-hover:rotate-12 group-hover:scale-110'>
        {index + 1}
      </div>
      <h3 className='text-lg font-semibold text-white'>{title}</h3>
      <p className='mt-2 text-sm text-slate-300'>{description}</p>
      <div className='pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyan-300/0 transition group-hover:ring-cyan-300/30' />
    </motion.article>
  )
}

export function FeaturesSection() {
  return (
    <section className='border-b border-white/10 bg-slate-950 py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className='mb-10 max-w-2xl'
        >
          <p className='text-xs uppercase tracking-[0.2em] text-cyan-300'>Capabilities</p>
          <h2 className='mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl'>Built for high-trust academic workflows</h2>
        </motion.div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} title={feature.title} description={feature.description} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
