"use client"

import { Fragment } from "react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { AdminUserSummary } from "@/features/users/types/user.types"
import UserRoleBadge from "@/features/users/components/UserRoleBadge"

export interface UserTableProps {
	users: AdminUserSummary[]
	selectedIds: string[]
	isLoading?: boolean
	onSelect: (userId: string) => void
	onEdit: (userId: string) => void
}

export function UserTable({ users, selectedIds, isLoading = false, onSelect, onEdit }: UserTableProps) {
	if (isLoading) {
		return (
			<div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
				<Spinner label="Loading users" />
			</div>
		)
	}

	if (!users.length) {
		return (
			<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
				No users match the current filters.
			</div>
		)
	}

	return (
		<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
			<table className="w-full text-left text-sm">
				<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
					<tr>
						<th className="px-4 py-3">
							<span className="sr-only">Select</span>
						</th>
						<th className="px-4 py-3">Name</th>
						<th className="px-4 py-3">Role</th>
						<th className="px-4 py-3">Department</th>
						<th className="px-4 py-3">Last active</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => {
						const isSelected = selectedIds.includes(user.id)
						return (
							<Fragment key={user.id}>
								<tr className="border-t border-slate-100">
									<td className="px-4 py-3">
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => onSelect(user.id)}
											className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/30"
										/>
									</td>
									<td className="px-4 py-3">
										<p className="font-semibold text-slate-900">{user.name}</p>
										<p className="text-xs text-slate-500">{user.email}</p>
									</td>
									<td className="px-4 py-3">
										<UserRoleBadge role={user.role} status={user.status} />
									</td>
									<td className="px-4 py-3 text-slate-600">{user.department || "—"}</td>
									<td className="px-4 py-3 text-slate-600">
										{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "—"}
									</td>
									<td className="px-4 py-3 text-right">
										<Button
											size="sm"
											variant="outline"
											disabled={user.role === 'master_admin'}
											onClick={() => onEdit(user.id)}
										>
											Edit
										</Button>
									</td>
								</tr>
							</Fragment>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

export default UserTable
