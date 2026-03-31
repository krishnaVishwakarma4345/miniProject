import { Activity, ApiResponse } from '@/types'
import { ReviewQueueData, ReviewQueueFilters } from '@/features/review/types/review.types'

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || 'Request failed')
	}
	return payload.data as T
}

const buildQuery = (filters?: Partial<ReviewQueueFilters> & { pageSize?: number }) => {
	const params = new URLSearchParams()
	if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
	if (filters?.category && filters.category !== 'all') params.set('category', filters.category)
	if (filters?.assignment && filters.assignment !== 'all') params.set('assignment', filters.assignment)
	if (filters?.search) params.set('search', filters.search)
	if (filters?.pageSize) params.set('pageSize', String(filters.pageSize))
	return params.toString()
}

export const reviewService = {
	async fetchQueue(filters?: Partial<ReviewQueueFilters> & { pageSize?: number }): Promise<ReviewQueueData> {
		const query = buildQuery(filters)
		const response = await fetch(`/api/activity/review${query ? `?${query}` : ''}`, {
			method: 'GET',
			credentials: 'include',
		})

		return ensureSuccess<ReviewQueueData>(response)
	},

	async approveActivity(activityId: string, options?: { remarks?: string; pointsAwarded?: number; score?: number }): Promise<Activity | null> {
		const response = await fetch('/api/activity/approve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				activityId,
				remarks: options?.remarks,
				pointsAwarded: options?.pointsAwarded,
				score: options?.score,
			}),
		})

		return ensureSuccess<Activity | null>(response)
	},

	async rejectActivity(activityId: string, remarks: string): Promise<Activity | null> {
		const response = await fetch('/api/activity/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ activityId, remarks }),
		})

		return ensureSuccess<Activity | null>(response)
	},

	async assignActivities(activityIds: string[], assigneeId?: string): Promise<Activity | Activity[] | null> {
		const response = await fetch('/api/activity/assign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ activityIds, assigneeId }),
		})

		return ensureSuccess<Activity | Activity[] | null>(response)
	},
}

export default reviewService
