import { PageContainer } from '@/components/layout/PageContainer'

type UserDetailPageProps = {
	params: Promise<{
		userId: string;
	}>;
};

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
	const { userId } = await params

	return (
		<PageContainer>
			<div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">User detail</p>
				<h1 className="break-words text-2xl font-semibold text-slate-900">User ID · {userId}</h1>
				<p className="break-words text-sm text-slate-600">
					Hook this page up to `/api/users/{userId}` to fetch real metadata. Until then, it simply confirms dynamic route wiring is functioning after the Next.js 16 upgrade.
				</p>
			</div>
		</PageContainer>
	);
}
