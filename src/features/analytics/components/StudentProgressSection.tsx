"use client"

import { useEffect, useMemo, useState } from "react"
import { CATEGORY_LABELS } from "@/constants/activityCategories"
import { ACADEMIC_YEAR_OPTIONS, BRANCH_OPTIONS, DIVISION_OPTIONS, SEMESTER_OPTIONS } from "@/constants/filterOptions"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Select } from "@/components/ui/Select"
import { ScrollReveal } from "@/features/landing/components/ScrollReveal"
import { StudentProgressDatum } from "@/features/analytics/types/analytics.types"

type SortField = "approvedActivities" | "totalCredits"
type SortOrder = "asc" | "desc"

const PAGE_SIZE = 10
const ALL_VALUE = "all"

const statusLabel = (value: string) => value.replace(/_/g, " ")

const formatAcademicYear = (student: StudentProgressDatum) => {
	const academicYear = student.studentProfile?.academicYear ?? student.studentProfile?.year
	return academicYear ? `Year ${academicYear}` : "Not added yet"
}

const formatSemester = (student: StudentProgressDatum) => {
	const semester = student.studentProfile?.semester
	return semester ? `Sem ${semester}` : "Not added yet"
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
			<p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
			<p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
		</div>
	)
}

interface StudentProgressSectionProps {
	students: StudentProgressDatum[]
}

