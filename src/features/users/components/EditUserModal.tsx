"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { AdminUserSummary } from "@/features/users/types/user.types"
import { UserRole, UserStatus } from "@/types/user.types"
import { ActivityCategory } from "@/types"
import { CATEGORY_LABELS } from "@/constants/activityCategories"

interface EditUserModalProps {
	open: boolean
	user: AdminUserSummary | null
	isSubmitting?: boolean
	onClose: () => void
	onSave: (payload: { role: UserRole; status: UserStatus; reviewCategories?: ActivityCategory[] }) => Promise<void> | void
}

const roleOptions: UserRole[] = [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT]
const statusOptions: UserStatus[] = [
	UserStatus.ACTIVE,
	UserStatus.SUSPENDED,
	UserStatus.PENDING_VERIFICATION,
	UserStatus.INACTIVE,
]

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
	value: value as ActivityCategory,
	label,
}))

const areCategorySetsEqual = (left: ActivityCategory[], right: ActivityCategory[]) => {
	if (left.length !== right.length) return false
	const rightSet = new Set(right)
	return left.every((item) => rightSet.has(item))
}

const formatLabel = (value: string) =>
	value
		.split("_")
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ")

export function EditUserModal({ open, user, isSubmitting = false, onClose, onSave }: EditUserModalProps) {
	const [role, setRole] = useState<UserRole>(user?.role ?? UserRole.STUDENT)
	const [status, setStatus] = useState<UserStatus>(user?.status ?? UserStatus.ACTIVE)
	const [reviewCategories, setReviewCategories] = useState<ActivityCategory[]>(user?.reviewCategories ?? [])
	const initialReviewCategories = user?.reviewCategories ?? []
	const hasCategoryChanges = role === UserRole.FACULTY ? !areCategorySetsEqual(reviewCategories, initialReviewCategories) : initialReviewCategories.length > 0
	const hasChanges = user ? role !== user.role || status !== user.status || hasCategoryChanges : false
	const isMasterAdmin = user?.role === UserRole.MASTER_ADMIN

	useEffect(() => {
		if (!user) return
		setRole(user.role)
		setStatus(user.status)
		setReviewCategories(user.reviewCategories ?? [])
	}, [user, open])

	const toggleCategory = (category: ActivityCategory) => {
		setReviewCategories((previous) => {
			if (previous.includes(category)) {
				return previous.filter((entry) => entry !== category)
			}

			return [...previous, category]
		})
	}

	if (!user || isMasterAdmin) return null

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
						disabled={!hasChanges || isSubmitting || (role === UserRole.FACULTY && reviewCategories.length === 0)}
						onClick={() => {
							void onSave({
								role,
								status,
								reviewCategories: role === UserRole.FACULTY ? reviewCategories : [],
							})
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
				{role === UserRole.FACULTY ? (
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-700">Review categories</p>
						<p className="text-xs text-slate-500">Faculty can only review verification requests from selected categories.</p>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{categoryOptions.map((option) => {
								const checked = reviewCategories.includes(option.value)
								return (
									<label key={option.value} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
										<input
											type="checkbox"
											checked={checked}
											onChange={() => toggleCategory(option.value)}
											className="h-4 w-4 rounded border-slate-300"
										/>
										<span>{option.label}</span>
									</label>
								)
							})}
						</div>
						{reviewCategories.length === 0 ? <p className="text-xs text-rose-600">Select at least one category for faculty reviewers.</p> : null}
					</div>
				) : null}
			</div>
		</Modal>
	)
}

export default EditUserModal
