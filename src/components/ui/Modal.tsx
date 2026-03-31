'use client'

import { ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface ModalProps {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
	footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
	useEffect(() => {
		if (!open) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open, onClose])

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center p-4'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<div className='absolute inset-0 bg-black/45' onClick={onClose} aria-hidden='true' />
					<motion.div
						role='dialog'
						aria-modal='true'
						className='relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl'
						initial={{ scale: 0.92, opacity: 0, y: 16 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.96, opacity: 0, y: 10 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						{title ? <h2 className='mb-3 text-lg font-semibold text-slate-900'>{title}</h2> : null}
						<div className='text-sm text-slate-700'>{children}</div>
						{footer ? <div className='mt-5 flex justify-end gap-2'>{footer}</div> : null}
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}

export default Modal
