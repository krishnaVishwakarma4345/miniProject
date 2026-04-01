"use client"

import { useState } from 'react'
import { useUsers } from '@/features/users/hooks/useUsers'
import UserTable from '@/features/users/components/UserTable'
import { Alert } from '@/components/feedback/Alert'
import EditUserModal from '@/features/users/components/EditUserModal'
import { UpdateUserPayload } from '@/features/users/types/user.types'
import { UserRole } from '@/types/user.types'
import { Button } from '@/components/ui/Button'

export default function AdminUsersPage() {
	const {
		users,
		isLoading,
		error,
		selectedIds,
		toggleUserSelection,
		openEditor,
		closeEditor,
		selectedUser,
		isEditModalOpen,
		saveUser,
		bulkUpdateRole,
		clearUserSelection,
	} = useUsers(true)

	const [bulkRole, setBulkRole] = useState<UserRole>(UserRole.STUDENT)
	const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

	const handleSave = async (payload: Omit<UpdateUserPayload, 'userId'>) => {
		if (!selectedUser) return
		await saveUser({ userId: selectedUser.id, ...payload })
		closeEditor()
	}

	const handleBulkRoleUpdate = async () => {
		setIsBulkSubmitting(true)
		try {
			await bulkUpdateRole(bulkRole)
		} finally {
			setIsBulkSubmitting(false)
		}
	}

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

			{selectedIds.length > 0 && (
				<div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-4">
							<div>
								<p className="text-sm font-medium text-slate-900">
									{selectedIds.length} user{selectedIds.length === 1 ? '' : 's'} selected
								</p>
								<p className="text-xs text-slate-600">Bulk change role for selected users</p>
							</div>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<select
								value={bulkRole}
								onChange={(e) => setBulkRole(e.target.value as UserRole)}
								className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							>
								<option value={UserRole.STUDENT}>Student</option>
								<option value={UserRole.FACULTY}>Faculty</option>
								<option value={UserRole.ADMIN}>Admin</option>
							</select>
							<Button
								onClick={handleBulkRoleUpdate}
								disabled={isBulkSubmitting}
								className="whitespace-nowrap"
							>
								{isBulkSubmitting ? 'Updating...' : 'Apply to Selected'}
							</Button>
							<Button
								variant="outline"
								onClick={clearUserSelection}
								disabled={isBulkSubmitting}
								className="whitespace-nowrap"
							>
								Clear Selection
							</Button>
						</div>
					</div>
				</div>
			)}

			<EditUserModal
				open={isEditModalOpen}
				user={selectedUser}
				onClose={closeEditor}
				onSave={handleSave}
			/>
		</div>
	)
}
