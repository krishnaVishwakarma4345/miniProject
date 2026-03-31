import { ApiResponse } from "@/types"
import {
	AnalyticsOverview,
	AnalyticsRange,
} from "@/features/analytics/types/analytics.types"

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || "Request failed")
	}
	return payload.data as T
}

export const analyticsService = {
	async fetchOverview(range: AnalyticsRange = "30d"): Promise<AnalyticsOverview> {
		const params = new URLSearchParams({ range })
		const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
			method: "GET",
			credentials: "include",
		})
		return ensureSuccess<AnalyticsOverview>(response)
	},
}

export default analyticsService
