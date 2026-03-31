import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface BulkActionBarProps {
	count: number
	disabled?: boolean
	onApprove: () => void
	onReject: () => void
	onAssign: () => void
}

export function BulkActionBar({ count, disabled, onApprove, onReject, onAssign }: BulkActionBarProps) {
	return (
		<AnimatePresence>
			{count > 0 ? (
				<motion.div
					initial={{ y: 80, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 80, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 260, damping: 26 }}
					className='fixed bottom-6 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-2xl backdrop-blur'
				>
					<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
						<p className='text-sm font-semibold text-slate-700'>
							{count} item{count === 1 ? '' : 's'} selected
						</p>
						<div className='flex flex-wrap gap-2'>
							<Button size='sm' variant='outline' onClick={onAssign} disabled={disabled}>
								Assign to me
							</Button>
							<Button size='sm' variant='ghost' onClick={onReject} disabled={disabled}>
								Reject
							</Button>
							<Button size='sm' onClick={onApprove} disabled={disabled}>
								Approve all
							</Button>
						</div>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}

export default BulkActionBar
