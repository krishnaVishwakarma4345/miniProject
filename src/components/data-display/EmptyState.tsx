'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface EmptyStateProps {
	title: string
	description?: string
	action?: ReactNode
	icon?: string
	hint?: string
	compact?: boolean
}

export function EmptyState({ title, description, action, icon = '✨', hint, compact = false }: EmptyStateProps) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 20, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 12 }}
			transition={{ type: 'spring', stiffness: 240, damping: 28 }}
			className={`flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50/70 px-8 ${compact ? 'py-8' : 'py-12'} text-center shadow-inner`}
		>
			<motion.div
				initial={{ rotate: -6, scale: 0.9 }}
				animate={{ rotate: 0, scale: 1 }}
				transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
				className='mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl text-slate-600 shadow-sm'
				aria-hidden
			>
				{icon}
			</motion.div>
			<h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
			{description ? <p className='mt-2 max-w-md text-sm text-slate-600'>{description}</p> : null}
			{action ? <div className='mt-6'>{action}</div> : null}
			{hint ? <p className='mt-4 text-xs uppercase tracking-wide text-slate-400'>{hint}</p> : null}
		</motion.section>
	)
}

export default EmptyState
