import Link from "next/link";
import { StatCard } from "@/components/data-display/StatCard";
import { Button } from "@/components/ui/Button";

const dashboardStats = [
	{ label: "Active users", value: 1280 },
	{ label: "Pending approvals", value: 42 },
	{ label: "Reports generated", value: 315 },
	{ label: "System uptime", value: 99.9, suffix: "%" },
];

export default function AdminDashboardPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin control</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">Operations overview</h1>
				<p className="mt-3 max-w-2xl text-sm text-slate-600">
					Monitor adoption, respond to review queues, and keep institution level data flowing. All widgets below use mocked
					data so the layout can be validated before wiring real APIs.
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link href="/admin/analytics">
						<Button variant="outline">View analytics</Button>
					</Link>
					<Link href="/admin/reports">
						<Button>Generate report</Button>
					</Link>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{dashboardStats.map((stat) => (
					<StatCard key={stat.label} label={stat.label} value={stat.value} suffix={stat.suffix} />
				))}
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-2xl border border-slate-200 bg-white p-6">
					<h2 className="text-lg font-semibold text-slate-900">Recent system notices</h2>
					<ul className="mt-4 space-y-3 text-sm text-slate-600">
						<li>• Firestore indexes synced · <span className="text-emerald-600">healthy</span></li>
						<li>• 3 faculty requested reviewer slots · triage pending</li>
						<li>• Portfolio CDN cache purged automatically</li>
					</ul>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-white p-6">
					<h2 className="text-lg font-semibold text-slate-900">Getting ready for production</h2>
					<ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
						<li>Wire analytics widgets to `/api/analytics/*` endpoints.</li>
						<li>Enable role-based navigations via `middleware` → `proxy` guards.</li>
						<li>Connect Cloudinary + Firebase Admin credentials in deployment env.</li>
					</ol>
				</div>
			</section>
		</div>
	);
}
