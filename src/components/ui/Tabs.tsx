'use client'

import { ReactNode, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface TabItem {
	id: string
	label: string
	content: ReactNode
}

export interface TabsProps {
	items: TabItem[]
	defaultTabId?: string
	className?: string
}

export function Tabs({ items, defaultTabId, className = '' }: TabsProps) {
	const first = items[0]?.id
	const [activeId, setActiveId] = useState(defaultTabId || first)

	const active = useMemo(() => items.find((item) => item.id === activeId) || items[0], [items, activeId])

	if (!items.length) return null

	return (
		<div className={className}>
			<div role='tablist' aria-label='Tabs' className='relative mb-3 flex gap-1 rounded-xl bg-slate-100 p-1'>
				{items.map((item) => {
					const selected = item.id === activeId
					return (
						<button
							key={item.id}
							role='tab'
							aria-selected={selected}
							onClick={() => setActiveId(item.id)}
							className={`relative z-10 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${selected ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
						>
							{selected ? (
								<motion.span
									layoutId='tab-indicator'
									className='absolute inset-0 -z-10 rounded-lg bg-white shadow'
									transition={{ type: 'spring', stiffness: 320, damping: 30 }}
								/>
							) : null}
							{item.label}
						</button>
					)
				})}
			</div>

			<AnimatePresence mode='wait'>
				<motion.div
					key={active.id}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.18 }}
				>
					{active.content}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

export default Tabs
