"use client"

import { useUsers } from '@/features/users/hooks/useUsers'
import UserTable from '@/features/users/components/UserTable'
import { Alert } from '@/components/feedback/Alert'

export default function AdminUsersPage() {
	const { users, isLoading, error, selectedIds, toggleUserSelection, openEditor } = useUsers(true)

	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
				<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Directory</p>
				<h1 className="mt-2 text-3xl font-semibold text-slate-900">User management</h1>
				<p className="mt-4 max-w-2xl text-sm text-slate-600">
					Live institution-scoped user directory from Firestore. Admin actions only affect users in your college.
				</p>
			</section>

			{error ? (
				<Alert variant="error" title="Unable to load users">
					{error}
				</Alert>
			) : null}

			<UserTable
				users={users}
				selectedIds={selectedIds}
				isLoading={isLoading}
				onSelect={toggleUserSelection}
				onEdit={openEditor}
			/>
		</div>
	)
}
