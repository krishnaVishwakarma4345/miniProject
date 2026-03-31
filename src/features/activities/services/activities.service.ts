import { Activity, ActivityCreateRequest, ActivityStatus, ApiResponse } from '@/types'

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || 'Request failed')
	}
	return payload.data as T
}

export interface ActivitiesQuery {
	studentId?: string
	pageSize?: number
	status?: ActivityStatus
}

export const activitiesService = {
	async listStudentActivities(query: ActivitiesQuery = {}): Promise<Activity[]> {
		const params = new URLSearchParams()
		if (query.studentId) params.set('studentId', query.studentId)
		if (query.pageSize) params.set('pageSize', String(query.pageSize))
		if (query.status) params.set('status', query.status)

		const response = await fetch(`/api/activity/student?${params.toString()}`, {
			method: 'GET',
			credentials: 'include',
		})

		return ensureSuccess<Activity[]>(response)
	},

	async createActivity(payload: ActivityCreateRequest): Promise<{ id: string }> {
		const response = await fetch('/api/activity/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(payload),
		})

		return ensureSuccess<{ id: string }>(response)
	},

	async updateActivity(activityId: string, updates: Partial<Activity>): Promise<Activity> {
		const response = await fetch('/api/activity/update', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ activityId, updates }),
		})

		return ensureSuccess<Activity>(response)
	},

	async updateStatus(activityId: string, status: ActivityStatus, remarks?: string): Promise<Activity> {
		const response = await fetch('/api/activity/update', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ activityId, status, remarks }),
		})

		return ensureSuccess<Activity>(response)
	},
}

export default activitiesService