export function StudentProgressSection({ students }: StudentProgressSectionProps) {
	const [search, setSearch] = useState("")
	const [yearFilter, setYearFilter] = useState(ALL_VALUE)
	const [semesterFilter, setSemesterFilter] = useState(ALL_VALUE)
	const [divisionFilter, setDivisionFilter] = useState(ALL_VALUE)
	const [branchFilter, setBranchFilter] = useState(ALL_VALUE)
	const [sortField, setSortField] = useState<SortField>("approvedActivities")
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
	const [page, setPage] = useState(1)
	const [activeStudent, setActiveStudent] = useState<StudentProgressDatum | null>(null)

	const filteredStudents = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase()

		return students
			.filter((student) => {
				if (student.approvedActivities <= 0) {
					return false
				}

				const profile = student.studentProfile
				const academicYear = profile?.academicYear ?? profile?.year
				const semester = profile?.semester
				const division = profile?.division?.trim().toLowerCase() || ""
				const branch = profile?.branch?.trim().toLowerCase() || ""

				const matchesSearch = !normalizedSearch
					|| [
						student.name,
						student.studentId,
						student.email,
						profile?.studentId,
						profile?.rollNo,
						profile?.department,
					].some((value) => String(value || "").toLowerCase().includes(normalizedSearch))

				const matchesYear = yearFilter === ALL_VALUE || String(academicYear || "") === yearFilter
				const matchesSemester = semesterFilter === ALL_VALUE || String(semester || "") === semesterFilter
				const matchesDivision = divisionFilter === ALL_VALUE || division === divisionFilter.toLowerCase()
				const matchesBranch = branchFilter === ALL_VALUE || branch === branchFilter.toLowerCase()

				return matchesSearch && matchesYear && matchesSemester && matchesDivision && matchesBranch
			})
			.sort((left, right) => {
				const leftValue = sortField === "approvedActivities" ? left.approvedActivities : left.totalCredits
				const rightValue = sortField === "approvedActivities" ? right.approvedActivities : right.totalCredits
				return sortOrder === "asc" ? leftValue - rightValue : rightValue - leftValue
			})
	}, [branchFilter, divisionFilter, semesterFilter, search, sortField, sortOrder, students, yearFilter])

	useEffect(() => {
		setPage(1)
	}, [branchFilter, divisionFilter, semesterFilter, search, sortField, sortOrder, yearFilter])

	const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
	const currentPage = Math.min(page, totalPages)

	const pagedStudents = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE
		return filteredStudents.slice(start, start + PAGE_SIZE)
	}, [currentPage, filteredStudents])

	const handleExportCsv = () => {
		const headers = ["Student Name", "Student ID", "Academic Year", "Semester", "Division", "Branch", "Approved Activities", "Credits Earned"]
		const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
		const rows = filteredStudents.map((student) => [
			escape(student.name),
			escape(student.studentProfile?.studentId || student.studentId),
			escape(student.studentProfile?.academicYear ?? student.studentProfile?.year ?? ""),
			escape(student.studentProfile?.semester || ""),
			escape(student.studentProfile?.division || ""),
			escape(student.studentProfile?.branch || ""),
			escape(student.approvedActivities),
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
		<ScrollReveal from="left">
			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h2 className="text-xl font-semibold text-slate-900">Students progress</h2>
						<p className="text-sm text-slate-500">Filter approved activities by academic year, semester, division, branch, or student identity.</p>
					</div>
					<div className="grid gap-3 xl:grid-cols-4">
						<Input
							placeholder="Search name, student ID, or roll number"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<Select
							value={yearFilter}
							onChange={(event) => setYearFilter(event.target.value)}
							options={[
								{ label: "All academic years", value: ALL_VALUE },
								...ACADEMIC_YEAR_OPTIONS.map((year) => ({ label: `Year ${year}`, value: String(year) })),
							]}
						/>
						<Select
							value={semesterFilter}
							onChange={(event) => setSemesterFilter(event.target.value)}
							options={[
								{ label: "All semesters", value: ALL_VALUE },
								...SEMESTER_OPTIONS.map((semester) => ({ label: `Sem ${semester}`, value: String(semester) })),
							]}
						/>
						<Select
							value={divisionFilter}
							onChange={(event) => setDivisionFilter(event.target.value)}
							options={[
								{ label: "All divisions", value: ALL_VALUE },
								...DIVISION_OPTIONS.map((division) => ({ label: `Div ${division}`, value: division })),
							]}
						/>
						<Select
							value={branchFilter}
							onChange={(event) => setBranchFilter(event.target.value)}
							options={[
								{ label: "All branches", value: ALL_VALUE },
								...BRANCH_OPTIONS.map((branch) => ({ label: branch, value: branch })),
							]}
						/>
						<Select
							value={sortField}
							onChange={(event) => setSortField(event.target.value as SortField)}
							options={[
								{ label: "Sort: Approved activities", value: "approvedActivities" },
								{ label: "Sort: Credits earned", value: "totalCredits" },
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
								<th className="px-4 py-3">Academic year</th>
								<th className="px-4 py-3">Semester</th>
								<th className="px-4 py-3">Division</th>
								<th className="px-4 py-3">Branch</th>
								<th className="px-4 py-3">Approved activities</th>
								<th className="px-4 py-3">Credits earned</th>
								<th className="px-4 py-3 text-right">Details</th>
							</tr>
						</thead>
						<tbody>
							{pagedStudents.map((student) => (
								<tr key={student.studentId} className="border-t border-slate-100 bg-white">
									<td className="px-4 py-3">
										<button type="button" className="text-left font-semibold text-slate-900 hover:underline" onClick={() => setActiveStudent(student)}>
											{student.name}
										</button>
										<p className="mt-1 text-xs text-slate-500">ID: {student.studentProfile?.studentId || student.studentId}</p>
									</td>
									<td className="px-4 py-3 text-slate-600">{formatAcademicYear(student)}</td>
									<td className="px-4 py-3 text-slate-600">{formatSemester(student)}</td>
									<td className="px-4 py-3 text-slate-600">{student.studentProfile?.division || "Not added yet"}</td>
									<td className="px-4 py-3 text-slate-600">{student.studentProfile?.branch || "Not added yet"}</td>
									<td className="px-4 py-3 text-slate-700">{student.approvedActivities}</td>
									<td className="px-4 py-3 text-slate-700">{student.totalCredits}</td>
									<td className="px-4 py-3 text-right">
										<Button size="sm" variant="outline" onClick={() => setActiveStudent(student)}>
											View profile
										</Button>
									</td>
								</tr>
							))}
							{!pagedStudents.length ? (
								<tr>
									<td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
										No students match the current filters.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>

				<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-slate-500">
						Showing {filteredStudents.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}
					</p>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
							Previous
						</Button>
						<span className="text-sm text-slate-600">
							Page {currentPage} of {totalPages}
						</span>
						<Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
							Next
						</Button>
					</div>
				</div>
			</section>

			<Modal
				open={Boolean(activeStudent)}
				onClose={() => setActiveStudent(null)}
				title={activeStudent ? `${activeStudent.name} profile` : "Student profile"}
				footer={
					<Button variant="outline" onClick={() => setActiveStudent(null)}>
						Close
					</Button>
				}
			>
				{activeStudent ? (
					<div className="space-y-5">
						<div className="grid gap-3 sm:grid-cols-2">
							<InfoCard label="Student name" value={activeStudent.name} />
							<InfoCard label="Student ID" value={activeStudent.studentProfile?.studentId || activeStudent.studentId} />
							<InfoCard label="Academic year" value={formatAcademicYear(activeStudent)} />
							<InfoCard label="Semester" value={formatSemester(activeStudent)} />
							<InfoCard label="Division" value={activeStudent.studentProfile?.division || "Not added yet"} />
							<InfoCard label="Branch" value={activeStudent.studentProfile?.branch || "Not added yet"} />
							<InfoCard label="Roll number" value={activeStudent.studentProfile?.rollNo || "Not added yet"} />
							<InfoCard label="CGPA" value={typeof activeStudent.studentProfile?.cgpa === "number" ? activeStudent.studentProfile.cgpa.toFixed(2) : "Not added yet"} />
						</div>

						{activeStudent.studentProfile?.semesterCgpa?.length ? (
							<div>
								<h4 className="text-sm font-semibold text-slate-900">Semester CGPA</h4>
								<div className="mt-3 flex flex-wrap gap-2">
									{activeStudent.studentProfile.semesterCgpa.map((entry) => (
										<span key={entry.semester} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
											Sem {entry.semester}: {entry.cgpa.toFixed(2)}
										</span>
									))}
								</div>
							</div>
						) : null}

						<div>
							<h4 className="text-sm font-semibold text-slate-900">Activity submissions</h4>
							<p className="mt-1 text-sm text-slate-600">
								Approved: <span className="font-semibold text-slate-900">{activeStudent.approvedActivities}</span>
								{" | "}
								Total submissions: <span className="font-semibold text-slate-900">{activeStudent.totalSubmissions}</span>
								{" | "}
								Credits earned: <span className="font-semibold text-slate-900">{activeStudent.totalCredits}</span>
							</p>
							<div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-slate-100">
								<table className="w-full text-left text-sm">
									<thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
										<tr>
											<th className="px-3 py-2">Title</th>
											<th className="px-3 py-2">Category</th>
											<th className="px-3 py-2">Status</th>
											<th className="px-3 py-2">Credits</th>
											<th className="px-3 py-2">Semester</th>
											<th className="px-3 py-2">Division</th>
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
												<td className="px-3 py-2 text-slate-600">{submission.semester ? `Sem ${submission.semester}` : "-"}</td>
												<td className="px-3 py-2 text-slate-600">{submission.division || "-"}</td>
												<td className="px-3 py-2 text-slate-600">{new Date(submission.createdAt).toLocaleDateString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				) : null}
			</Modal>
		</ScrollReveal>
	)
}

export default StudentProgressSection