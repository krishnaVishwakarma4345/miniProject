"use client"

import { motion } from "framer-motion"
import { DepartmentBreakdownDatum } from "@/features/analytics/types/analytics.types"

export interface DepartmentBreakdownProps {
	data: DepartmentBreakdownDatum[]
}

export function DepartmentBreakdown({ data }: DepartmentBreakdownProps) {
	const max = Math.max(...data.map((item) => item.total), 1)

	return (
		<section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
			<h3 className="text-lg font-semibold text-slate-900">Department breakdown</h3>
			<p className="text-sm text-slate-500">Engagement by department</p>
			<div className="mt-5 space-y-4">
				{data.map((item, index) => (
					<div key={item.department} className="space-y-1">
						<div className="flex items-center justify-between text-sm text-slate-600">
							<span className="font-semibold text-slate-800">{item.department}</span>
							<span>{item.total} activities</span>
						</div>
						<div className="h-2 rounded-full bg-slate-100">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${(item.total / max) * 100}%` }}
								transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
								className="h-2 rounded-full bg-slate-900/80"
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

export default DepartmentBreakdown
