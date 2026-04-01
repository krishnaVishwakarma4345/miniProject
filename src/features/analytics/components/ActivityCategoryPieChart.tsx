"use client"

import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/constants/activityCategories"
import { CategoryDistributionDatum } from "@/features/analytics/types/analytics.types"

interface ActivityCategoryPieChartProps {
	data: CategoryDistributionDatum[]
}

const buildConicStops = (data: CategoryDistributionDatum[]) => {
	const total = data.reduce((sum, item) => sum + item.count, 0)
	if (!total) {
		return "#e2e8f0 0% 100%"
	}

	let cursor = 0
	const stops: string[] = []
	for (const item of data) {
		const slice = (item.count / total) * 100
		const start = cursor
		const end = cursor + slice
		stops.push(`${CATEGORY_COLORS[item.category]} ${start}% ${end}%`)
		cursor = end
	}
	return stops.join(", ")
}

export function ActivityCategoryPieChart({ data }: ActivityCategoryPieChartProps) {
	const total = data.reduce((sum, item) => sum + item.count, 0)
	const gradient = buildConicStops(data)

	return (
		<section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
			<h3 className="text-lg font-semibold text-slate-900">Category split</h3>
			<p className="text-sm text-slate-500">Pie chart of institution submissions</p>

			<div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
				<div className="mx-auto grid h-52 w-52 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
					<div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center shadow-inner">
						<p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
						<p className="text-2xl font-semibold text-slate-900">{total}</p>
					</div>
				</div>

				<ul className="flex-1 space-y-2">
					{data.map((item) => {
						const percentage = total ? Math.round((item.count / total) * 100) : 0
						return (
							<li key={item.category} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
								<div className="flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] }} />
									<span className="font-medium text-slate-700">{CATEGORY_LABELS[item.category]}</span>
								</div>
								<span className="font-semibold text-slate-900">{item.count} ({percentage}%)</span>
							</li>
						)
					})}
				</ul>
			</div>
		</section>
	)
}

export default ActivityCategoryPieChart
