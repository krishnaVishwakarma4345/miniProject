"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, ActivityStatus } from '@/types'
import { formatDateTime } from '@/utils/date.utils'

export interface ActivityTimelineProps {
	activity: Activity
}

const statusAccent: Record<ActivityStatus, string> = {
	[ActivityStatus.DRAFT]: '#94a3b8',
	[ActivityStatus.SUBMITTED]: '#3b82f6',
	[ActivityStatus.UNDER_REVIEW]: '#f59e0b',
	[ActivityStatus.APPROVED]: '#14b8a6',
	[ActivityStatus.REJECTED]: '#f43f5e',
	[ActivityStatus.REVISION_REQUESTED]: '#fb923c',
}

export function ActivityTimeline({ activity }: ActivityTimelineProps) {
	const events = useMemo(() => {
		const timeline: Array<{ id: string; label: string; timestamp?: number; description: string; status: ActivityStatus }> = [
			{
				id: 'created',
				label: 'Draft Created',
				timestamp: activity.createdAt,
				description: 'You started documenting this activity.',
				status: ActivityStatus.DRAFT,
			},
			{
				id: 'submitted',
				label: 'Submitted for Review',
				timestamp: activity.submittedAt,
				description: 'Activity sent to faculty reviewers.',
				status: ActivityStatus.SUBMITTED,
			},
		]

		if (activity.status === ActivityStatus.UNDER_REVIEW || activity.status === ActivityStatus.APPROVED || activity.status === ActivityStatus.REJECTED || activity.status === ActivityStatus.REVISION_REQUESTED) {
			timeline.push({
				id: 'under-review',
				label: 'Under Review',
				timestamp: activity.updatedAt,
				description: 'Faculty is currently validating your submission.',
				status: ActivityStatus.UNDER_REVIEW,
			})
		}

		if (activity.review?.reviewedAt) {
			timeline.push({
				id: 'reviewed',
				label: activity.status === ActivityStatus.APPROVED ? 'Approved' : activity.status === ActivityStatus.REJECTED ? 'Rejected' : 'Reviewed',
				timestamp: activity.review.reviewedAt,
				description: activity.review.remarks || 'Faculty recorded a decision.',
				status: activity.status,
			})
		}

		return timeline.filter((event) => Boolean(event.timestamp))
	}, [activity])

	if (!events.length) {
		return null
	}

	return (
		<div className='relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
			<h4 className='text-sm font-semibold uppercase tracking-tight text-slate-500'>Progress Timeline</h4>
			<div className='mt-4 flex flex-col gap-6 pl-6'>
				<motion.span
					initial={{ height: 0 }}
					animate={{ height: '100%' }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className='absolute left-6 top-16 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-slate-200 via-slate-300 to-transparent'
				/>
				{events.map((event, index) => (
					<motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className='relative'>
						<span
							className='absolute left-[-38px] top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 bg-white'
							style={{ borderColor: statusAccent[event.status] }}
						/>
						<div className='rounded-2xl border border-slate-100 bg-slate-50/60 p-4'>
							<div className='flex items-center justify-between gap-4'>
								<p className='text-sm font-semibold text-slate-900'>{event.label}</p>
								<p className='text-xs text-slate-500'>{event.timestamp ? formatDateTime(event.timestamp) : '—'}</p>
							</div>
							<p className='mt-1 text-sm text-slate-600'>{event.description}</p>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}

export default ActivityTimeline
