"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { AdminUserSummary } from "@/features/users/types/user.types"
import { UserRole, UserStatus } from "@/types/user.types"

interface EditUserModalProps {
	open: boolean
	user: AdminUserSummary | null
	isSubmitting?: boolean
	onClose: () => void
	onSave: (payload: { role: UserRole; status: UserStatus }) => Promise<void> | void
}

const roleOptions: UserRole[] = [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT]
const statusOptions: UserStatus[] = [
	UserStatus.ACTIVE,
	UserStatus.SUSPENDED,
	UserStatus.PENDING_VERIFICATION,
	UserStatus.INACTIVE,
]

const formatLabel = (value: string) =>
	value
		.split("_")
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ")

export function EditUserModal({ open, user, isSubmitting = false, onClose, onSave }: EditUserModalProps) {
	const [role, setRole] = useState<UserRole>(user?.role ?? UserRole.STUDENT)
	const [status, setStatus] = useState<UserStatus>(user?.status ?? UserStatus.ACTIVE)
	const hasChanges = user ? role !== user.role || status !== user.status : false

	useEffect(() => {
		if (!user) return
		setRole(user.role)
		setStatus(user.status)
	}, [user, open])

	if (!user) return null

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={`Edit ${user.name}`}
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						loading={isSubmitting}
						disabled={!hasChanges || isSubmitting}
						onClick={() => {
							void onSave({ role, status })
						}}
					>
						Save changes
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<p className="text-sm text-slate-600">Update role and account status. Changes take effect immediately.</p>
				<Select
					label="Role"
					value={role}
					onChange={(event) => setRole(event.target.value as UserRole)}
					options={roleOptions.map((value) => ({ label: formatLabel(value), value }))}
				/>
				<Select
					label="Status"
					value={status}
					onChange={(event) => setStatus(event.target.value as UserStatus)}
					options={statusOptions.map((value) => ({ label: formatLabel(value), value }))}
				/>
			</div>
		</Modal>
	)
}

export default EditUserModal
