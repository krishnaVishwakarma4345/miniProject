type UserDetailPageProps = {
	params: {
		userId: string;
	};
};

export default function AdminUserDetailPage({ params }: UserDetailPageProps) {
	return (
		<div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
			<p className="text-xs uppercase tracking-[0.4em] text-slate-400">User detail</p>
			<h1 className="text-2xl font-semibold text-slate-900">User ID · {params.userId}</h1>
			<p className="text-sm text-slate-600">
				Hook this page up to `/api/users/{params.userId}` to fetch real metadata. Until then, it simply confirms dynamic route wiring is functioning after the Next.js 16 upgrade.
			</p>
		</div>
	);
}
