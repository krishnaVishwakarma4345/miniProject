import { ActivityCategory } from "@/types"

export type AnalyticsRange = "7d" | "30d" | "90d"

export interface AnalyticsMetric {
	id: string
	label: string
	value: number
	suffix?: string
	delta?: number
	trendLabel?: string
	positive?: boolean
}

export interface ParticipationDatum {
	label: string
	value: number
}

export interface CategoryDistributionDatum {
	category: ActivityCategory
	count: number
}

export interface DepartmentBreakdownDatum {
	department: string
	total: number
}

export interface MonthlyTrendDatum {
	label: string
	submitted: number
	approved: number
}

export interface TopStudentDatum {
	studentId: string
	name: string
	department?: string
	approved: number
	pointsAwarded?: number
}

export interface StudentSubmissionDatum {
	activityId: string
	title: string
	category: ActivityCategory
	status: string
	activityDate: number
	createdAt: number
	pointsAwarded: number
	year?: number
	semester?: number
	division?: string
	branch?: string
}

export interface StudentProgressProfile {
	studentId?: string
	academicYear?: number
	year?: number
	semester?: number
	division?: string
	branch?: string
	rollNo?: string
	department?: string
	cgpa?: number
	semesterCgpa?: Array<{
		semester: number
		cgpa: number
	}>
	profileCompletion?: number
}

export interface StudentProgressDatum {
	studentId: string
	name: string
	email?: string
	department?: string
	studentProfile?: StudentProgressProfile
	approvedActivities: number
	totalSubmissions: number
	totalCredits: number
	submissions: StudentSubmissionDatum[]
}

export interface AnalyticsOverview {
	metrics: AnalyticsMetric[]
	participation: ParticipationDatum[]
	categories: CategoryDistributionDatum[]
	departments: DepartmentBreakdownDatum[]
	trend: MonthlyTrendDatum[]
	topStudents: TopStudentDatum[]
	studentProgress: StudentProgressDatum[]
}
