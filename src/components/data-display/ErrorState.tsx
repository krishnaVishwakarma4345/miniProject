'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface ErrorStateProps {
	title?: string
	message: string
	action?: ReactNode
}

export function ErrorState({ title = 'Something went wrong', message, action }: ErrorStateProps) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			className='rounded-2xl border border-rose-200 bg-rose-50 p-6'
			role='alert'
		>
			<h3 className='text-base font-semibold text-rose-800'>{title}</h3>
			<p className='mt-1 text-sm text-rose-700'>{message}</p>
			{action ? <div className='mt-4'>{action}</div> : null}
		</motion.section>
	)
}

export default ErrorState
