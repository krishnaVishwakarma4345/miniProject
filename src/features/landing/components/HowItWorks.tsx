'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

const steps = [
  {
    title: 'Students submit activities',
    text: 'Upload proof, select categories, and enrich each entry with context in minutes.',
  },
  {
    title: 'Faculty verifies quality',
    text: 'Review queues prioritize pending items, add remarks, and approve or reject with consistency.',
  },
  {
    title: 'Admins track institutional impact',
    text: 'Dashboards and reports convert raw participation into accreditation-ready outcomes.',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 20%'],
  })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0.05, 1])

  return (
    <section ref={ref} className='border-b border-slate-200 bg-slate-50 py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <ScrollReveal from='left' className='mb-10'>
          <h2 className='text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>How it works</h2>
        </ScrollReveal>

        <div className='relative pl-10'>
          <motion.span
            style={{ scaleY, transformOrigin: 'top' }}
            className='absolute left-3 top-0 h-full w-0.5 bg-sky-500'
          />

          <div className='space-y-8'>
            {steps.map((step, index) => (
              <ScrollReveal
                key={step.title}
                from={index % 2 === 0 ? 'left' : 'right'}
                delay={index * 0.06}
                className='relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'
              >
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20, delay: index * 0.1 }}
                  className='absolute -left-8.5 top-6 grid h-6 w-6 place-items-center rounded-full bg-sky-600 text-xs font-bold text-white'
                >
                  {index + 1}
                </motion.span>

                <h3 className='text-xl font-bold text-slate-900'>{step.title}</h3>
                <p className='mt-2 text-slate-700'>{step.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
