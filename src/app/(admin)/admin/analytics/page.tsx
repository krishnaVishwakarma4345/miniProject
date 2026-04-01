"use client"

import { useAnalytics } from '@/features/analytics/hooks/useAnalytics'
import MetricCard from '@/features/analytics/components/MetricCard'
import { Alert } from '@/components/feedback/Alert'
import { Select } from '@/components/ui/Select'

export default function AdminAnalyticsPage() {
	const { data, range, isLoading, error, setRange } = useAnalytics(true)

	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-blue-100 bg-linear-to-br from-white to-blue-50 p-8">
				<p className="text-xs uppercase tracking-[0.4em] text-blue-400">Analytics</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Institution health</h1>
				<p className="mt-4 max-w-3xl text-sm text-slate-600">
					Live analytics from your institution database.
				</p>
				<div className="mt-4 max-w-xs">
					<Select
						value={range}
						onChange={(event) => setRange(event.target.value as '7d' | '30d' | '90d')}
						options={[
							{ label: 'Last 7 days', value: '7d' },
							{ label: 'Last 30 days', value: '30d' },
							{ label: 'Last 90 days', value: '90d' },
						]}
					/>
				</div>
			</section>

			{error ? (
				<Alert variant="error" title="Unable to load analytics">
					{error}
				</Alert>
			) : null}

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{(data?.metrics || []).map((metric, index) => (
					<MetricCard key={metric.id} metric={metric} delay={index * 0.06} />
				))}
			</section>

			{isLoading ? (
				<p className="text-sm text-slate-500">Loading analytics...</p>
			) : (
				<section className="grid gap-6 lg:grid-cols-2">
					<article className="rounded-2xl border border-slate-200 bg-white p-6">
						<h2 className="text-lg font-semibold text-slate-900">Top departments</h2>
						<ul className="mt-4 space-y-2 text-sm text-slate-600">
							{(data?.departments || []).slice(0, 6).map((item) => (
								<li key={item.department} className="flex items-center justify-between">
									<span>{item.department}</span>
									<span className="font-semibold text-slate-900">{item.total}</span>
								</li>
							))}
						</ul>
					</article>
					<article className="rounded-2xl border border-slate-200 bg-white p-6">
						<h2 className="text-lg font-semibold text-slate-900">Top students</h2>
						<ul className="mt-4 space-y-2 text-sm text-slate-600">
							{(data?.topStudents || []).map((student) => (
								<li key={student.studentId} className="flex items-center justify-between">
									<span>{student.name}</span>
									<span className="font-semibold text-slate-900">{student.pointsAwarded || 0} pts</span>
								</li>
							))}
						</ul>
					</article>
				</section>
			)}
		</div>
	)
}
