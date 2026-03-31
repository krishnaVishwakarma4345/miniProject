"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TopStudentDatum } from "@/features/analytics/types/analytics.types"

export interface TopStudentsTableProps {
  data: TopStudentDatum[]
}

export function TopStudentsTable({ data }: TopStudentsTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Top performers</h3>
      <p className="text-sm text-slate-500">Based on approved activities</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3 text-right">Profile</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, index) => (
              <motion.tr
                key={student.studentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-slate-100 bg-white/95"
              >
                <td className="px-4 py-3 font-semibold text-slate-900">{student.name}</td>
                <td className="px-4 py-3 text-slate-600">{student.department || "—"}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{student.approved}</td>
                <td className="px-4 py-3 text-slate-600">{student.pointsAwarded ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/student/portfolio/${student.studentId}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View →
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TopStudentsTable
