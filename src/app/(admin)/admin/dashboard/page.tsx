"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/data-display/StatCard'
import { Alert } from '@/components/feedback/Alert'
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics'

export default function AdminDashboardPage() {
	const { data, error, isLoading } = useAnalytics(true)
	const metrics = data?.metrics || []

	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin control</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Operations overview</h1>
				<p className="mt-3 max-w-2xl text-sm text-slate-600">
					Institution-scoped live data from Firestore.
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link href="/admin/analytics">
						<Button variant="outline">View analytics</Button>
					</Link>
					<Link href="/admin/reports">
						<Button>Generate report</Button>
					</Link>
				</div>
			</section>

			{error ? (
				<Alert variant="error" title="Unable to load dashboard metrics">
					{error}
				</Alert>
			) : null}

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metrics.map((stat) => (
					<StatCard key={stat.id} label={stat.label} value={stat.value} suffix={stat.suffix} />
				))}
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-2xl border border-slate-200 bg-white p-6">
					<h2 className="text-lg font-semibold text-slate-900">Review pipeline snapshot</h2>
					<ul className="mt-4 space-y-3 text-sm text-slate-600">
						{metrics.map((metric) => (
							<li key={metric.id} className="flex items-center justify-between">
								<span>{metric.label}</span>
								<span className="font-semibold text-slate-900">{metric.value}{metric.suffix || ''}</span>
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-white p-6">
					<h2 className="text-lg font-semibold text-slate-900">Status</h2>
					<p className="mt-4 text-sm text-slate-600">
						{isLoading ? 'Refreshing metrics from database...' : 'Metrics are synced with live Firestore data.'}
					</p>
				</div>
			</section>
		</div>
	)
}
