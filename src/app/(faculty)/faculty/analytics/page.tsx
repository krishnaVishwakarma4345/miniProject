"use client"

import InstitutionAnalyticsDashboard from "@/features/analytics/components/InstitutionAnalyticsDashboard"

export default function FacultyAnalyticsPage() {
	return (
		<InstitutionAnalyticsDashboard
			title="Institution analytics"
			description="Track submissions with visual graphs and category breakdowns for your college."
			roleLabel="Faculty access: all students in your college"
		/>
	)
}
