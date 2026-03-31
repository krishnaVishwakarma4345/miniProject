"use client"

import { motion } from "framer-motion"
import { ParticipationDatum } from "@/features/analytics/types/analytics.types"

export interface ParticipationChartProps {
	data: ParticipationDatum[]
	title?: string
}

export function ParticipationChart({ data, title = "Participation" }: ParticipationChartProps) {
	const max = Math.max(...data.map((item) => item.value), 1)

	return (
		<section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-slate-900">{title}</h3>
					<p className="text-sm text-slate-500">Weekly submissions</p>
				</div>
			</div>
			<div className="mt-6 grid grid-cols-7 gap-3">
				{data.map((item) => (
					<div key={item.label} className="flex flex-col items-center gap-2">
						<motion.div
							initial={{ scaleY: 0 }}
							animate={{ scaleY: item.value / max }}
							transition={{ duration: 0.8, ease: "easeOut" }}
							className="relative h-40 w-full origin-bottom rounded-full bg-slate-100"
						>
							<span
								className="absolute inset-x-0 bottom-0 mx-auto block w-3/5 rounded-full bg-slate-900/80"
								style={{ height: `${(item.value / max) * 100}%` }}
							/>
						</motion.div>
						<span className="text-xs font-semibold text-slate-500">{item.label}</span>
						<span className="text-sm font-semibold text-slate-900">{item.value}</span>
					</div>
				))}
			</div>
		</section>
	)
}

export default ParticipationChart
