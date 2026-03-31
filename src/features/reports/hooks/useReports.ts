"use client"

import { useCallback, useEffect } from "react"
import { useAdminStore } from "@/store/admin.store"
import reportsService from "@/features/reports/services/reports.service"
import { ReportBuilderConfig } from "@/features/reports/types/report.types"
import { useUIStore } from "@/store/ui.store"

export function useReports() {
	const ui = useUIStore()
	const {
		reports,
		setReportConfig,
		setReportTemplates,
		setReportLoading,
		setReportGenerating,
		setGeneratedReport,
		setReportError,
	} = useAdminStore()

	const loadTemplates = useCallback(async () => {
		if (reports.templates.length) return
		setReportLoading(true)
		try {
			const templates = await reportsService.fetchTemplates()
			setReportTemplates(templates)
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to load templates"
			setReportError(message)
			ui.addToast({ type: "error", title: "Template load failed", message })
		} finally {
			setReportLoading(false)
		}
	}, [reports.templates.length, setReportError, setReportLoading, setReportTemplates, ui])

	useEffect(() => {
		void loadTemplates()
	}, [loadTemplates])

	const generateReport = async (override?: Partial<ReportBuilderConfig>) => {
		setReportGenerating(true)
		setReportError(null)
		try {
			const config = { ...reports.config, ...override }
			const report = await reportsService.generateReport(config)
			setGeneratedReport(report)
			ui.addToast({ type: "success", title: "Report ready", message: report.fileName })
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to generate report"
			setReportError(message)
			ui.addToast({ type: "error", title: "Report failed", message })
		} finally {
			setReportGenerating(false)
		}
	}

	return {
		config: reports.config,
		templates: reports.templates,
		latestReport: reports.latestReport,
		isGenerating: reports.isGenerating,
		error: reports.error,
		setConfig: (partial: Partial<ReportBuilderConfig>) => setReportConfig(partial),
		generateReport,
	}
}

export default useReports
