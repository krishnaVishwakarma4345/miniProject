import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section className='bg-slate-950 py-20'>
      <div className='mx-auto w-full max-w-5xl rounded-3xl border border-cyan-300/30 bg-[radial-gradient(circle_at_10%_10%,rgba(45,212,191,0.35),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(59,130,246,0.28),transparent_40%),#0f172a] px-6 py-12 text-center sm:px-10'>
        <p className='text-xs uppercase tracking-[0.2em] text-cyan-200'>Launch in weeks, not semesters</p>
        <h2 className='mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl'>Ready for your institutional pilot?</h2>
        <p className='mx-auto mt-3 max-w-2xl text-sm text-slate-200 sm:text-base'>
          Activate Smart Student Hub for your campus and centralize student impact, approvals, and analytics
          with production-grade security.
        </p>

        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <Link href='/register'>
            <Button size='lg' className='bg-cyan-300 text-slate-950 hover:bg-cyan-200'>Start Free Pilot</Button>
          </Link>
          <Link href='/login'>
            <Button variant='outline' size='lg' className='border-white/30 bg-white/5 text-white hover:bg-white/15'>
              Book Live Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTASection
