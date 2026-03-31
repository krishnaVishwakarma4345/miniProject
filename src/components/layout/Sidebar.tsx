'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'

export interface SidebarItem {
	id: string
	label: string
	href: string
	icon?: ReactNode
}

export interface SidebarProps {
	items: SidebarItem[]
	collapsed?: boolean
	onToggleCollapsed?: () => void
}

export function Sidebar({ items, collapsed = false, onToggleCollapsed }: SidebarProps) {
	const pathname = usePathname()
	const ref = useRef<HTMLElement>(null)
	useMagnetic(ref as React.RefObject<HTMLElement>, { magnetRadius: 120, strength: 0.2, enabled: true })

	const activeIndex = useMemo(() => items.findIndex((item) => pathname.startsWith(item.href)), [items, pathname])

	return (
		<motion.aside
			ref={ref}
			layout
			animate={{ width: collapsed ? 84 : 260 }}
			transition={{ type: 'spring', stiffness: 260, damping: 30 }}
			className='sticky top-0 h-screen border-r border-slate-200 bg-white/95 p-3 backdrop-blur'
		>
			<div className='mb-4 flex items-center justify-between'>
				<span className={`font-semibold text-slate-900 ${collapsed ? 'sr-only' : ''}`}>Navigation</span>
				{onToggleCollapsed ? (
					<button
						type='button'
						onClick={onToggleCollapsed}
						className='rounded-md p-2 text-sm text-slate-600 hover:bg-slate-100'
						aria-label='Toggle sidebar'
					>
						{collapsed ? '>>' : '<<'}
					</button>
				) : null}
			</div>

			<nav className='relative space-y-1'>
				{activeIndex >= 0 ? (
					<motion.span
						layout
						transition={{ type: 'spring', stiffness: 360, damping: 34 }}
						className='pointer-events-none absolute left-0 right-0 z-0 h-10 rounded-lg bg-slate-900/6'
						style={{ top: activeIndex * 44 }}
					/>
				) : null}

				{items.map((item) => {
					const active = pathname.startsWith(item.href)
					return (
						<Link
							key={item.id}
							href={item.href}
							className={`relative z-10 flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition ${active ? 'font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
							aria-current={active ? 'page' : undefined}
						>
							<span className='inline-flex h-5 w-5 items-center justify-center'>{item.icon || 'o'}</span>
							{!collapsed ? <span className='truncate'>{item.label}</span> : null}
						</Link>
					)
				})}
			</nav>
		</motion.aside>
	)
}

export default Sidebar
