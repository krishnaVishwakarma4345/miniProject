"use client"

import { PropsWithChildren } from 'react'
import { motion } from 'framer-motion'

export interface PortfolioSectionProps extends PropsWithChildren {
	title: string
	subtitle?: string
	index?: number
}

export function PortfolioSection({ title, subtitle, index = 0, children }: PortfolioSectionProps) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
			className='rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur'
		>
			<div className='mb-4 flex flex-col gap-1'>
				<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>{title}</p>
				{subtitle ? <h3 className='text-lg font-semibold text-slate-900'>{subtitle}</h3> : null}
			</div>
			<div>{children}</div>
		</motion.section>
	)
}

export default PortfolioSection
