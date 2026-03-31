'use client'

import { motion } from 'framer-motion'

export interface ProgressBarProps {
	value: number
	max?: number
	label?: string
	showValue?: boolean
	className?: string
}

export function ProgressBar({ value, max = 100, label, showValue = true, className = '' }: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(value, max))
	const percent = (clamped / max) * 100

	return (
		<div className={`w-full ${className}`}>
			{(label || showValue) ? (
				<div className='mb-1.5 flex items-center justify-between text-xs text-slate-600'>
					<span>{label}</span>
					{showValue ? <span>{Math.round(percent)}%</span> : null}
				</div>
			) : null}
			<div className='h-2 overflow-hidden rounded-full bg-slate-200'>
				<motion.div
					className='h-full rounded-full bg-slate-900'
					initial={{ width: 0 }}
					animate={{ width: `${percent}%` }}
					transition={{ duration: 0.45, ease: 'easeOut' }}
				/>
			</div>
		</div>
	)
}

export default ProgressBar
