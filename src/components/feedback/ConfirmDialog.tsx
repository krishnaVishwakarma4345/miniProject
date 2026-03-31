'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export interface ConfirmDialogProps {
	open: boolean
	title: string
	description?: string
	confirmLabel?: string
	cancelLabel?: string
	destructive?: boolean
	loading?: boolean
	onConfirm: () => void
	onCancel: () => void
	children?: ReactNode
}

export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	destructive = false,
	loading = false,
	onConfirm,
	onCancel,
	children,
}: ConfirmDialogProps) {
	return (
		<Modal
			open={open}
			onClose={onCancel}
			title={title}
			footer={
				<>
					<Button variant='ghost' onClick={onCancel} disabled={loading}>
						{cancelLabel}
					</Button>
					<Button variant={destructive ? 'danger' : 'solid'} loading={loading} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</>
			}
		>
			{description ? <p>{description}</p> : null}
			{children}
		</Modal>
	)
}

export default ConfirmDialog
