"use client"

import { Alert } from "@/components/feedback/Alert"
import { Select } from "@/components/ui/Select"
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics"
import MetricCard from "@/features/analytics/components/MetricCard"
import MonthlyTrendChart from "@/features/analytics/components/MonthlyTrendChart"
import ParticipationChart from "@/features/analytics/components/ParticipationChart"
import DepartmentBreakdown from "@/features/analytics/components/DepartmentBreakdown"
import ActivityCategoryPieChart from "@/features/analytics/components/ActivityCategoryPieChart"
import { ScrollReveal } from "@/features/landing/components/ScrollReveal"

interface InstitutionAnalyticsDashboardProps {
	title: string
	description: string
	roleLabel: string
}

export function InstitutionAnalyticsDashboard({ title, description, roleLabel }: InstitutionAnalyticsDashboardProps) {
	const { data, range, isLoading, error, setRange } = useAnalytics(true)

	return (
		<div className="space-y-8">
			<ScrollReveal from="left">
				<section className="rounded-3xl border border-blue-100 bg-linear-to-br from-white to-blue-50 p-8">
					<p className="text-xs uppercase tracking-[0.4em] text-blue-400">Analytics</p>
					<h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
					<p className="mt-4 max-w-3xl text-sm text-slate-600">{description}</p>
					<div className="mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
						<Select
							value={range}
							onChange={(event) => setRange(event.target.value as "7d" | "30d" | "90d")}
							options={[
								{ label: "Last 7 days", value: "7d" },
								{ label: "Last 30 days", value: "30d" },
								{ label: "Last 90 days", value: "90d" },
							]}
						/>
						<div className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-700">
							<p className="font-semibold">Access scope</p>
							<p>{roleLabel}</p>
						</div>
					</div>
				</section>
			</ScrollReveal>

			{error ? (
				<Alert variant="error" title="Unable to load analytics">
					{error}
				</Alert>
			) : null}

			<ScrollReveal from="right">
				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{(data?.metrics || []).map((metric, index) => (
						<MetricCard key={metric.id} metric={metric} delay={index * 0.06} />
					))}
				</section>
			</ScrollReveal>

			{isLoading ? (
				<p className="text-sm text-slate-500">Loading analytics...</p>
			) : (
				<>
					<ScrollReveal from="left">
						<section className="grid gap-6 xl:grid-cols-2">
							<ParticipationChart data={data?.participation || []} title="Submission activity" />
							<ActivityCategoryPieChart data={data?.categories || []} />
						</section>
					</ScrollReveal>

					<ScrollReveal from="right">
						<section className="grid gap-6 xl:grid-cols-2">
							<MonthlyTrendChart data={data?.trend || []} />
							<DepartmentBreakdown data={(data?.departments || []).slice(0, 8)} />
						</section>
					</ScrollReveal>

				</>
			)}
		</div>
	)
}

export default InstitutionAnalyticsDashboard