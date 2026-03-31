'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps {
	title?: string
	children: ReactNode
	variant?: AlertVariant
}

const variantClass: Record<AlertVariant, string> = {
	info: 'border-sky-200 bg-sky-50 text-sky-800',
	success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
	warning: 'border-amber-200 bg-amber-50 text-amber-800',
	error: 'border-rose-200 bg-rose-50 text-rose-800',
}

export function Alert({ title, children, variant = 'info' }: AlertProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			role='alert'
			className={`rounded-xl border px-4 py-3 text-sm ${variantClass[variant]}`}
		>
			{title ? <h4 className='mb-1 font-semibold'>{title}</h4> : null}
			<div>{children}</div>
		</motion.div>
	)
}

export default Alert
