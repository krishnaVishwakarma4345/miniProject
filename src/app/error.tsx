'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	const router = useRouter()
	useEffect(() => {
		console.error('Global route error', error)
	}, [error])

	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20'>
			<motion.section
				initial={{ opacity: 0, y: 24, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				className='w-full max-w-lg rounded-3xl border border-slate-100 bg-white/90 p-10 text-center shadow-2xl backdrop-blur'
			>
				<motion.div
					initial={{ scale: 0.9, rotate: -6 }}
					animate={{ scale: 1, rotate: 0 }}
					className='mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-rose-50 text-4xl'
					aria-hidden
				>
					⚠️
				</motion.div>
				<h1 className='text-2xl font-semibold text-slate-900'>Something went sideways</h1>
				<p className='mt-2 text-sm text-slate-600'>
					The page could not render. You can jump back home or retry the last action.
				</p>
				{error?.digest ? (
					<p className='mt-4 rounded-full bg-slate-100 px-4 py-1 text-xs font-mono text-slate-500'>
						Ref: {error.digest}
					</p>
				) : null}
				<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
					<Button onClick={reset} variant='outline'>Try again</Button>
					<Button onClick={() => router.push('/')}>Back to dashboard</Button>
				</div>
			</motion.section>
		</div>
	)
}
