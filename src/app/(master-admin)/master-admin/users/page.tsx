"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { ScrollReveal } from "@/features/landing/components/ScrollReveal"
import UserTable from "@/features/users/components/UserTable"
import usersService from "@/features/users/services/users.service"
import { AdminUserSummary } from "@/features/users/types/user.types"
import { UserRole } from "@/types/user.types"

type Institution = {
	id: string
	name: string
	isActive: boolean
}

type ApiResponse<T> = {
	success: boolean
	data: T
	message: string
}

export default function MasterAdminUsersPage() {
	const [institutions, setInstitutions] = useState<Institution[]>([])
	const [selectedInstitutionId, setSelectedInstitutionId] = useState("")
	const [users, setUsers] = useState<AdminUserSummary[]>([])
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [isInstitutionsLoading, setIsInstitutionsLoading] = useState(true)
	const [isUsersLoading, setIsUsersLoading] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const activeInstitutions = useMemo(() => institutions.filter((item) => item.isActive), [institutions])

	const loadInstitutions = async () => {
		setIsInstitutionsLoading(true)
		setError(null)

		try {
			const response = await fetch("/api/institutions", { method: "GET", cache: "no-store" })
			const payload = (await response.json()) as ApiResponse<Institution[]>

			if (!response.ok || !payload.success) {
				throw new Error(payload.message || "Failed to fetch institutions")
			}

			setInstitutions(payload.data || [])
			const nextSelectedInstitutionId = selectedInstitutionId || payload.data?.find((item) => item.isActive)?.id || ""
			setSelectedInstitutionId(nextSelectedInstitutionId)
		} catch (fetchError) {
			setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch institutions")
		} finally {
			setIsInstitutionsLoading(false)
		}
	}

	const loadUsers = async (institutionId: string) => {
		if (!institutionId) {
			setUsers([])
			return
		}

		setIsUsersLoading(true)
		setError(null)

		try {
			const data = await usersService.fetchUsers({
				institutionId,
				role: "all",
				status: "all",
				department: "all",
				search: "",
			})
			setUsers(data)
			setSelectedIds([])
		} catch (fetchError) {
			setUsers([])
			setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch users")
		} finally {
			setIsUsersLoading(false)
		}
	}

	useEffect(() => {
		void loadInstitutions()
	}, [])

	useEffect(() => {
		if (!selectedInstitutionId) return
		void loadUsers(selectedInstitutionId)
	}, [selectedInstitutionId])

	const selectedInstitutionName = activeInstitutions.find((item) => item.id === selectedInstitutionId)?.name || "Select a college"

	const promoteUser = async (userId: string) => {
		if (!selectedInstitutionId) return

		setIsUpdating(true)
		setError(null)
		setSuccess(null)

		try {
			await usersService.updateUser({ userId, role: UserRole.ADMIN, institutionId: selectedInstitutionId })
			await loadUsers(selectedInstitutionId)
			setSuccess("User promoted to admin")
		} catch (promoteError) {
			setError(promoteError instanceof Error ? promoteError.message : "Failed to promote user")
		} finally {
			setIsUpdating(false)
		}
	}

	const bulkPromote = async () => {
		if (!selectedIds.length || !selectedInstitutionId) return

		setIsUpdating(true)
		setError(null)
		setSuccess(null)

		try {
			await usersService.bulkUpdateRole(selectedIds, UserRole.ADMIN, selectedInstitutionId)
			await loadUsers(selectedInstitutionId)
			setSuccess(`${selectedIds.length} user${selectedIds.length === 1 ? "" : "s"} promoted to admin`)
		} catch (bulkError) {
			setError(bulkError instanceof Error ? bulkError.message : "Bulk promotion failed")
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<div className="space-y-8">
			<ScrollReveal from="left">
				<section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<p className="text-xs uppercase tracking-[0.4em] text-slate-400">College access control</p>
					<h1 className="mt-2 text-3xl font-semibold text-slate-900">Promote users to admin</h1>
					<p className="mt-4 max-w-2xl text-sm text-slate-600">
						Select a college, review registered users, and promote only users from that institution to admin.
					</p>
				</section>
			</ScrollReveal>

			<ScrollReveal from="right">
				<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
						<Select
							label="Institution"
							value={selectedInstitutionId}
							onChange={(event) => setSelectedInstitutionId(event.target.value)}
							options={activeInstitutions.map((institution) => ({ label: institution.name, value: institution.id }))}
							hint={selectedInstitutionName}
						/>
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
							<Button variant="outline" onClick={() => void loadInstitutions()} disabled={isInstitutionsLoading || isUpdating}>
								Refresh institutions
							</Button>
							<Button
								onClick={() => void loadUsers(selectedInstitutionId)}
								disabled={!selectedInstitutionId || isUsersLoading || isUpdating}
							>
								Refresh users
							</Button>
						</div>
					</div>
				</section>
			</ScrollReveal>

			{error ? (
				<div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
			) : null}
			{success ? (
				<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
			) : null}

			{selectedInstitutionId ? (
				<ScrollReveal from="left">
					<section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-medium text-slate-900">{selectedIds.length} user{selectedIds.length === 1 ? "" : "s"} selected</p>
								<p className="text-xs text-slate-600">Promotions apply only to {selectedInstitutionName}.</p>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row">
								<Button onClick={() => void bulkPromote()} disabled={!selectedIds.length || isUsersLoading || isUpdating}>
									{isUpdating ? "Updating..." : "Promote selected to admin"}
								</Button>
							</div>
						</div>
					</section>
				</ScrollReveal>
			) : null}

			<ScrollReveal from="right">
				<UserTable
					users={users}
					selectedIds={selectedIds}
					isLoading={isInstitutionsLoading || isUsersLoading}
					onSelect={(userId) =>
						setSelectedIds((previous) =>
							previous.includes(userId) ? previous.filter((entry) => entry !== userId) : [...previous, userId]
						)
					}
					onAction={(userId) => {
						void promoteUser(userId)
					}}
					actionLabel="Promote"
				/>
			</ScrollReveal>
		</div>
	)
}
