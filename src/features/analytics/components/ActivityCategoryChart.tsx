"use client"

import { motion } from "framer-motion"
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/constants/activityCategories"
import { CategoryDistributionDatum } from "@/features/analytics/types/analytics.types"

export interface ActivityCategoryChartProps {
	data: CategoryDistributionDatum[]
}

export function ActivityCategoryChart({ data }: ActivityCategoryChartProps) {
	const total = data.reduce((sum, item) => sum + item.count, 0) || 1

	return (
		<section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
			<h3 className="text-lg font-semibold text-slate-900">Activity mix</h3>
			<p className="text-sm text-slate-500">Distribution by category</p>
			<div className="mt-5 space-y-4">
				{data.map((item) => {
					const percent = Math.round((item.count / total) * 100)
					return (
						<div key={item.category}>
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] }} />
									<span className="font-semibold text-slate-700">{CATEGORY_LABELS[item.category]}</span>
								</div>
								<span className="text-slate-500">{percent}%</span>
							</div>
							<div className="mt-2 h-2 rounded-full bg-slate-100">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${percent}%` }}
									transition={{ duration: 0.8, ease: "easeOut" }}
									className="h-2 rounded-full"
									style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
								/>
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}

export default ActivityCategoryChart
