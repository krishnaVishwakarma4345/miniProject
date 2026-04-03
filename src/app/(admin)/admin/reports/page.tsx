"use client"

import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/feedback/Alert'
import { useReports } from '@/features/reports/hooks/useReports'
import { ScrollReveal } from '@/features/landing/components/ScrollReveal'

export default function AdminReportsPage() {
	const { templates, latestReport, isGenerating, error, generateReport } = useReports()

	return (
		<div className="space-y-8">
			<ScrollReveal from='left'>
			<section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Reports</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Automated exports</h1>
				<p className="mt-4 max-w-2xl text-sm text-slate-600">
					Generate real institution reports from live Firestore data.
				</p>
				<div className="mt-6">
					<Button onClick={() => { void generateReport() }} disabled={isGenerating}>
						{isGenerating ? 'Generating...' : 'Generate live report'}
					</Button>
				</div>
			</section>
			</ScrollReveal>

			{error ? (
				<Alert variant="error" title="Report action failed">
					{error}
				</Alert>
			) : null}

			<ScrollReveal from='right'>
			<section className="rounded-2xl border border-slate-200 bg-white p-6">
				<h2 className="text-lg font-semibold text-slate-900">Available templates</h2>
				<div className="mt-4 divide-y divide-slate-100">
					{templates.map((template) => (
						<div key={template.id} className="py-3 text-sm text-slate-700">
							<p className="font-semibold text-slate-900">{template.name}</p>
							<p>{template.description}</p>
							<p className="text-xs text-slate-500">Recommended for: {template.recommendedFor}</p>
						</div>
					))}
				</div>
			</section>
			</ScrollReveal>

			<ScrollReveal from='left'>
			<section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
				<h2 className="text-lg font-semibold text-slate-900">Latest generated report</h2>
				{latestReport ? (
					<div className="mt-4 space-y-4">
						<p className="font-medium">{latestReport.fileName}</p>
						<div className="grid gap-3 md:grid-cols-2">
							{latestReport.sections.map((section) => (
								<div key={section.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
									<p className="text-xs uppercase tracking-wide text-slate-500">{section.title}</p>
									<p className="text-lg font-semibold text-slate-900">{section.value}</p>
								</div>
							))}
						</div>
						<ul className="list-disc space-y-1 pl-5 text-slate-600">
							{latestReport.highlights.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				) : (
					<p className="mt-4 text-slate-500">No report generated yet. Click Generate live report.</p>
				)}
			</section>
			</ScrollReveal>
		</div>
	)
}
