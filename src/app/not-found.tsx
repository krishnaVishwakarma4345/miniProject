'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
	const router = useRouter()
	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-950 px-6 py-24 text-white'>
			<motion.section
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, y: -12 }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				className='relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-12 shadow-[0_40px_120px_rgba(15,23,42,0.6)]'
			>
				<div className='absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top,#38bdf8,transparent_45%)]' aria-hidden />
				<div className='relative'>
					<motion.p
						initial={{ letterSpacing: '-0.2em' }}
						animate={{ letterSpacing: '0.1em' }}
						className='text-sm uppercase tracking-[0.6em] text-slate-400'
					>
						Lost Signal
					</motion.p>
					<motion.h1
						initial={{ y: 24, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className='mt-4 text-6xl font-black tracking-tight'
					>
						404
					</motion.h1>
					<p className='mt-3 max-w-xl text-base text-slate-300'>
						We could not locate that page. It may have been moved, renamed, or archived. Use the button below to return to a safe place.
					</p>
					<div className='mt-8 flex flex-wrap gap-3'>
						<Button onClick={() => router.push('/')}>Go Home</Button>
						<Button variant='ghost' onClick={() => (window.location.href = 'mailto:support@smarthub.app')}>
							Contact Support
						</Button>
					</div>
				</div>
			</motion.section>
		</div>
	)
}
