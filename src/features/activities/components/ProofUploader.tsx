"use client"

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ProofFile } from '@/types'
import { Button } from '@/components/ui/Button'
import { buildCloudinaryUrl } from '@/utils/cloudinary.utils'

export interface ProofUploaderProps {
	value: ProofFile[]
	onChange: (files: ProofFile[]) => void
	maxFiles?: number
	className?: string
}

interface UploadProgress {
	name: string
	progress: number
}

const readableSize = (bytes: number) => {
	if (!bytes) return '0 KB'
	const units = ['B', 'KB', 'MB', 'GB']
	const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
	return `${(bytes / Math.pow(1024, exponent)).toFixed(1)} ${units[exponent]}`
}

const fileKind = (file: File | ProofFile): ProofFile['type'] => {
	const mime = 'mimeType' in file ? file.mimeType : file.type
	if (mime.startsWith('image/')) return 'image'
	if (mime.includes('pdf')) return 'pdf'
	if (mime.startsWith('video/')) return 'video'
	return 'document'
}

export function ProofUploader({ value, onChange, maxFiles = 6, className = '' }: ProofUploaderProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [dragging, setDragging] = useState(false)
	const [uploading, setUploading] = useState<UploadProgress | null>(null)
	const [error, setError] = useState<string | null>(null)

	const remainingSlots = useMemo(() => Math.max(maxFiles - value.length, 0), [maxFiles, value.length])

	const handleFiles = async (files: FileList | File[]) => {
		const fileArray = Array.from(files)
		setError(null)

		for (const file of fileArray) {
			if (!remainingSlots) {
				setError('Maximum proof limit reached')
				return
			}

			if (file.size > 10 * 1024 * 1024) {
				setError('Files must be under 10MB')
				continue
			}

			await uploadFile(file)
		}
	}

	const uploadFile = async (file: File) => {
		setUploading({ name: file.name, progress: 5 })
		try {
			const signatureResponse = await fetch('/api/upload/sign', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ folder: 'student_activities/proof', resourceType: 'auto' }),
			})
			const payload = await signatureResponse.json()
			if (!signatureResponse.ok || !payload.success) {
				throw new Error(payload.message || 'Unable to fetch upload signature')
			}

			const data = payload.data as {
				signature: string
				timestamp: number
				cloudName: string
				uploadEndpoint: string
				folder: string
				resourceType?: string
				apiKey?: string
			}

			const uploadUrl = `${data.uploadEndpoint}/${data.cloudName}/${data.resourceType || 'auto'}/upload`
			const formData = new FormData()
			formData.append('file', file)
			formData.append('signature', data.signature)
			formData.append('timestamp', String(data.timestamp))
			formData.append('folder', data.folder)
			if (data.apiKey) {
				formData.append('api_key', data.apiKey)
			}

			const response = await new Promise<Response>((resolve, reject) => {
				const request = new XMLHttpRequest()
				request.open('POST', uploadUrl)
				request.upload.onprogress = (event) => {
					if (!event.lengthComputable) return
					const progress = Math.round((event.loaded / event.total) * 100)
					setUploading({ name: file.name, progress })
				}
				request.onload = () => {
					if (request.status >= 200 && request.status < 300) {
						const blob = new Blob([request.response], { type: 'application/json' })
						resolve(new Response(blob))
					} else {
						reject(new Error('Upload failed'))
					}
				}
				request.onerror = () => reject(new Error('Upload failed'))
				request.responseType = 'json'
				request.send(formData)
			})

			const uploadResult = await response.json()
			const proof: ProofFile = {
				id: uploadResult.public_id,
				name: file.name,
				type: fileKind(file),
				url: uploadResult.secure_url,
				secureUrl: uploadResult.secure_url,
				size: uploadResult.bytes,
				mimeType: file.type,
				uploadedAt: Date.now(),
				order: value.length,
				metadata: {
					width: uploadResult.width,
					height: uploadResult.height,
				},
			}

			onChange([...value, proof])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to upload proof right now')
		} finally {
			setUploading(null)
		}
	}

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return
		void handleFiles(event.target.files)
	}

	const onDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		setDragging(false)
		if (event.dataTransfer.files?.length) {
			void handleFiles(event.dataTransfer.files)
		}
	}

	const removeFile = (id: string) => {
		onChange(value.filter((file) => file.id !== id))
	}

	return (
		<section className={`space-y-4 ${className}`}>
			<div
				onDragOver={(event) => {
					event.preventDefault()
					setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={onDrop}
				className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center transition ${dragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white/70'}`}
			>
				<input ref={inputRef} type='file' className='sr-only' multiple onChange={onInputChange} accept='image/*,application/pdf,video/*' />
				<motion.div initial={{ scale: 0.94, opacity: 0.8 }} animate={{ scale: dragging ? 1.02 : 1, opacity: 1 }} className='grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl text-slate-500'>
					+
				</motion.div>
				<div>
					<p className='text-base font-semibold text-slate-900'>Drop files here or click to browse</p>
					<p className='text-sm text-slate-500'>Images, PDF certificates, or short clips up to 10MB. {remainingSlots} slot(s) left.</p>
				</div>
				<Button variant='outline' size='sm' onClick={() => inputRef.current?.click()}>
					Select files
				</Button>
				{uploading ? (
					<div className='mt-4 flex items-center gap-3 text-sm font-medium text-slate-600'>
						<ProgressArc progress={uploading.progress} />
						Uploading {uploading.name}
					</div>
				) : null}
			</div>

			{error ? <p className='text-sm text-rose-500'>{error}</p> : null}

			{value.length ? (
				<ul className='grid gap-3'>
					{value.map((file, index) => (
						<motion.li key={file.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className='flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4'>
							<div className='flex items-center gap-3'>
								<FileThumbnail file={file} />
								<div>
									<p className='text-sm font-semibold text-slate-900'>{file.name}</p>
									<p className='text-xs text-slate-500'>{readableSize(file.size)} • {file.type}</p>
								</div>
							</div>
							<Button variant='ghost' size='sm' onClick={() => removeFile(file.id)}>
								Remove
							</Button>
						</motion.li>
					))}
				</ul>
			) : null}
		</section>
	)
}

function FileThumbnail({ file }: { file: ProofFile }) {
	if (file.type === 'image') {
		const preview = buildCloudinaryUrl(file.id || file.name, 'c_fill,w_80,h_80,q_auto,f_auto')
		return <img src={preview} alt={file.name} className='h-14 w-14 rounded-xl object-cover shadow-sm' />
	}
	return (
		<span className='grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-lg text-slate-500'>
			{file.type === 'pdf' ? 'PDF' : file.type === 'video' ? 'VID' : 'DOC'}
		</span>
	)
}

function ProgressArc({ progress }: { progress: number }) {
	const clamped = Math.min(Math.max(progress, 0), 100)
	const offset = 100 - clamped
	return (
		<svg viewBox='0 0 36 36' className='h-8 w-8'>
			<circle cx='18' cy='18' r='16' stroke='#e2e8f0' strokeWidth='3' fill='none' />
			<motion.circle
				cx='18'
				cy='18'
				r='16'
				stroke='#0f172a'
				strokeWidth='3'
				fill='none'
				strokeDasharray='100'
				strokeDashoffset={offset}
				animate={{ strokeDashoffset: offset }}
				transition={{ duration: 0.2 }}
			/>
		</svg>
	)
}

export default ProofUploader
