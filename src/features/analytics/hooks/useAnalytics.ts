"use client"

import { useCallback, useEffect } from "react"
import { useAdminStore } from "@/store/admin.store"
import analyticsService from "@/features/analytics/services/analytics.service"
import { AnalyticsRange } from "@/features/analytics/types/analytics.types"

export function useAnalytics(auto = true) {
	const {
		analytics,
		setAnalyticsRange,
		setAnalyticsLoading,
		setAnalyticsData,
		setAnalyticsError,
	} = useAdminStore()

	const fetchAnalytics = useCallback(
		async (range: AnalyticsRange = analytics.range) => {
			setAnalyticsLoading(true)
			setAnalyticsError(null)
			try {
				const data = await analyticsService.fetchOverview(range)
				setAnalyticsData(data)
			} catch (error) {
				setAnalyticsError(error instanceof Error ? error.message : "Unable to load analytics")
			} finally {
				setAnalyticsLoading(false)
			}
		},
		[analytics.range, setAnalyticsData, setAnalyticsError, setAnalyticsLoading]
	)

	useEffect(() => {
		if (!auto) return
		void fetchAnalytics()
	}, [auto, fetchAnalytics])

	return {
		data: analytics.data,
		range: analytics.range,
		isLoading: analytics.isLoading,
		error: analytics.error,
		setRange: (range: AnalyticsRange) => {
			setAnalyticsRange(range)
			void fetchAnalytics(range)
		},
		refresh: () => fetchAnalytics(),
	}
}

export default useAnalytics
