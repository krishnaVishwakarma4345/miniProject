"use client"

import { motion } from "framer-motion"
import { MonthlyTrendDatum } from "@/features/analytics/types/analytics.types"

export interface MonthlyTrendChartProps {
  data: MonthlyTrendDatum[]
}

const buildPoints = (data: MonthlyTrendDatum[], key: "submitted" | "approved", maxValue: number) => {
  if (data.length <= 1) {
    return "0,100 100,100"
  }
  return data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const value = item[key]
      const y = 100 - (value / maxValue) * 100
      return `${x},${y}`
    })
    .join(" ")
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.submitted, item.approved]),
    1
  )

  const submittedPoints = buildPoints(data, "submitted", maxValue)
  const approvedPoints = buildPoints(data, "approved", maxValue)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Monthly trend</h3>
          <p className="text-sm text-slate-500">Submissions vs approvals</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" />Submitted</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Approved</span>
        </div>
      </div>
      <div className="mt-4 h-64">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <polyline
            points="0,100 100,100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={0.5}
            strokeDasharray="2 4"
          />
          <motion.polyline
            points={submittedPoints}
            fill="none"
            stroke="#0f172a"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.polyline
            points={approvedPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.15 }}
          />
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500">
        {data.map((item) => (
          <div key={item.label}>
            <p className="font-semibold text-slate-700">{item.label}</p>
            <p>Submitted: {item.submitted}</p>
            <p>Approved: {item.approved}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MonthlyTrendChart
