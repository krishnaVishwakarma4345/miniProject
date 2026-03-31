"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Activity } from '@/types'
import { formatDate, getRelativeTime } from '@/utils/date.utils'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/constants/activityCategories'
import ActivityStatusBadge from '@/features/activities/components/ActivityStatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface ReviewCardProps {
	activity: Activity
	selected?: boolean
	onSelectToggle?: (activityId: string) => void
	onApprove: (activity: Activity) => void
	onReject: (activity: Activity) => void
	onAssign?: (activity: Activity) => void
}

export function ReviewCard({ activity, selected, onSelectToggle, onApprove, onReject, onAssign }: ReviewCardProps) {
	const proofCount = activity.proofFiles?.length ?? 0
	const categoryColor = CATEGORY_COLORS[activity.category]

	return (
		<motion.article
			layout
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-lg backdrop-blur transition ${selected ? 'ring-2 ring-slate-900/40' : ''}`}
		>
			<div className='flex flex-col gap-5 md:flex-row md:items-start'>
				<div className='flex items-start gap-4 md:w-2/3'>
					<button
						onClick={() => onSelectToggle?.(activity.id)}
						className={`mt-1 h-5 w-5 rounded-md border ${selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}
						aria-label='Select activity'
					>
						✓
					</button>
					<div className='space-y-3'>
						<div className='flex flex-wrap items-center gap-2'>
							<Badge variant='info' className='bg-transparent text-slate-600' style={{ borderColor: categoryColor, color: categoryColor }}>
								{CATEGORY_LABELS[activity.category]}
							</Badge>
							<p className='text-xs uppercase tracking-wide text-slate-400'>{formatDate(activity.createdAt)}</p>
						</div>
						<h3 className='text-lg font-semibold text-slate-900'>{activity.title}</h3>
						<p className='text-sm text-slate-600 line-clamp-3'>{activity.description}</p>
						<ul className='text-xs text-slate-500'>
							<li>
								<span className='font-semibold text-slate-700'>Student:</span> {activity.submittedByName}
							</li>
							<li>
								<span className='font-semibold text-slate-700'>Activity date:</span> {formatDate(activity.activityDate)}
							</li>
							<li>
								<span className='font-semibold text-slate-700'>Pending for:</span> {getRelativeTime(activity.submittedAt || activity.createdAt)}
							</li>
						</ul>
						<div className='flex flex-wrap gap-2 text-xs text-slate-500'>
							{activity.assignedToName ? <Badge variant='neutral'>Assigned to {activity.assignedToName}</Badge> : <Badge variant='neutral'>Unassigned</Badge>}
							<Badge variant='neutral'>{proofCount} proof{proofCount === 1 ? '' : 's'}</Badge>
						</div>
					</div>
				</div>
				<div className='flex flex-1 flex-col gap-3 md:items-end'>
					<ActivityStatusBadge status={activity.status} />
					<div className='flex flex-wrap gap-2'>
						<Button variant='ghost' size='sm' onClick={() => onAssign?.(activity)}>Assign</Button>
						<Button variant='outline' size='sm' onClick={() => onReject(activity)}>Reject</Button>
						<Button size='sm' onClick={() => onApprove(activity)}>Approve</Button>
					</div>
					<Link href={`/faculty/review/${activity.id}`} className='text-sm font-semibold text-slate-600 hover:text-slate-900'>
						View details →
					</Link>
				</div>
			</div>
		</motion.article>
	)
}

export default ReviewCard
