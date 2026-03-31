"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { AnalyticsMetric } from "@/features/analytics/types/analytics.types"

export interface MetricCardProps {
	metric: AnalyticsMetric
	delay?: number
}

export function MetricCard({ metric, delay = 0 }: MetricCardProps) {
	const value = useMotionValue(0)
	const rounded = useTransform(value, (latest) => Math.round(latest).toLocaleString())

	useEffect(() => {
		const controls = animate(value, metric.value, {
			duration: 1.1,
			delay,
			ease: "easeOut",
		})
		return controls.stop
	}, [delay, metric.value, value])

	const deltaColor = metric.positive ? "text-emerald-600" : "text-rose-600"

	return (
		<motion.article
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.35 }}
			className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm"
		>
			<p className="text-sm font-medium text-slate-500">{metric.label}</p>
			<p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
				<motion.span>{rounded}</motion.span>
				{metric.suffix}
			</p>
			{metric.delta !== undefined ? (
				<p className={`mt-1 text-xs font-semibold ${deltaColor}`}>
					{metric.positive ? "↑" : "↓"} {Math.abs(metric.delta).toFixed(1)}% {metric.trendLabel || "vs last period"}
				</p>
			) : null}
		</motion.article>
	)
}

export default MetricCard
