import { useEffect, useState } from 'react'
import { Activity } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import RemarksInput from './RemarksInput'

interface ApprovalModalProps {
	open: boolean
	activity?: Activity
	isSubmitting?: boolean
	title?: string
	onClose: () => void
	onSubmit: (payload: { remarks: string; pointsAwarded: number; score?: number }) => void
}

export function ApprovalModal({ open, activity, isSubmitting, title, onClose, onSubmit }: ApprovalModalProps) {
	const [remarks, setRemarks] = useState('')
	const [points, setPoints] = useState(activity?.pointsAwarded ?? 10)
	const [score, setScore] = useState<number | ''>('')

	useEffect(() => {
		if (!open) return
		setRemarks('')
		setPoints(activity?.pointsAwarded ?? 10)
		setScore('')
	}, [activity, open])

	return (
		<Modal
			open={open}
			onClose={() => {
				if (!isSubmitting) onClose()
			}}
			title={title || `Approve ${activity?.title ?? 'activity'}`}
			footer={
				<>
					<Button variant='ghost' onClick={onClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						variant='solid'
						loading={isSubmitting}
						onClick={() => onSubmit({ remarks, pointsAwarded: points, score: typeof score === 'number' ? score : undefined })}
					>
						Approve
					</Button>
				</>
			}
		>
			<div className='space-y-4'>
				<p className='text-sm text-slate-600'>Share feedback and optional scoring before approving this submission.</p>
				<div className='grid gap-4 md:grid-cols-2'>
					<Input
						label='Points awarded'
						type='number'
						value={points}
						onChange={(event) => setPoints(Number(event.target.value) || 0)}
						min={0}
						step={1}
					/>
					<Input
						label='Score (optional)'
						type='number'
						value={score}
						onChange={(event) => {
							const value = event.target.value
							setScore(value === '' ? '' : Number(value))
						}}
						min={0}
						max={100}
						step={1}
						hint='0-100'
					/>
				</div>
				<RemarksInput value={remarks} onChange={setRemarks} maxLength={500} />
			</div>
		</Modal>
	)
}

export default ApprovalModal
