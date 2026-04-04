'use client'

import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

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
    <section className='border-b border-slate-200 bg-slate-50 py-20'>
      {/* <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <ScrollReveal from='left'>
          <h2 className='mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>Trusted by academic leaders</h2>
        </ScrollReveal>

        <div className='-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0'>
          <div className='flex min-w-max gap-4'>
            {testimonials.map((item, index) => (
              <ScrollReveal
                key={item.author}
                from={index % 2 === 0 ? 'left' : 'right'}
                delay={index * 0.08}
                className='w-[320px] rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm'
              >
                <p className='text-sm leading-relaxed'>&ldquo;{item.quote}&rdquo;</p>
                <footer className='mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700'>{item.author}</footer>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div> */}
    </section>
  )
}

export default TestimonialsSection
