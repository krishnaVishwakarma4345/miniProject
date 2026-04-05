"use client"

import Link from 'next/link'
import { useMemo } from 'react'
import { ActivityStatus } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import useActivities from '@/features/activities/hooks/useActivities'
import ActivityList from '@/features/activities/components/ActivityList'
import { StatCard } from '@/components/data-display/StatCard'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export default function StudentDashboardPage() {
	const { user } = useAuth()
	const { activities, isLoading, error, refresh } = useActivities(user?.id)

	const stats = useMemo(() => {
		const total = activities.length
		const approved = activities.filter((activity) => activity.status === ActivityStatus.APPROVED).length
		const underReview = activities.filter((activity) => activity.status === ActivityStatus.UNDER_REVIEW).length
		const earnedCredits = activities.reduce((sum, activity) => {
			if (activity.status !== ActivityStatus.APPROVED) {
				return sum
			}

			const points =
				typeof activity.pointsAwarded === 'number'
					? activity.pointsAwarded
					: typeof activity.review?.pointsAwarded === 'number'
						? activity.review.pointsAwarded
						: 0

			return sum + points
		}, 0)
		return [
			{ label: 'Total submissions', value: total },
			{ label: 'Approved wins', value: approved },
			{ label: 'Under review', value: underReview },
			{ label: 'Total credits earned', value: earnedCredits, suffix: ' pts' },
		]
	}, [activities])

	return (
		<div className='space-y-6'>
			<ScrollReveal from='left'>
				<section className='rounded-4xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-8 shadow-sm'>
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<div>
						<p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Welcome back</p>
						<h2 className='text-2xl font-semibold text-slate-900'>{user?.displayName || 'Student'}</h2>
						<p className='text-sm text-slate-600'>Track approvals, add new achievements, and keep your portfolio fresh.</p>
					</div>
					<div className='flex gap-3'>
						<Link href='/student/profile'>
							<Button variant='outline'>Profile</Button>
						</Link>
						<Button variant='outline' onClick={() => refresh()} loading={isLoading}>
							Refresh
						</Button>
						<Link href='/student/activities/add'>
							<Button>+ Add activity</Button>
						</Link>
					</div>
				</div>
				</section>
			</ScrollReveal>

			<ScrollReveal from='right'>
				<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
					{stats.map((stat) => (
						<StatCard key={stat.label} label={stat.label} value={stat.value} />
					))}
				</section>
			</ScrollReveal>

			<ScrollReveal from='left'>
			<section className='space-y-4'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<h3 className='text-lg font-semibold text-slate-900'>Recent activity</h3>
					<Link href='/student/activities' className='text-sm font-semibold text-slate-600 underline-offset-4 hover:underline'>
						View all
					</Link>
				</div>
				<ActivityList
					activities={activities.slice(0, 5)}
					isLoading={isLoading}
					error={error}
					onRetry={refresh}
					emptyAction={
						<Link href='/student/activities/add'>
							<Button variant='outline'>Start logging activities</Button>
						</Link>
					}
				/>
			</section>
			</ScrollReveal>
		</div>
	)
}
