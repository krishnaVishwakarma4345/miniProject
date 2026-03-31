'use client'

import { useState } from 'react'
import { ActivityStatus } from '@/types'
import activitiesService from '@/features/activities/services/activities.service'

export function useActivityStatus() {
	const [isUpdating, setIsUpdating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const updateStatus = async (activityId: string, status: ActivityStatus, remarks?: string) => {
		setIsUpdating(true)
		setError(null)
		try {
			return await activitiesService.updateStatus(activityId, status, remarks)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update status')
			throw err
		} finally {
			setIsUpdating(false)
		}
	}

	return {
		updateStatus,
		isUpdating,
		error,
	}
}

export default useActivityStatus
