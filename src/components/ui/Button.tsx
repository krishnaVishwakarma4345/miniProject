'use client'

import { ReactNode, useRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'
import { Spinner } from '@/components/ui/Spinner'

type ButtonVariant = 'solid' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
	variant?: ButtonVariant
	size?: ButtonSize
	loading?: boolean
	magnetic?: boolean
	leftIcon?: ReactNode
	rightIcon?: ReactNode
 	children?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
	solid: 'bg-slate-900 text-white hover:bg-slate-800',
	ghost: 'bg-transparent text-slate-800 hover:bg-slate-100',
	outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
	danger: 'bg-rose-600 text-white hover:bg-rose-500',
}

const sizeClass: Record<ButtonSize, string> = {
	sm: 'h-9 px-3 text-sm',
	md: 'h-11 px-4 text-sm',
	lg: 'h-12 px-5 text-base',
}

export function Button({
	variant = 'solid',
	size = 'md',
	loading = false,
	magnetic = true,
	disabled,
	leftIcon,
	rightIcon,
	className = '',
	children,
	...props
}: ButtonProps) {
	const ref = useRef<HTMLButtonElement | null>(null)
	const isDisabled = disabled || loading

	useMagnetic(ref, {
		magnetRadius: 80,
		strength: 0.6,
		enabled: magnetic && !isDisabled,
	})

	return (
		<motion.button
			ref={ref}
			whileTap={isDisabled ? undefined : { scale: 0.97 }}
			whileHover={isDisabled ? undefined : { y: -1 }}
			disabled={isDisabled}
			className={`relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
			{...props}
		>
			{loading ? <Spinner size='sm' /> : leftIcon}
			<span>{children}</span>
			{!loading ? rightIcon : null}
		</motion.button>
	)
}

export default Button
