"use client"

import { ReactNode, useMemo } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Activity } from '@/types'
import ActivityCard from '@/features/activities/components/ActivityCard'
import { EmptyState } from '@/components/data-display/EmptyState'
import { ErrorState } from '@/components/data-display/ErrorState'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { Button } from '@/components/ui/Button'

export interface ActivityListProps {
	activities: Activity[]
	isLoading: boolean
	error?: string | null
	onRetry?: () => void
	onSelect?: (activity: Activity) => void
	onUploadProof?: (activity: Activity) => void
	emptyAction?: ReactNode
}

export function ActivityList({
	activities,
	isLoading,
	error,
	onRetry,
	onSelect,
	onUploadProof,
	emptyAction,
}: ActivityListProps) {
	const [listRef] = useAutoAnimate({ duration: 260, easing: 'ease-out' })
	const orderedActivities = useMemo(() => [...activities].sort((a, b) => b.createdAt - a.createdAt), [activities])

	if (isLoading) {
		return (
			<div className='rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm'>
				<LoadingSkeleton lines={6} />
			</div>
		)
	}

	if (error) {
		return (
			<ErrorState
				title='Unable to fetch activities'
				message={error}
				action={
					onRetry ? (
						<Button variant='outline' onClick={onRetry}>
							Try again
						</Button>
					) : null
				}
			/>
		)
	}

	if (!orderedActivities.length) {
		return (
			<EmptyState
				title='No activities yet'
				description='Start by logging your first activity – workshops, clubs, hackathons, anything that showcases your growth.'
				action={emptyAction}
			/>
		)
	}

	return (
		<div ref={listRef} className='space-y-4'>
			{orderedActivities.map((activity) => (
				<ActivityCard key={activity.id} activity={activity} onSelect={onSelect} onUploadProof={onUploadProof} />
			))}
		</div>
	)
}

export default ActivityList
