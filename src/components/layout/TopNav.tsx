'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export interface TopNavProps {
	title?: string
	leftSlot?: ReactNode
	rightSlot?: ReactNode
}

export function TopNav({ title, leftSlot, rightSlot }: TopNavProps) {
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 80)
		onScroll()
		window.addEventListener('scroll', onScroll)
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	return (
		<motion.header
			initial={false}
			animate={{
				height: scrolled ? 56 : 72,
				backgroundColor: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)',
			}}
			transition={{ duration: 0.24 }}
			className='sticky top-0 z-40 border-b border-slate-200/70 backdrop-blur-md'
		>
			<div className='mx-auto flex h-full w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8'>
				<div className='flex min-w-0 flex-1 items-center gap-3'>
					{leftSlot}
					{title ? <h2 className='truncate text-sm font-semibold text-slate-800 sm:text-base'>{title}</h2> : null}
				</div>
				<div className='flex max-w-full items-center gap-2 overflow-x-auto'>{rightSlot}</div>
			</div>
		</motion.header>
	)
}

export default TopNav
