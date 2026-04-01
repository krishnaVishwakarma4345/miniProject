"use client"

import { useEffect, useMemo, useState } from "react"
import { Alert } from "@/components/feedback/Alert"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CATEGORY_LABELS } from "@/constants/activityCategories"
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics"
import MetricCard from "@/features/analytics/components/MetricCard"
import MonthlyTrendChart from "@/features/analytics/components/MonthlyTrendChart"
import ParticipationChart from "@/features/analytics/components/ParticipationChart"
import DepartmentBreakdown from "@/features/analytics/components/DepartmentBreakdown"
import ActivityCategoryPieChart from "@/features/analytics/components/ActivityCategoryPieChart"
import { StudentProgressDatum } from "@/features/analytics/types/analytics.types"

type SortField = "submissions" | "credits"
type SortOrder = "asc" | "desc"
const PAGE_SIZE = 10

interface InstitutionAnalyticsDashboardProps {
	title: string
	description: string
	roleLabel: string
}

const statusLabel = (value: string) => value.replace(/_/g, " ")

export function InstitutionAnalyticsDashboard({ title, description, roleLabel }: InstitutionAnalyticsDashboardProps) {
	const { data, range, isLoading, error, setRange } = useAnalytics(true)
	const [search, setSearch] = useState("")
	const [sortField, setSortField] = useState<SortField>("submissions")
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
	const [page, setPage] = useState(1)
	const [activeStudent, setActiveStudent] = useState<StudentProgressDatum | null>(null)

	const filteredStudents = useMemo(() => {
		const students = data?.studentProgress || []
		const normalizedSearch = search.trim().toLowerCase()
		const visible = normalizedSearch
			? students.filter((student) =>
					student.name.toLowerCase().includes(normalizedSearch) ||
					(student.department || "").toLowerCase().includes(normalizedSearch)
				)
			: students

		return [...visible].sort((a, b) => {
			const left = sortField === "submissions" ? a.totalSubmissions : a.totalCredits
			const right = sortField === "submissions" ? b.totalSubmissions : b.totalCredits
			if (sortOrder === "asc") {
				return left - right
			}
			return right - left
		})
	}, [data?.studentProgress, search, sortField, sortOrder])

	const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))

	const pagedStudents = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE
		return filteredStudents.slice(start, start + PAGE_SIZE)
	}, [filteredStudents, page])

	useEffect(() => {
		setPage(1)
	}, [search, sortField, sortOrder])

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages)
		}
	}, [page, totalPages])

	const handleExportCsv = () => {
		const headers = ["Student Name", "Department", "Submissions", "Credits Earned"]
		const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
		const rows = filteredStudents.map((student) => [
			escape(student.name),
			escape(student.department || "General"),
			escape(student.totalSubmissions),
			escape(student.totalCredits),
		])

		const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `students-progress-${Date.now()}.csv`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	return (
		<div className="space-y-8">
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
				<>
					<section className="grid gap-6 xl:grid-cols-2">
						<ParticipationChart data={data?.participation || []} title="Submission activity" />
						<ActivityCategoryPieChart data={data?.categories || []} />
					</section>

					<section className="grid gap-6 xl:grid-cols-2">
						<MonthlyTrendChart data={data?.trend || []} />
						<DepartmentBreakdown data={(data?.departments || []).slice(0, 8)} />
					</section>

					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-slate-900">Students progress</h2>
								<p className="text-sm text-slate-500">All students who have uploaded activities in your institution.</p>
							</div>
							<div className="grid gap-3 md:grid-cols-4">
								<Input
									placeholder="Search student or department"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
								/>
								<Select
									value={sortField}
									onChange={(event) => setSortField(event.target.value as SortField)}
									options={[
										{ label: "Sort: Submissions", value: "submissions" },
										{ label: "Sort: Credits", value: "credits" },
									]}
								/>
								<Select
									value={sortOrder}
									onChange={(event) => setSortOrder(event.target.value as SortOrder)}
									options={[
										{ label: "Descending", value: "desc" },
										{ label: "Ascending", value: "asc" },
									]}
								/>
								<Button variant="outline" onClick={handleExportCsv} disabled={!filteredStudents.length}>
									Export CSV
								</Button>
							</div>
						</div>

						<div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
							<table className="w-full min-w-full text-left text-sm">
								<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
									<tr>
										<th className="px-4 py-3">Student</th>
										<th className="px-4 py-3">Department</th>
										<th className="px-4 py-3">Submissions</th>
										<th className="px-4 py-3">Credits earned</th>
										<th className="px-4 py-3 text-right">Details</th>
									</tr>
								</thead>
								<tbody>
									{pagedStudents.map((student) => (
										<tr key={student.studentId} className="border-t border-slate-100 bg-white">
											<td className="px-4 py-3 font-semibold text-slate-900">{student.name}</td>
											<td className="px-4 py-3 text-slate-600">{student.department || "General"}</td>
											<td className="px-4 py-3 text-slate-700">{student.totalSubmissions}</td>
											<td className="px-4 py-3 text-slate-700">{student.totalCredits}</td>
											<td className="px-4 py-3 text-right">
												<Button size="sm" variant="outline" onClick={() => setActiveStudent(student)}>
													View submissions
												</Button>
											</td>
										</tr>
									))}
									{!pagedStudents.length ? (
										<tr>
											<td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
												No students match the current filters.
											</td>
										</tr>
									) : null}
								</tbody>
							</table>
						</div>

						<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-slate-500">
								Showing {filteredStudents.length ? (page - 1) * PAGE_SIZE + 1 : 0} to{" "}
								{Math.min(page * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}
							</p>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
									Previous
								</Button>
								<span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
									disabled={page === totalPages}
								>
									Next
								</Button>
							</div>
						</div>
					</section>
				</>
			)}

			<Modal
				open={Boolean(activeStudent)}
				onClose={() => setActiveStudent(null)}
				title={activeStudent ? `${activeStudent.name} submissions` : "Student submissions"}
				footer={
					<Button variant="outline" onClick={() => setActiveStudent(null)}>
						Close
					</Button>
				}
			>
				{activeStudent ? (
					<div className="space-y-4">
						<p className="text-sm text-slate-600">
							Total submissions: <span className="font-semibold text-slate-900">{activeStudent.totalSubmissions}</span>
							 {" | "}
							 Credits earned: <span className="font-semibold text-slate-900">{activeStudent.totalCredits}</span>
						</p>
						<div className="max-h-96 overflow-y-auto rounded-xl border border-slate-100">
							<table className="w-full text-left text-sm">
								<thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
									<tr>
										<th className="px-3 py-2">Title</th>
										<th className="px-3 py-2">Category</th>
										<th className="px-3 py-2">Status</th>
										<th className="px-3 py-2">Credits</th>
										<th className="px-3 py-2">Date</th>
									</tr>
								</thead>
								<tbody>
									{activeStudent.submissions.map((submission) => (
										<tr key={submission.activityId} className="border-t border-slate-100">
											<td className="px-3 py-2 text-slate-900">{submission.title}</td>
											<td className="px-3 py-2 text-slate-600">{CATEGORY_LABELS[submission.category]}</td>
											<td className="px-3 py-2 text-slate-600">{statusLabel(submission.status)}</td>
											<td className="px-3 py-2 text-slate-700">{submission.pointsAwarded}</td>
											<td className="px-3 py-2 text-slate-600">{new Date(submission.createdAt).toLocaleDateString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : null}
			</Modal>
		</div>
	)
}

export default InstitutionAnalyticsDashboard
