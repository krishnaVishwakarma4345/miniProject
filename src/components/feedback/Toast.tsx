'use client'

import { AnimatePresence, motion } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
	id: string
	title: string
	message?: string
	icon?: string
	type?: ToastType
}

export interface ToastProps {
	items: ToastItem[]
	onDismiss: (id: string) => void
}

const toneClass: Record<ToastType, string> = {
	success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
	error: 'border-rose-200 bg-rose-50 text-rose-900',
	info: 'border-sky-200 bg-sky-50 text-sky-900',
	warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

export function Toast({ items, onDismiss }: ToastProps) {
	return (
		<div className='pointer-events-none fixed right-4 top-4 z-50 flex w-80 max-w-[90vw] flex-col gap-2'>
			<AnimatePresence initial={false}>
				{items.map((item) => {
					const tone = item.type || 'info'
					return (
						<motion.div
							key={item.id}
							initial={{ opacity: 0, x: 30, scale: 0.98 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							exit={{ opacity: 0, x: 24, scale: 0.96 }}
							transition={{ type: 'spring', stiffness: 320, damping: 28 }}
							className={`pointer-events-auto rounded-xl border p-3 shadow-lg ${toneClass[tone]}`}
						>
							<div className='flex items-start justify-between gap-2'>
								<div className='flex flex-1 gap-2'>
									{item.icon ? (
										<span className='text-lg' aria-hidden>
											{item.icon}
										</span>
									) : null}
									<div>
										<p className='text-sm font-semibold'>{item.title}</p>
										{item.message ? <p className='mt-0.5 text-xs opacity-90'>{item.message}</p> : null}
									</div>
								</div>
								<button
									type='button'
									onClick={() => onDismiss(item.id)}
									className='rounded p-1 text-xs opacity-70 hover:bg-black/5 hover:opacity-100'
									aria-label='Dismiss notification'
								>
									x
								</button>
							</div>
						</motion.div>
					)
				})}
			</AnimatePresence>
		</div>
	)
}

export default Toast
