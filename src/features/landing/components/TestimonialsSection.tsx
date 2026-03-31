'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: 'We replaced scattered spreadsheets with one flow. Faculty response time improved within two weeks.',
    author: 'Dr. Meera K, Dean of Student Affairs',
  },
  {
    quote: 'Students finally understand how their achievements connect to placement outcomes.',
    author: 'Arjun P, Career Services Head',
  },
  {
    quote: 'The report exports made accreditation documentation dramatically easier.',
    author: 'Prof. Neha S, IQAC Coordinator',
  },
]

export function TestimonialsSection() {
  return (
    <section className='border-b border-white/10 bg-slate-950 py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl'>Trusted by academic leaders</h2>

        <div className='-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0'>
          <div className='flex min-w-max gap-4'>
            {testimonials.map((item, index) => (
              <motion.blockquote
                key={item.author}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className='w-[320px] rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-slate-200'
              >
                <p className='text-sm leading-relaxed'>"{item.quote}"</p>
                <footer className='mt-4 text-xs uppercase tracking-[0.14em] text-cyan-300'>{item.author}</footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
