import { useEffect, useState } from 'react'
import { Activity } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import RemarksInput from './RemarksInput'

interface RejectionModalProps {
	open: boolean
	activity?: Activity
	isSubmitting?: boolean
	title?: string
	onClose: () => void
	onSubmit: (remarks: string) => void
}

export function RejectionModal({ open, activity, isSubmitting, title, onClose, onSubmit }: RejectionModalProps) {
	const [remarks, setRemarks] = useState('')

	useEffect(() => {
		if (!open) return
		setRemarks('')
	}, [open, activity])

	return (
		<Modal
			open={open}
			onClose={() => {
				if (!isSubmitting) onClose()
			}}
			title={title || `Reject ${activity?.title ?? 'activity'}`}
			footer={
				<>
					<Button variant='ghost' onClick={onClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						variant='danger'
						loading={isSubmitting}
						disabled={!remarks.trim()}
						onClick={() => onSubmit(remarks)}
					>
						Reject Activity
					</Button>
				</>
			}
		>
			<p className='mb-4 text-sm text-slate-600'>Explain why this submission is being rejected so the student knows how to improve.</p>
			<RemarksInput value={remarks} onChange={setRemarks} maxLength={500} />
		</Modal>
	)
}

export default RejectionModal
