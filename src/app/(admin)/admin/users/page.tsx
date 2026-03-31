const sampleUsers = [
	{ name: "Ava Patel", role: "student", status: "Active" },
	{ name: "Dr. Miguel Santos", role: "faculty", status: "Reviewing" },
	{ name: "Priya Nair", role: "admin", status: "Active" },
];

export default function AdminUsersPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Directory</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">User management</h1>
				<p className="mt-4 max-w-2xl text-sm text-slate-600">
					Tie this screen into `/api/users` once the server handlers land. The mocked table below helps validate spacing, typography, and empty states.
				</p>
			</section>

			<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-100 text-sm">
						<thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
							<tr>
								<th className="px-6 py-3">Name</th>
								<th className="px-6 py-3">Role</th>
								<th className="px-6 py-3">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{sampleUsers.map((user) => (
								<tr key={user.name} className="text-slate-700">
									<td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
									<td className="px-6 py-4 capitalize">{user.role}</td>
									<td className="px-6 py-4">
										<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">{user.status}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
