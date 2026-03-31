"use client"

import { useCallback, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/ui.store'

export interface ShareLinkModalProps {
	open: boolean
	onClose: () => void
	sharePath: string
}

const buildShareLink = (path: string) => {
	if (typeof window === 'undefined') return path
	const origin = window.location.origin
	return path.startsWith('http') ? path : `${origin}${path}`
}

export function ShareLinkModal({ open, onClose, sharePath }: ShareLinkModalProps) {
	const uiStore = useUIStore()
	const [copied, setCopied] = useState(false)
	const shareLink = useMemo(() => buildShareLink(sharePath), [sharePath])

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(shareLink)
			setCopied(true)
			uiStore.addToast({ type: 'success', title: 'Link copied', message: 'Share it with mentors or recruiters.', duration: 2500 })
			setTimeout(() => setCopied(false), 2500)
		} catch (error) {
			uiStore.addToast({ type: 'error', title: 'Copy failed', message: 'Select the link and copy manually.', duration: 3000 })
		}
	}, [shareLink, uiStore])

	return (
		<Modal
			open={open}
			onClose={onClose}
			title='Share your portfolio'
			footer={
				<>
					<Button variant='ghost' onClick={onClose}>
						Close
					</Button>
					<Button onClick={handleCopy}>{copied ? 'Copied' : 'Copy link'}</Button>
				</>
			}
		>
			<p className='text-sm text-slate-600'>Send this link to recruiters or faculty mentors. They will see only approved activities.</p>
			<div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-900 break-all'>{shareLink}</div>
		</Modal>
	)
}

export default ShareLinkModal
