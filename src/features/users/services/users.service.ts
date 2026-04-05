import { ApiResponse } from "@/types"
import { UserRole, UserStatus } from "@/types/user.types"
import {
	AdminUserFilters,
	AdminUserSummary,
	UpdateUserPayload,
} from "@/features/users/types/user.types"

const ensureSuccess = async <T>(response: Response): Promise<T> => {
	const payload = (await response.json()) as ApiResponse<T>
	if (!response.ok || !payload.success) {
		throw new Error(payload.message || "Request failed")
	}
	return payload.data as T
}

const buildQuery = (filters?: Partial<AdminUserFilters>) => {
	const params = new URLSearchParams()
	if (filters?.institutionId) params.set("institutionId", filters.institutionId)
	if (filters?.role && filters.role !== "all") params.set("role", filters.role)
	if (filters?.status && filters.status !== "all") params.set("status", filters.status)
	if (filters?.department && filters.department !== "all") params.set("department", filters.department)
	if (filters?.search) params.set("search", filters.search)
	return params.toString()
}

export const usersService = {
	async fetchUsers(filters?: Partial<AdminUserFilters>): Promise<AdminUserSummary[]> {
		const query = buildQuery(filters)
		const response = await fetch(`/api/admin/users${query ? `?${query}` : ""}`, {
			method: "GET",
			credentials: "include",
		})
		return ensureSuccess<AdminUserSummary[]>(response)
	},

	async updateUser(payload: UpdateUserPayload): Promise<AdminUserSummary> {
		const response = await fetch("/api/admin/users", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(payload),
		})
		return ensureSuccess<AdminUserSummary>(response)
	},

	async bulkUpdateRole(userIds: string[], role: UserRole, institutionId?: string): Promise<AdminUserSummary[]> {
		const response = await fetch("/api/admin/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ action: "bulkRoleUpdate", userIds, role, institutionId }),
		})
		return ensureSuccess<AdminUserSummary[]>(response)
	},

	async toggleStatus(userId: string, status: UserStatus): Promise<AdminUserSummary> {
		const response = await fetch("/api/admin/users", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ userId, status }),
		})
		return ensureSuccess<AdminUserSummary>(response)
	},
}

export default usersService
