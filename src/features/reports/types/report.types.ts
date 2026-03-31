export type ReportFormat = "pdf" | "csv" | "xlsx"

export interface ReportTemplate {
	id: string
	name: string
	description: string
	recommendedFor: string
}

export interface ReportSectionConfig {
	activities: boolean
	departments: boolean
	students: boolean
	summary: boolean
}

export interface ReportBuilderConfig {
	range: "30d" | "quarter" | "year"
	format: ReportFormat
	sectionConfig: ReportSectionConfig
	includeCharts: boolean
}

export interface GeneratedReport {
	id: string
	url?: string
	createdAt: number
	format: ReportFormat
	fileName: string
	sections: Array<{ title: string; value: string }>
	highlights: string[]
}
