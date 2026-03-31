import { ApiResponse } from "@/types"
import {
	GeneratedReport,
	ReportBuilderConfig,
	ReportTemplate,
} from "@/features/reports/types/report.types"

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || "Request failed")
	}
	return payload.data as T
}

export const reportsService = {
	async fetchTemplates(): Promise<ReportTemplate[]> {
		const response = await fetch("/api/admin/reports", {
			method: "GET",
			credentials: "include",
		})
		return ensureSuccess<ReportTemplate[]>(response)
	},

	async generateReport(config: ReportBuilderConfig): Promise<GeneratedReport> {
		const response = await fetch("/api/admin/reports", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(config),
		})
		return ensureSuccess<GeneratedReport>(response)
	},
}

export default reportsService
