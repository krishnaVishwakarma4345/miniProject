"use client"

import { Alert } from "@/components/feedback/Alert"
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics"
import StudentProgressSection from "@/features/analytics/components/StudentProgressSection"

export default function FacultyStudentProgressPage() {
	const { data, isLoading, error } = useAnalytics(true)

	return (
		<div className="space-y-6 px-4 sm:px-6 lg:px-8">
			<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Faculty workspace</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Student progress</h1>
				<p className="mt-3 max-w-3xl text-sm text-slate-600">
					Review approved activities, open a full student profile, and filter by academic year, semester, division, branch, name, or student ID.
				</p>
			</div>

			{error ? (
				<Alert variant="error" title="Unable to load student progress">
					{error}
				</Alert>
			) : null}

			{isLoading ? (
				<p className="text-sm text-slate-500">Loading student progress...</p>
			) : (
				<StudentProgressSection students={data?.studentProgress || []} />
			)}
		</div>
	)
}