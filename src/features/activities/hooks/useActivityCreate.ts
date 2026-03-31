'use client'

import { useState } from 'react'
import { ActivityCreateRequest } from '@/types'
import activitiesService from '@/features/activities/services/activities.service'

export function useActivityCreate() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createActivity = async (payload: ActivityCreateRequest) => {
		setIsSubmitting(true)
		setError(null)
		try {
			return await activitiesService.createActivity(payload)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unable to create activity'
			setError(message)
			throw err
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		createActivity,
		isSubmitting,
		error,
	}
}

export default useActivityCreate
