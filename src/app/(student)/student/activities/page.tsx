"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useActivities from '@/features/activities/hooks/useActivities'
import ActivityFilter from '@/features/activities/components/ActivityFilter'
import ActivityList from '@/features/activities/components/ActivityList'

export default function StudentActivitiesPage() {
	const router = useRouter()
	const { activities, isLoading, error, filters, setFilters, refresh } = useActivities()

	const handleAdd = useCallback(() => {
		router.push('/student/activities/add')
	}, [router])

	return (
		<div className='space-y-6'>
			<ActivityFilter filters={filters} onChange={setFilters} onRefresh={refresh} onAdd={handleAdd} isRefreshing={isLoading} />
			<ActivityList
				activities={activities}
				isLoading={isLoading}
				error={error}
				onRetry={refresh}
				onSelect={(activity) => router.push(`/student/activities/${activity.id}`)}
				onUploadProof={(activity) => router.push(`/student/activities/${activity.id}`)}
			/>
		</div>
	)
}
