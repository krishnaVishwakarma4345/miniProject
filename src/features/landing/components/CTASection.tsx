import { ScrollReveal } from '@/features/landing/components/ScrollReveal'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section className='bg-white py-20'>
      <ScrollReveal from='bottom'>
        <div className='mx-auto w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_10%_15%,rgba(251,191,36,0.25),transparent_40%),radial-gradient(circle_at_90%_30%,rgba(96,165,250,0.25),transparent_38%),radial-gradient(circle_at_70%_85%,rgba(34,197,94,0.2),transparent_36%),#f8fafc] px-6 py-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'>Launch in weeks, not semesters</p>
          <h2 className='mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'>Ready for your institutional pilot?</h2>
          <p className='mx-auto mt-3 max-w-2xl text-sm text-slate-700 sm:text-base'>
            Activate Smart Student Hub for your campus and centralize student impact, approvals, and analytics
            with production-grade security.
          </p>

          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <Link href='/register'>
              <Button size='lg' className='rounded-full bg-slate-900 px-7 text-white hover:bg-slate-800'>Start Free Pilot</Button>
            </Link>
            <Link href='/login'>
              <Button variant='outline' size='lg' className='rounded-full border-slate-300 bg-white/70 px-7 text-slate-800 hover:bg-white'>
                Book Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

export default CTASection
