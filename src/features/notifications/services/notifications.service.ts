import { ApiResponse } from "@/types"
import {
	NotificationListResponse,
	NotificationQueryFilter,
} from "@/types/notification.types"

export interface NotificationFeedResponse extends NotificationListResponse {
	cursor?: string | null
	unreadCount: number
}

export interface NotificationFetchParams extends NotificationQueryFilter {
	cursor?: string | null
	limit?: number
}

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || "Notification request failed")
	}
	return payload.data as T
}

const buildQuery = (params?: NotificationFetchParams) => {
	const search = new URLSearchParams()
	if (!params) return search.toString()
	if (params.limit) search.set("limit", String(params.limit))
	if (params.cursor) search.set("cursor", params.cursor)
	if (params.unreadOnly) search.set("unreadOnly", "true")
	if (params.excludeArchived) search.set("excludeArchived", "true")
	if (params.types && params.types.length) search.set("types", params.types.join(","))
	if (params.priority) search.set("priority", Array.isArray(params.priority) ? params.priority.join(",") : params.priority)
	if (params.dateRange) {
		search.set("startDate", String(params.dateRange.startDate))
		search.set("endDate", String(params.dateRange.endDate))
	}
	if (params.sortBy) search.set("sortBy", params.sortBy)
	if (params.limit) search.set("limit", String(params.limit))
	if (params.offset) search.set("offset", String(params.offset))
	return search.toString()
}

export const notificationsService = {
	async fetchNotifications(params?: NotificationFetchParams): Promise<NotificationFeedResponse> {
		const query = buildQuery(params)
		const response = await fetch(`/api/notifications${query ? `?${query}` : ""}`, {
			method: "GET",
			credentials: "include",
		})
		return ensureSuccess<NotificationFeedResponse>(response)
	},

	async markAsRead(notificationId: string): Promise<void> {
		const response = await fetch(`/api/notifications/${notificationId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ isRead: true }),
		})
		await ensureSuccess(response)
	},

	async markAllAsRead(): Promise<void> {
		const response = await fetch("/api/notifications/mark-all-read", {
			method: "POST",
			credentials: "include",
		})
		await ensureSuccess(response)
	},

	async dismissNotification(notificationId: string): Promise<void> {
		const response = await fetch(`/api/notifications/${notificationId}`, {
			method: "DELETE",
			credentials: "include",
		})
		await ensureSuccess(response)
	},
}

export default notificationsService
