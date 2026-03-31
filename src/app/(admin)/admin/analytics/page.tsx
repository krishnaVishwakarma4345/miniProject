const analyticsHighlights = [
	{
		title: "Engagement",
		description: "Average activities logged per student in the last 30 days",
		value: "8.2",
		delta: "+12% vs last month",
	},
	{
		title: "Faculty response time",
		description: "Median time to review a submission",
		value: "18h",
		delta: "-3h vs target",
	},
	{
		title: "Portfolio reach",
		description: "External portfolio views generated from share links",
		value: "1,240",
		delta: "+220 week over week",
	},
];

export default function AdminAnalyticsPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-8">
				<p className="text-xs uppercase tracking-[0.4em] text-blue-400">Analytics</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Institution health</h1>
				<p className="mt-4 max-w-3xl text-sm text-slate-600">
					Hook these tiles to `/api/analytics/*` route handlers to surface live participation insights. Until then, mocked values help product review the intended layout.
				</p>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{analyticsHighlights.map((highlight) => (
					<article key={highlight.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{highlight.title}</div>
						<div className="mt-4 text-4xl font-semibold text-slate-900">{highlight.value}</div>
						<p className="mt-2 text-sm text-emerald-600">{highlight.delta}</p>
						<p className="mt-4 text-sm text-slate-600">{highlight.description}</p>
					</article>
				))}
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-6">
				<h2 className="text-lg font-semibold text-slate-900">Data wiring checklist</h2>
				<ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
					<li>Connect Firestore aggregations to `/api/analytics/overview`.</li>
					<li>Verify role-scoped access via Firebase custom claims.</li>
					<li>Add CSV export endpoint at `/api/analytics/export`.</li>
				</ul>
			</section>
		</div>
	);
}
