'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export interface BadgeProps extends HTMLMotionProps<'span'> {
	variant?: BadgeVariant
	animated?: boolean
}

const variantClass: Record<BadgeVariant, string> = {
	neutral: 'bg-slate-100 text-slate-700 border-slate-200',
	success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	warning: 'bg-amber-100 text-amber-700 border-amber-200',
	danger: 'bg-rose-100 text-rose-700 border-rose-200',
	info: 'bg-sky-100 text-sky-700 border-sky-200',
}

export function Badge({ variant = 'neutral', animated = false, className = '', children, ...props }: BadgeProps) {
	return (
		<motion.span
			initial={animated ? { scale: 0.9, opacity: 0 } : false}
			animate={animated ? { scale: 1, opacity: 1 } : false}
			transition={{ duration: 0.2 }}
			className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${variantClass[variant]} ${className}`}
			{...props}
		>
			{children}
		</motion.span>
	)
}

export default Badge
