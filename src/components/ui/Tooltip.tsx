'use client'

import { ReactNode, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface TooltipProps {
	content: ReactNode
	children: ReactNode
	side?: 'top' | 'right' | 'bottom' | 'left'
}

const positionClass = {
	top: 'left-1/2 top-0 -translate-x-1/2 -translate-y-[115%]',
	right: 'left-full top-1/2 ml-2 -translate-y-1/2',
	bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
	left: 'right-full top-1/2 mr-2 -translate-y-1/2',
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
	const [open, setOpen] = useState(false)

	return (
		<span
			className='relative inline-flex'
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		>
			{children}
			<AnimatePresence>
				{open ? (
					<motion.span
						role='tooltip'
						initial={{ opacity: 0, y: 4, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.96 }}
						transition={{ duration: 0.16 }}
						className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg ${positionClass[side]}`}
					>
						{content}
					</motion.span>
				) : null}
			</AnimatePresence>
		</span>
	)
}

export default Tooltip
