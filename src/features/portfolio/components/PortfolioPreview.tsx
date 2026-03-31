"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity } from '@/types'
import { CATEGORY_LABELS } from '@/constants/activityCategories'
import { formatDate, formatDateTime } from '@/utils/date.utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import PortfolioSection from '@/features/portfolio/components/PortfolioSection'
import { PortfolioData } from '@/features/portfolio/services/portfolio.service'

export interface PortfolioPreviewProps {
	data: PortfolioData
	studentName?: string
	onShare?: () => void
}

const summarizeCategories = (activities: Activity[]) => {
	return activities.reduce<Record<string, number>>((acc, activity) => {
		const key = activity.category
		acc[key] = (acc[key] || 0) + 1
		return acc
	}, {})
}

export function PortfolioPreview({ data, studentName, onShare }: PortfolioPreviewProps) {
	const topActivities = useMemo(() => data.approvedActivities.slice(0, 4), [data.approvedActivities])
	const categorySummary = useMemo(() => summarizeCategories(data.approvedActivities), [data.approvedActivities])
	const timeline = useMemo(() => [...data.approvedActivities].sort((a, b) => (b.activityDate || 0) - (a.activityDate || 0)), [data.approvedActivities])

	return (
		<section className='space-y-6'>
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
				className='rounded-[32px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.12)]'
			>
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<div>
						<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Smart Student Portfolio</p>
						<h2 className='mt-2 text-2xl font-semibold text-slate-900'>{studentName || 'Student showcase'}</h2>
						<p className='text-sm text-slate-600'>Last generated {formatDateTime(data.generatedAt)}</p>
					</div>
					<div className='flex gap-3'>
						<Button variant='outline' onClick={onShare} disabled={!onShare}>
							Share link
						</Button>
						<Button variant='ghost' className='text-slate-900' disabled>
							{data.totalApproved} approved
						</Button>
					</div>
				</div>
				<div className='mt-6 grid gap-4 md:grid-cols-3'>
					<div className='rounded-2xl border border-slate-200 bg-white p-4 text-center'>
						<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Approved</p>
						<p className='text-3xl font-bold text-slate-900'>{data.totalApproved}</p>
						<p className='text-xs text-slate-500'>Activities validated by faculty</p>
					</div>
					<div className='rounded-2xl border border-slate-200 bg-white p-4 text-center'>
						<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Highlights</p>
						<p className='text-3xl font-bold text-slate-900'>{Math.min(4, data.approvedActivities.length)}</p>
						<p className='text-xs text-slate-500'>Top achievements spotlighted below</p>
					</div>
					<div className='rounded-2xl border border-slate-200 bg-white p-4 text-center'>
						<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Share URL</p>
						<p className='text-sm font-semibold text-slate-900 break-all'>{data.shareUrl}</p>
					</div>
				</div>
			</motion.div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<PortfolioSection title='HIGHLIGHTS' subtitle='Signature achievements' index={0}>
					{topActivities.length ? (
						<ul className='space-y-4'>
							{topActivities.map((activity) => (
								<li key={activity.id} className='rounded-2xl border border-slate-100 bg-slate-50/70 p-4'>
									<div className='flex flex-wrap items-center justify-between gap-2'>
										<h4 className='text-base font-semibold text-slate-900'>{activity.title}</h4>
										<span className='text-xs text-slate-500'>{formatDate(activity.activityDate)}</span>
									</div>
									<p className='mt-1 text-sm text-slate-600 line-clamp-2'>{activity.description}</p>
									<div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500'>
										<Badge variant='neutral' className='bg-white/80 text-slate-700'>
											{CATEGORY_LABELS[activity.category]}
										</Badge>
										{activity.location ? <span>• {activity.location}</span> : null}
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className='text-sm text-slate-500'>Submit activities to populate your highlights.</p>
					)}
				</PortfolioSection>
				<PortfolioSection title='MIX' subtitle='Category breakdown' index={1}>
					{Object.keys(categorySummary).length ? (
						<ul className='space-y-3'>
							{Object.entries(categorySummary)
								.sort((a, b) => b[1] - a[1])
								.map(([category, count]) => (
									<li key={category} className='flex items-center gap-3'>
										<div className='flex-1'>
											<p className='text-sm font-semibold text-slate-900'>{CATEGORY_LABELS[category as Activity['category']]}</p>
											<div className='mt-2 h-2 rounded-full bg-slate-100'>
												<div className='h-full rounded-full bg-slate-900' style={{ width: `${Math.min((count / data.totalApproved) * 100, 100)}%` }} />
											</div>
										</div>
										<span className='text-sm font-semibold text-slate-700'>{count}</span>
									</li>
								))}
						</ul>
					) : (
						<p className='text-sm text-slate-500'>No approved activities yet.</p>
					)}
				</PortfolioSection>
			</div>

			<PortfolioSection title='TIMELINE' subtitle='Every approved milestone' index={2}>
				{timeline.length ? (
					<ul className='space-y-4'>
						{timeline.map((activity) => (
							<li key={activity.id} className='flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between'>
								<div>
									<p className='text-sm font-semibold text-slate-900'>{activity.title}</p>
									<p className='text-xs text-slate-500'>{CATEGORY_LABELS[activity.category]}</p>
								</div>
								<p className='text-xs font-semibold text-slate-600'>{formatDate(activity.activityDate)}</p>
							</li>
						))}
					</ul>
				) : (
					<p className='text-sm text-slate-500'>Once activities are approved they appear here chronologically.</p>
				)}
			</PortfolioSection>
		</section>
	)
}

export default PortfolioPreview
