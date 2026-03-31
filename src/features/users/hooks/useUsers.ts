"use client"

import { useCallback, useEffect } from "react"
import { useAdminStore } from "@/store/admin.store"
import usersService from "@/features/users/services/users.service"
import { UpdateUserPayload } from "@/features/users/types/user.types"
import { UserRole, UserStatus } from "@/types/user.types"
import { useUIStore } from "@/store/ui.store"

export function useUsers(auto = true) {
	const ui = useUIStore()
	const {
		users,
		setUsers,
		setUsersError,
		setUsersLoading,
		setUserFilters,
		setSelectedUser,
		setEditModalOpen,
		toggleUserSelection,
		clearUserSelection,
		updateUserInStore,
	} = useAdminStore()

	const fetchUsers = useCallback(async () => {
		setUsersLoading(true)
		setUsersError(null)
		try {
			const data = await usersService.fetchUsers(users.filters)
			setUsers(data)
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to load users"
			setUsersError(message)
			ui.addToast({ type: "error", title: "User fetch failed", message })
		} finally {
			setUsersLoading(false)
		}
	}, [setUsers, setUsersError, setUsersLoading, ui, users.filters])

	useEffect(() => {
		if (!auto) return
		void fetchUsers()
	}, [auto, fetchUsers])

	const openEditor = (userId: string) => {
		const user = users.items.find((item) => item.id === userId) || null
		setSelectedUser(user)
		setEditModalOpen(true)
	}

	const closeEditor = () => {
		setEditModalOpen(false)
		setSelectedUser(null)
	}

	const persistUser = async (payload: UpdateUserPayload) => {
		try {
			const updated = await usersService.updateUser(payload)
			updateUserInStore(updated)
			ui.addToast({ type: "success", title: "User updated", message: `${updated.name} saved successfully` })
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to update user"
			ui.addToast({ type: "error", title: "Update failed", message })
			throw error
		}
	}

	const updateRole = async (role: UserRole) => {
		if (!users.selectedUser) return
		await persistUser({ userId: users.selectedUser.id, role })
	}

	const updateStatus = async (status: UserStatus) => {
		if (!users.selectedUser) return
		await persistUser({ userId: users.selectedUser.id, status })
	}

	const bulkUpdateRole = async (role: UserRole) => {
		if (!users.selectedIds.length) return
		try {
			const updatedUsers = await usersService.bulkUpdateRole(users.selectedIds, role)
			setUsers(updatedUsers)
			clearUserSelection()
			ui.addToast({ type: "success", title: "Bulk update complete", message: `${updatedUsers.length} users updated` })
		} catch (error) {
			const message = error instanceof Error ? error.message : "Bulk update failed"
			ui.addToast({ type: "error", title: "Bulk update failed", message })
		}
	}

	const saveUser = (payload: UpdateUserPayload) => persistUser(payload)

	return {
		users: users.items,
		filters: users.filters,
		isLoading: users.isLoading,
		error: users.error,
		selectedIds: users.selectedIds,
		selectedUser: users.selectedUser,
		isEditModalOpen: users.isEditModalOpen,
		setFilters: setUserFilters,
		fetchUsers,
		openEditor,
		closeEditor,
		updateRole,
		updateStatus,
		toggleUserSelection,
		clearUserSelection,
		bulkUpdateRole,
		saveUser,
	}
}

export default useUsers
