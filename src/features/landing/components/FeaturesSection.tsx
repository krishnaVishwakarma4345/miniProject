'use client'

import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

const features = [
  {
    title: 'Smart visual evidence timeline',
    description: 'Every achievement gets clean chronology, metadata, and proof cards students can curate in seconds.',
    tone: 'from-amber-100 to-orange-50',
  },
  {
    title: 'High-speed faculty moderation',
    description: 'Left-to-right review lanes help faculty approve, comment, and return entries with minimal context switching.',
    tone: 'from-sky-100 to-cyan-50',
  },
  {
    title: 'Department intelligence cockpit',
    description: 'Admin teams track activity participation, category quality, and monthly growth with export-ready snapshots.',
    tone: 'from-emerald-100 to-lime-50',
  },
  {
    title: 'Secure media flow at scale',
    description: 'Signed uploads, storage hygiene, and governance controls keep evidence trusted for compliance cycles.',
    tone: 'from-violet-100 to-fuchsia-50',
  },
]

export function FeaturesSection() {
  return (
    <section className='border-b border-slate-200 bg-white py-20'>
      <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        <ScrollReveal from='left' className='mb-12 max-w-3xl'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'>Capabilities</p>
          <h2 className='mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>Built to feel fluid as users move through data</h2>
        </ScrollReveal>

        <div className='space-y-6'>
          {features.map((feature, index) => {
            const from = index % 2 === 0 ? 'left' : 'right'

            return (
              <ScrollReveal key={feature.title} from={from} amount={0.3}>
                <article className='grid items-center gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8'>
                  <div>
                    <div className='mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white'>
                      {index + 1}
                    </div>
                    <h3 className='text-2xl font-bold text-slate-900'>{feature.title}</h3>
                    <p className='mt-3 max-w-2xl text-slate-700'>{feature.description}</p>
                  </div>

                  <div className={`h-32 rounded-2xl border border-white bg-gradient-to-br ${feature.tone} shadow-inner`} />
                </article>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
