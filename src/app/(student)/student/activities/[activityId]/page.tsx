"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Activity, ApiResponse } from '@/types'
import { CATEGORY_LABELS } from '@/constants/activityCategories'
import { formatDate } from '@/utils/date.utils'
import ActivityTimeline from '@/features/activities/components/ActivityTimeline'
import ActivityStatusBadge from '@/features/activities/components/ActivityStatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { ErrorState } from '@/components/data-display/ErrorState'
import { PageContainer } from '@/components/layout/PageContainer'

export default function ActivityDetailPage() {
	const router = useRouter()
	const params = useParams<{ activityId: string }>()
	const activityId = Array.isArray(params?.activityId) ? params.activityId[0] : params?.activityId
	const [activity, setActivity] = useState<Activity | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const loadActivity = useCallback(async () => {
		if (!activityId) {
			setActivity(null)
			setError('Missing activity id')
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(`/api/activity/detail?activityId=${encodeURIComponent(activityId)}`, {
				method: 'GET',
				credentials: 'include',
			})
			const payload = (await response.json()) as ApiResponse<Activity>

			if (!response.ok || !payload.success || !payload.data) {
				throw new Error(payload.message || 'Activity not found')
			}

			setActivity(payload.data)
		} catch (fetchError) {
			setActivity(null)
			setError(fetchError instanceof Error ? fetchError.message : 'Activity not found')
		} finally {
			setIsLoading(false)
		}
	}, [activityId])

	useEffect(() => {
		void loadActivity()
	}, [loadActivity])

	if (isLoading && !activity) {
		return (
			<PageContainer>
				<div className='rounded-3xl border border-slate-200 bg-white p-6'>
					<LoadingSkeleton lines={6} />
				</div>
			</PageContainer>
		)
	}

	if (!activity) {
		return <PageContainer><ErrorState title='Activity not found' message={error || 'We could not locate this submission.'} action={<Button onClick={() => void loadActivity()}>Reload</Button>} /></PageContainer>
	}

	return (
		<PageContainer className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm'>
				<div>
					<button type='button' className='text-xs font-semibold text-slate-500 underline-offset-4 hover:underline' onClick={() => router.back()}>
						← Back to activities
					</button>
					<h1 className='mt-2 text-2xl font-semibold text-slate-900'>{activity.title}</h1>
					<p className='text-sm text-slate-500'>Submitted {formatDate(activity.createdAt)} • {CATEGORY_LABELS[activity.category]}</p>
				</div>
				<div className='flex flex-col items-end gap-3'>
					<ActivityStatusBadge status={activity.status} showDescription />
					<Link href='/student/activities/add'>
						<Button size='sm' variant='outline'>Log another</Button>
					</Link>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				<section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2'>
					<h2 className='text-sm font-semibold uppercase tracking-tight text-slate-500'>Overview</h2>
					<p className='mt-2 text-base text-slate-700'>{activity.description}</p>
					<div className='mt-6 grid gap-4 md:grid-cols-2'>
						<DetailItem label='Category' value={CATEGORY_LABELS[activity.category]} />
						<DetailItem label='Type' value={activity.type.replace(/_/g, ' ')} />
						<DetailItem label='Activity Date' value={formatDate(activity.activityDate)} />
						<DetailItem label='Location' value={activity.location || '—'} />
						<DetailItem label='Organization' value={activity.organization || '—'} />
						<DetailItem label='Duration' value={activity.durationHours ? `${activity.durationHours} hours` : '—'} />
					</div>
					{activity.tags?.length ? (
						<div className='mt-6 flex flex-wrap gap-2'>
							{activity.tags.map((tag) => (
								<Badge key={tag} variant='neutral'>#{tag}</Badge>
							))}
						</div>
					) : null}
				</section>
				<ActivityTimeline activity={activity} />
			</div>

			<section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<h3 className='text-base font-semibold text-slate-900'>Proof files</h3>
					<span className='text-xs text-slate-500'>{activity.proofFiles.length} uploaded</span>
				</div>
				<div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{activity.proofFiles.map((file) => (
						<a key={file.id} href={file.secureUrl || file.url} target='_blank' rel='noreferrer' className='group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50'>
							{file.type === 'image' ? (
								<Image
									src={file.secureUrl || file.url}
									alt={file.name}
									width={1200}
									height={800}
									className='h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]'
								/>
							) : (
								<div className='flex h-48 flex-col items-center justify-center gap-2 text-slate-600'>
									<span className='text-sm font-semibold uppercase'>{file.type}</span>
									<p className='text-xs text-slate-500 text-center px-4'>{file.name}</p>
								</div>
							)}
						</a>
					))}
				</div>
			</section>

			{activity.review ? (
				<section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
					<h3 className='text-base font-semibold text-slate-900'>Faculty remarks</h3>
					<p className='mt-2 text-sm text-slate-600'>{activity.review.remarks || 'No remarks provided.'}</p>
					<div className='mt-4 grid gap-4 sm:grid-cols-2'>
						<DetailItem label='Reviewed by' value={activity.review.reviewerName || activity.review.reviewedBy} />
						<DetailItem label='Reviewed at' value={formatDate(activity.review.reviewedAt)} />
						<DetailItem label='Score' value={activity.review.score ? `${activity.review.score}/100` : '—'} />
						<DetailItem label='Points awarded' value={activity.review.pointsAwarded ? `${activity.review.pointsAwarded} pts` : '—'} />
					</div>
				</section>
			) : null}
		</PageContainer>
	)
}

function DetailItem({ label, value }: { label: string; value: string }) {
	return (
		<div className='rounded-2xl border border-slate-100 bg-slate-50/70 p-4'>
			<p className='text-xs uppercase tracking-tight text-slate-400'>{label}</p>
			<p className='text-sm font-semibold text-slate-900'>{value}</p>
		</div>
	)
}
