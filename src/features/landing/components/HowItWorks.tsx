'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

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
    <section ref={ref} className='border-b border-white/10 bg-slate-950 py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl'>How it works</h2>

        <div className='relative pl-10'>
          <motion.span
            style={{ scaleY, transformOrigin: 'top' }}
            className='absolute left-3 top-0 h-full w-0.5 bg-cyan-300'
          />

          <div className='space-y-8'>
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className='relative rounded-2xl border border-white/10 bg-slate-900/50 p-5'
              >
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20, delay: index * 0.1 }}
                  className='absolute -left-8.5 top-6 grid h-6 w-6 place-items-center rounded-full bg-cyan-300 text-xs font-bold text-slate-900'
                >
                  {index + 1}
                </motion.span>

                <h3 className='text-lg font-semibold text-white'>{step.title}</h3>
                <p className='mt-2 text-sm text-slate-300'>{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
