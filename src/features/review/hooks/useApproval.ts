'use client'

import { useCallback, useState } from 'react'
import { Activity } from '@/types'
import reviewService from '@/features/review/services/review.service'
import { useReviewStore } from '@/store/review.store'

export function useApproval() {
	const {
		selectedIds,
		removeActivities,
		updateActivity,
		clearSelection,
		setActioning,
		setError,
	} = useReviewStore()
	const [isProcessing, setIsProcessing] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const runAction = useCallback(async (action: () => Promise<void>) => {
		setIsProcessing(true)
		setActioning(true)
		setError(null)
		setErrorMessage(null)
		try {
			await action()
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Action failed'
			setError(message)
			setErrorMessage(message)
			throw error
		} finally {
			setIsProcessing(false)
			setActioning(false)
		}
	}, [setActioning, setError])

	const approve = useCallback(
		(activityId: string, options?: { remarks?: string; pointsAwarded?: number; score?: number }) =>
			runAction(async () => {
				const updated = await reviewService.approveActivity(activityId, options)
				if (updated) {
					removeActivities([activityId])
				}
			}),
		[removeActivities, runAction]
	)

	const reject = useCallback(
		(activityId: string, remarks: string) =>
			runAction(async () => {
				const updated = await reviewService.rejectActivity(activityId, remarks)
				if (updated) {
					removeActivities([activityId])
				}
			}),
		[removeActivities, runAction]
	)

	const bulkApprove = useCallback(
		(activityIds: string[], options?: { remarks?: string; pointsAwarded?: number; score?: number }) =>
			runAction(async () => {
				await Promise.all(activityIds.map((id) => reviewService.approveActivity(id, options)))
				removeActivities(activityIds)
				clearSelection()
			}),
		[clearSelection, removeActivities, runAction]
	)

	const bulkReject = useCallback(
		(activityIds: string[], remarks: string) =>
			runAction(async () => {
				await Promise.all(activityIds.map((id) => reviewService.rejectActivity(id, remarks)))
				removeActivities(activityIds)
				clearSelection()
			}),
		[clearSelection, removeActivities, runAction]
	)

	const assignToMe = useCallback(
		(activityIds: string[]) =>
			runAction(async () => {
				const payload = await reviewService.assignActivities(activityIds)
				const updatedActivities = Array.isArray(payload) ? payload : payload ? [payload] : []
				updatedActivities.forEach((activity) => updateActivity(activity as Activity))
			}),
		[runAction, updateActivity]
	)

	return {
		selectedIds,
		isProcessing,
		errorMessage,
		approve,
		reject,
		bulkApprove,
		bulkReject,
		assignToMe,
	}
}

export default useApproval
