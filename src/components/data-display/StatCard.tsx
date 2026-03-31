'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

export interface StatCardProps {
	label: string
	value: number
	suffix?: string
	icon?: ReactNode
	className?: string
}

export function StatCard({ label, value, suffix = '', icon, className = '' }: StatCardProps) {
	const ref = useRef<HTMLDivElement>(null)
	const inView = useInView(ref, { once: true, margin: '-60px' })
	const count = useMotionValue(0)
	const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString())

	useEffect(() => {
		if (!inView) return
		const controls = animate(count, value, { duration: 1.1, ease: 'easeOut' })
		return controls.stop
	}, [inView, count, value])

	return (
		<motion.article
			ref={ref}
			initial={{ opacity: 0, y: 16 }}
			animate={inView ? { opacity: 1, y: 0 } : undefined}
			transition={{ duration: 0.35 }}
			className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
		>
			<div className='mb-3 flex items-center justify-between'>
				<p className='text-sm text-slate-600'>{label}</p>
				<span className='text-slate-500'>{icon}</span>
			</div>
			<p className='text-3xl font-bold tracking-tight text-slate-900'>
				<motion.span>{rounded}</motion.span>
				{suffix}
			</p>
		</motion.article>
	)
}

export default StatCard
