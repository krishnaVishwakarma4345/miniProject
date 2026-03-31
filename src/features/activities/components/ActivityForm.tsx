"use client"

import { FormEvent, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ActivityCategory, ActivityCreateRequest, ActivityType, ProofFile } from '@/types'
import {
	CATEGORY_DESCRIPTIONS,
	CATEGORY_LABELS,
	CATEGORY_MIN_PROOFS,
} from '@/constants/activityCategories'
import { ACTIVITY_TYPE_LABELS, CATEGORY_TYPE_MAP } from '@/constants/activityTypes'
import { activityCreateSchema } from '@/schemas/activity.schema'
import { useActivityCreate } from '@/features/activities/hooks/useActivityCreate'
import ProofUploader from '@/features/activities/components/ProofUploader'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/ui.store'
import { useAuth } from '@/hooks/useAuth'

export interface ActivityFormValues {
	title: string
	description: string
	category: ActivityCategory
	type: ActivityType | ''
	activityDate: string
	location: string
	organization: string
	durationHours: string
	certificatesAwards: string
	tags: string[]
}

export interface ActivityFormProps {
	defaultCategory?: ActivityCategory
	onSuccess?: (activityId: string) => void
	className?: string
}

const MAX_TAGS = 10

export function ActivityForm({ defaultCategory = ActivityCategory.TECH, onSuccess, className = '' }: ActivityFormProps) {
	const initialType = CATEGORY_TYPE_MAP[defaultCategory]?.[0] ?? ''
	const initialValues: ActivityFormValues = {
		title: '',
		description: '',
		category: defaultCategory,
		type: initialType,
		activityDate: '',
		location: '',
		organization: '',
		durationHours: '',
		certificatesAwards: '',
		tags: [],
	}

	const { user } = useAuth()
	const uiStore = useUIStore()
	const { createActivity, isSubmitting, error: submitError } = useActivityCreate()
	const [values, setValues] = useState<ActivityFormValues>(initialValues)
	const [proofFiles, setProofFiles] = useState<ProofFile[]>([])
	const [tagInput, setTagInput] = useState('')
	const [formErrors, setFormErrors] = useState<Record<string, string>>({})

	const categoryOptions = useMemo(
		() =>
			Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
				value,
				label,
			})),
		[]
	)

	const typeOptions = useMemo(() => {
		const allowedTypes = CATEGORY_TYPE_MAP[values.category] || []
		return allowedTypes.map((type) => ({ value: type, label: ACTIVITY_TYPE_LABELS[type] }))
	}, [values.category])

	const selectedCategoryDescription = CATEGORY_DESCRIPTIONS[values.category]
	const minProofs = CATEGORY_MIN_PROOFS[values.category]
	const todayIso = useMemo(() => new Date().toISOString().split('T')[0], [])

	const handleValueChange = <K extends keyof ActivityFormValues>(field: K, nextValue: ActivityFormValues[K]) => {
		setValues((prev) => ({ ...prev, [field]: nextValue }))
		setFormErrors((prev) => {
			const next = { ...prev }
			delete next[field as string]
			return next
		})
	}

	const handleCategoryChange = (nextCategory: ActivityCategory) => {
		const allowedTypes = CATEGORY_TYPE_MAP[nextCategory] || []
		const nextType = allowedTypes.includes(values.type as ActivityType) ? values.type : allowedTypes[0] || ''
		handleValueChange('category', nextCategory)
		handleValueChange('type', nextType as ActivityType | '')
	}

	const handleAddTag = () => {
		const candidate = tagInput.trim().replace(/\s+/g, '-').toLowerCase()
		if (!candidate) return
		if (values.tags.includes(candidate)) {
			setTagInput('')
			return
		}
		if (values.tags.length >= MAX_TAGS) {
			setFormErrors((prev) => ({ ...prev, tags: 'You can attach up to 10 tags.' }))
			return
		}
		handleValueChange('tags', [...values.tags, candidate])
		setTagInput('')
	}

	const handleRemoveTag = (tag: string) => {
		handleValueChange(
			'tags',
			values.tags.filter((existing) => existing !== tag)
		)
	}

	const mapErrors = (message: string, path?: PropertyKey[]) => {
		if ((!path || !path.length) && message.toLowerCase().includes('proof')) {
			return { key: 'proofFiles', message }
		}
		const key = path && path.length ? String(path[0]) : 'form'
		return { key, message }
	}

	const resetForm = () => {
		setValues(initialValues)
		setProofFiles([])
		setTagInput('')
		setFormErrors({})
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setFormErrors({})

		const activityDate = values.activityDate ? new Date(values.activityDate).getTime() : Number.NaN
		const payload: ActivityCreateRequest = {
			title: values.title,
			description: values.description,
			category: values.category,
			type: values.type as ActivityType,
			activityDate,
			location: values.location || undefined,
			organization: values.organization || undefined,
			durationHours: values.durationHours ? Number(values.durationHours) : undefined,
			certificatesAwards: values.certificatesAwards || undefined,
			tags: values.tags,
			proofFiles,
		}

		const validation = activityCreateSchema.safeParse(payload)
		if (!validation.success) {
			const fieldErrors: Record<string, string> = {}
			validation.error.issues.forEach((issue) => {
				const { key, message } = mapErrors(issue.message, issue.path)
				fieldErrors[key] = message
			})
			setFormErrors(fieldErrors)
			return
		}

		try {
			const response = await createActivity(validation.data)
			uiStore.addToast({
				type: 'success',
				title: 'Activity submitted',
				message: 'We notified your mentor and queued the review.',
				duration: 3600,
			})
			resetForm()
			onSuccess?.(response.id)
		} catch (error) {
			setFormErrors((prev) => ({ ...prev, form: error instanceof Error ? error.message : 'Something went wrong' }))
		}
	}

	return (
		<motion.form
			onSubmit={handleSubmit}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: 'easeOut' }}
			className={`space-y-8 rounded-[32px] border border-slate-200 bg-white/80 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}
		>
			<div className='flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 p-6 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between'>
				<div>
					<p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Submitting as</p>
					<p className='text-lg font-semibold text-slate-900'>{user?.displayName || 'Student'}</p>
					<p className='text-xs text-slate-500'>Your institution & faculty mentors can see this submission instantly.</p>
				</div>
				<div className='max-w-sm rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-inner'>
					<p className='text-sm font-semibold text-slate-900'>{CATEGORY_LABELS[values.category]}</p>
					<p className='text-xs text-slate-500'>{selectedCategoryDescription}</p>
					<p className='mt-2 text-xs text-slate-500'>Attach at least {minProofs} proof file(s). Currently {proofFiles.length} added.</p>
				</div>
			</div>

			<div className='grid gap-5 md:grid-cols-2'>
				<Input label='Activity Title' name='title' placeholder='Ex: Won Smart India Hackathon 2025' value={values.title} onChange={(event) => handleValueChange('title', event.target.value)} error={formErrors.title} maxLength={200} required />
				<Input label='Location' name='location' placeholder='Ex: New Delhi, India' value={values.location} onChange={(event) => handleValueChange('location', event.target.value)} error={formErrors.location} maxLength={200} />
				<Input label='Organization / Host' name='organization' placeholder='Ex: Ministry of Education' value={values.organization} onChange={(event) => handleValueChange('organization', event.target.value)} error={formErrors.organization} maxLength={200} />
				<Input label='Certificates & Awards' name='certificatesAwards' placeholder='Ex: National winner, Best UX' value={values.certificatesAwards} onChange={(event) => handleValueChange('certificatesAwards', event.target.value)} error={formErrors.certificatesAwards} maxLength={500} />
			</div>

			<Textarea label='Detailed Description' name='description' placeholder='Describe your role, impact, metrics, collaborations…' value={values.description} onChange={(event) => handleValueChange('description', event.target.value)} error={formErrors.description} rows={5} />

			<div className='grid gap-5 md:grid-cols-3'>
				<Select label='Category' name='category' value={values.category} onChange={(event) => handleCategoryChange(event.target.value as ActivityCategory)} options={categoryOptions} error={formErrors.category} />
				<Select label='Activity Type' name='type' value={values.type} onChange={(event) => handleValueChange('type', event.target.value as ActivityType)} options={typeOptions} placeholder='Select a type' error={formErrors.type} />
				<Input label='Activity Date' type='date' name='activityDate' max={todayIso} value={values.activityDate} onChange={(event) => handleValueChange('activityDate', event.target.value)} error={formErrors.activityDate} required />
			</div>

			<div className='grid gap-5 md:grid-cols-3'>
				<Input label='Duration (hours)' type='number' name='durationHours' min={1} step={1} value={values.durationHours} onChange={(event) => handleValueChange('durationHours', event.target.value)} error={formErrors.durationHours} hint='Estimate total hours spent.' />
				<div className='md:col-span-2'>
					<label className='mb-1.5 block text-sm font-medium text-slate-700'>Tags</label>
					<div className='flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 sm:flex-row'>
						<input
							type='text'
							value={tagInput}
							placeholder='Add up to 10 tags (press Enter)'
							className='h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30'
							onChange={(event) => setTagInput(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault()
									handleAddTag()
								}
							}}
						/>
						<Button type='button' variant='outline' onClick={handleAddTag} disabled={!tagInput.trim()}>
							Add tag
						</Button>
					</div>
					{formErrors.tags ? <p className='mt-1 text-xs text-rose-500'>{formErrors.tags}</p> : null}
					{values.tags.length ? (
						<ul className='mt-3 flex flex-wrap gap-2'>
							{values.tags.map((tag) => (
								<li key={tag} className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700'>
									#{tag}
									<button type='button' className='text-slate-400 transition hover:text-slate-700' onClick={() => handleRemoveTag(tag)}>
										×
									</button>
								</li>
							))}
						</ul>
					) : null}
				</div>
			</div>

			<div className='rounded-3xl border border-slate-100 bg-slate-50/50 p-6'>
				<div className='flex flex-wrap items-center justify-between gap-3 pb-4'>
					<div>
						<h3 className='text-base font-semibold text-slate-900'>Proof of participation</h3>
						<p className='text-sm text-slate-500'>Upload certificates, scoreboards, photos, or short clips. Min {minProofs} proofs for {CATEGORY_LABELS[values.category]}.</p>
					</div>
					<span className='text-xs font-semibold uppercase tracking-tight text-slate-400'>{proofFiles.length} / 10 files</span>
				</div>
				<ProofUploader value={proofFiles} onChange={setProofFiles} maxFiles={10} />
				{formErrors.proofFiles ? <p className='mt-2 text-xs text-rose-500'>{formErrors.proofFiles}</p> : null}
			</div>

			<AnimatePresence>
				{(formErrors.form || submitError) && (
					<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className='text-sm text-rose-600'>
						{formErrors.form || submitError}
					</motion.p>
				)}
			</AnimatePresence>

			<div className='flex flex-wrap items-center justify-between gap-3'>
				<Button type='button' variant='ghost' onClick={resetForm} disabled={isSubmitting}>
					Reset form
				</Button>
				<div className='flex flex-wrap gap-3'>
					<Button type='submit' size='lg' loading={isSubmitting}>
						Submit activity
					</Button>
				</div>
			</div>
		</motion.form>
	)
}

export default ActivityForm
