const pendingReports = [
	{ name: "Quarterly participation", eta: "Drafting" },
	{ name: "Faculty workload", eta: "Awaiting data" },
	{ name: "Accreditation export", eta: "Requires mapping" },
];

export default function AdminReportsPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Reports</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Automated exports</h1>
				<p className="mt-4 max-w-2xl text-sm text-slate-600">
					This view will be wired to Firestore aggregations and PDF exports. For now, it documents which deliverables must be implemented before phase 12.
				</p>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-6">
				<h2 className="text-lg font-semibold text-slate-900">Pending templates</h2>
				<div className="mt-4 divide-y divide-slate-100">
					{pendingReports.map((report) => (
						<div key={report.name} className="flex items-center justify-between py-3 text-sm text-slate-700">
							<span>{report.name}</span>
							<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{report.eta}</span>
						</div>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
				<p className="font-semibold text-slate-800">Next steps</p>
				<ol className="mt-3 list-decimal space-y-2 pl-5">
					<li>Create `/api/reports` handlers (list + generate).</li>
					<li>Connect Cloudinary signed URLs for PDF artifacts.</li>
					<li>Add status polling in the client to show progress.</li>
				</ol>
			</section>
		</div>
	);
}
