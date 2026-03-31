"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'
import { ActivityStatus } from '@/types'
import { getStatusConfig } from '@/constants/statusConfig'
import { getMotionOK } from '@/lib/animations/gsap.config'

export interface ActivityStatusBadgeProps {
	status: ActivityStatus
	className?: string
	size?: 'sm' | 'md'
	showDescription?: boolean
}

type StatusMotionProps = Pick<HTMLMotionProps<'span'>, 'animate' | 'transition'>

const statusIcon = (status: ActivityStatus) => {
	switch (status) {
		case ActivityStatus.APPROVED:
			return (
				<svg viewBox='0 0 24 24' className='h-4 w-4 text-emerald-600' aria-hidden='true'>
					<circle cx='12' cy='12' r='10' className='fill-emerald-50 stroke-emerald-500' strokeWidth='1.5' />
					<path d='M8 12l2.5 2.5L16 9' className='fill-none stroke-emerald-600' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
				</svg>
			)
		case ActivityStatus.REJECTED:
			return (
				<svg viewBox='0 0 24 24' className='h-4 w-4 text-rose-600' aria-hidden='true'>
					<circle cx='12' cy='12' r='10' className='fill-rose-50 stroke-rose-500' strokeWidth='1.5' />
					<path d='M9 9l6 6m0-6l-6 6' className='stroke-rose-600' strokeWidth='2' strokeLinecap='round' />
				</svg>
			)
		case ActivityStatus.UNDER_REVIEW:
			return (
				<svg viewBox='0 0 24 24' className='h-4 w-4 text-amber-600' aria-hidden='true'>
					<circle cx='12' cy='12' r='10' className='fill-amber-50 stroke-amber-400' strokeWidth='1.5' />
					<path d='M12 7v5l3 2' className='stroke-amber-600' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
				</svg>
			)
		case ActivityStatus.SUBMITTED:
			return (
				<svg viewBox='0 0 24 24' className='h-4 w-4 text-blue-600' aria-hidden='true'>
					<path d='M5 12h14M12 5l7 7-7 7' className='stroke-blue-600' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none' />
				</svg>
			)
		case ActivityStatus.REVISION_REQUESTED:
			return (
				<svg viewBox='0 0 24 24' className='h-4 w-4 text-orange-600' aria-hidden='true'>
					<path d='M12 6v6l3 3' className='stroke-orange-600' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none' />
					<circle cx='12' cy='12' r='9' className='fill-none stroke-orange-400' strokeWidth='1.5' strokeDasharray='4 2' />
				</svg>
			)
		default:
			return (
				<svg viewBox='0 0 24 24' className='h-4 w-4 text-slate-600' aria-hidden='true'>
					<rect x='6.5' y='6.5' width='11' height='11' rx='2' className='fill-slate-100 stroke-slate-400' strokeWidth='1.5' />
				</svg>
			)
	}
}

const animationProps = (
	status: ActivityStatus,
	shouldAnimate: boolean
): StatusMotionProps => {
	if (!shouldAnimate) return {}
	const config = getStatusConfig(status).animation
	const repeat = config.repeatCount === -1 ? Infinity : config.repeatCount
	const duration = config.duration / 1000
	switch (config.animation) {
		case 'pulse':
			return { animate: { opacity: [0.75, 1, 0.75], scale: [1, 1.04, 1] }, transition: { duration, repeat, ease: 'easeInOut' } }
		case 'scale':
			return { animate: { scale: [0.96, 1.04, 1] }, transition: { duration, repeat } }
		case 'shake':
			return { animate: { x: [0, -2, 2, 0] }, transition: { duration, repeat, ease: 'easeInOut' } }
		case 'bounce':
			return { animate: { y: [0, -4, 0] }, transition: { duration, repeat, ease: 'easeOut' } }
		case 'draw':
			return { animate: { scale: [0.9, 1.05, 1], boxShadow: ['0 0 0 rgba(20,184,166,0.3)', '0 0 25px rgba(0,0,0,0.1)', '0 0 0 rgba(20,184,166,0)'] }, transition: { duration, repeat } }
		default:
			return {}
	}
}

const confettiOffsets = [
	{ x: -8, y: -18, color: '#14b8a6' },
	{ x: 12, y: -14, color: '#0ea5e9' },
	{ x: -4, y: -24, color: '#facc15' },
]

const ConfettiBurst = () => (
	<div className='pointer-events-none absolute inset-0 -z-10 overflow-visible'>
		{confettiOffsets.map((item, index) => (
			<motion.span
				key={`${item.color}-${index}`}
				className='absolute h-1.5 w-1.5 rounded-full'
				style={{ left: '50%', top: '50%', backgroundColor: item.color }}
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 0.2], x: item.x, y: item.y }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.9, ease: 'easeOut' }}
			/>
		))}
	</div>
)

export function ActivityStatusBadge({ status, className = '', size = 'md', showDescription = false }: ActivityStatusBadgeProps) {
	const { label, colors, description } = getStatusConfig(status)
	const [canAnimate, setCanAnimate] = useState(false)
	const [confettiKey, setConfettiKey] = useState(0)
	const previousStatus = useRef<ActivityStatus | null>(null)

	useEffect(() => {
		setCanAnimate(getMotionOK())
	}, [])

	useEffect(() => {
		if (!previousStatus.current) {
			previousStatus.current = status
			return
		}
		if (status === ActivityStatus.APPROVED && previousStatus.current !== status && getMotionOK()) {
			setConfettiKey((value) => value + 1)
		}
		previousStatus.current = status
	}, [status])

	const motionProps = useMemo(() => animationProps(status, canAnimate), [status, canAnimate])
	const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-1' : 'text-xs px-3 py-1.5'

	return (
		<div className={`relative inline-flex flex-col gap-1 ${className}`}>
			<motion.span
				role='status'
				className={`relative inline-flex items-center gap-2 rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizeClass}`}
				{...motionProps}
			>
				<span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-slate-900'>
					{statusIcon(status)}
				</span>
				<span className='leading-none'>{label}</span>
				<AnimatePresence>{confettiKey > 0 ? <ConfettiBurst key={confettiKey} /> : null}</AnimatePresence>
			</motion.span>
			{showDescription ? <p className='text-xs text-slate-500'>{description}</p> : null}
		</div>
	)
}

export default ActivityStatusBadge
