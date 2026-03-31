"use client"

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ActivityStatus } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/constants/activityCategories'
import { formatDate, getRelativeTime } from '@/utils/date.utils'
import ActivityStatusBadge from '@/features/activities/components/ActivityStatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useMagnetic } from '@/hooks/useMagnetic'

export interface ActivityCardProps {
	activity: Activity
	onSelect?: (activity: Activity) => void
	onUploadProof?: (activity: Activity) => void
	className?: string
	compact?: boolean
}

export function ActivityCard({ activity, onSelect, onUploadProof, className = '', compact = false }: ActivityCardProps) {
	const cardRef = useRef<HTMLDivElement>(null)
	const [hovered, setHovered] = useState(false)
	useMagnetic(cardRef, { magnetRadius: 80, strength: 0.4 })

	const activityDate = useMemo(() => formatDate(activity.activityDate), [activity.activityDate])
	const relativeUpdated = useMemo(() => getRelativeTime(activity.updatedAt || activity.createdAt), [activity])
	const categoryLabel = CATEGORY_LABELS[activity.category]
	const categoryAccent = CATEGORY_COLORS[activity.category]

	return (
		<motion.article
			ref={cardRef}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -2 }}
			transition={{ duration: 0.35, ease: 'easeOut' }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className={`relative rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}
		>
			<div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
				<div className='flex-1 space-y-3'>
					<div className='flex flex-wrap items-center gap-2'>
						<Badge variant='info' className='bg-transparent text-slate-600' style={{ borderColor: categoryAccent, color: categoryAccent }}>
							{categoryLabel}
						</Badge>
						<span className='text-xs font-semibold uppercase tracking-tight text-slate-400'>
							{formatDate(activity.createdAt)}
						</span>
					</div>
					<div>
						<h3 className={`text-xl font-semibold text-slate-900 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>{activity.title}</h3>
						<p className='mt-1 text-sm text-slate-600 line-clamp-3'>{activity.description}</p>
					</div>
					<ul className='flex flex-wrap gap-3 text-xs text-slate-500'>
						<li>
							<span className='font-medium text-slate-700'>Activity date:</span> {activityDate}
						</li>
						{activity.location ? (
							<li>
								<span className='font-medium text-slate-700'>Location:</span> {activity.location}
							</li>
						) : null}
						{activity.organization ? (
							<li>
								<span className='font-medium text-slate-700'>Organization:</span> {activity.organization}
							</li>
						) : null}
					</ul>
					{activity.tags?.length ? (
						<div className='flex flex-wrap gap-2'>
							{activity.tags.map((tag) => (
								<Badge key={tag} variant='neutral' className='bg-slate-100 text-slate-600'>
									#{tag}
								</Badge>
							))}
						</div>
					) : null}
				</div>

				<div className='flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 lg:max-w-xs'>
					<ActivityStatusBadge status={activity.status} showDescription size='sm' />
					<div className='grid grid-cols-2 gap-3 text-center text-xs font-semibold text-slate-500'>
						<div className='rounded-xl border border-slate-200/70 bg-white p-3'>
							<p className='text-[10px] uppercase tracking-wide text-slate-400'>Duration</p>
							<p className='mt-1 text-base text-slate-900'>{activity.durationHours ? `${activity.durationHours}h` : '—'}</p>
						</div>
						<div className='rounded-xl border border-slate-200/70 bg-white p-3'>
							<p className='text-[10px] uppercase tracking-wide text-slate-400'>Points</p>
							<p className='mt-1 text-base text-slate-900'>{activity.pointsAwarded ?? 0}</p>
						</div>
					</div>
					<p className='text-xs text-slate-500'>Updated {relativeUpdated}</p>
				</div>
			</div>

			<AnimatePresence>
				{hovered ? (
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 4 }}
						transition={{ duration: 0.25 }}
						className='absolute right-5 top-5 flex flex-wrap gap-2'
					>
						<Link href={`/student/activities/${activity.id}`}>
							<Button size='sm' variant='outline'>View</Button>
						</Link>
						<Button size='sm' variant='ghost' onClick={() => onSelect?.(activity)}>
							Quick Actions
						</Button>
						{activity.status === ActivityStatus.REVISION_REQUESTED || activity.status === ActivityStatus.SUBMITTED ? (
							<Button size='sm' variant='solid' onClick={() => onUploadProof?.(activity)}>
								Upload Proof
							</Button>
						) : null}
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.article>
	)
}

export default ActivityCard
