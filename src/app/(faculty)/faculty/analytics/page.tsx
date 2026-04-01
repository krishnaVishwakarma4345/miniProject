"use client"

import InstitutionAnalyticsDashboard from "@/features/analytics/components/InstitutionAnalyticsDashboard"

export default function FacultyAnalyticsPage() {
	return (
		<InstitutionAnalyticsDashboard
			title="Institution analytics"
			description="Track submissions with visual graphs, category pie chart, and student progress drill-down for your college."
			roleLabel="Faculty access: all students in your college"
		/>
	)
}
