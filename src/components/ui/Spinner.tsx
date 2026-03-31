'use client'

import { motion } from 'framer-motion'

type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
	size?: SpinnerSize
	className?: string
	label?: string
}

const sizeClass: Record<SpinnerSize, string> = {
	sm: 'h-4 w-4',
	md: 'h-6 w-6',
	lg: 'h-8 w-8',
}

export function Spinner({ size = 'md', className = '', label = 'Loading' }: SpinnerProps) {
	return (
		<span className={`inline-flex items-center gap-2 ${className}`} role='status' aria-live='polite'>
			<motion.svg
				className={sizeClass[size]}
				viewBox='0 0 24 24'
				fill='none'
				aria-hidden='true'
				animate={{ rotate: 360 }}
				transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
			>
				<circle cx='12' cy='12' r='9' className='stroke-slate-300' strokeWidth='3' />
				<path d='M12 3a9 9 0 0 1 9 9' className='stroke-slate-700' strokeWidth='3' strokeLinecap='round' />
			</motion.svg>
			<span className='sr-only'>{label}</span>
		</span>
	)
}

export default Spinner
