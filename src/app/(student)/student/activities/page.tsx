"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useActivities from '@/features/activities/hooks/useActivities'
import ActivityFilter from '@/features/activities/components/ActivityFilter'
import ActivityList from '@/features/activities/components/ActivityList'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export default function StudentActivitiesPage() {
	const router = useRouter()
	const { activities, isLoading, error, filters, setFilters, refresh } = useActivities()

	const handleAdd = useCallback(() => {
		router.push('/student/activities/add')
	}, [router])

	return (
		<div className='space-y-6'>
			<ScrollReveal from='left'>
				<ActivityFilter filters={filters} onChange={setFilters} onRefresh={refresh} onAdd={handleAdd} isRefreshing={isLoading} />
			</ScrollReveal>
			<ScrollReveal from='right'>
				<ActivityList
					activities={activities}
					isLoading={isLoading}
					error={error}
					onRetry={refresh}
					onSelect={(activity) => router.push(`/student/activities/${activity.id}`)}
					onUploadProof={(activity) => router.push(`/student/activities/${activity.id}`)}
				/>
			</ScrollReveal>
		</div>
	)
}
