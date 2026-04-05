"use client"

import InstitutionAnalyticsDashboard from "@/features/analytics/components/InstitutionAnalyticsDashboard"

export default function AdminAnalyticsPage() {
	return (
		<InstitutionAnalyticsDashboard
			title="Institution health"
			description="Visual analytics and category breakdowns for all institution submissions."
			roleLabel="Administrator access: all students in your college"
		/>
	)
}
