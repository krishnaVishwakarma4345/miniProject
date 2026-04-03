import { UserRole, UserStatus } from "@/types/user.types"
import { ActivityCategory } from "@/types"

export interface AdminUserFilters {
	role: UserRole | "all"
	status: UserStatus | "all"
	department: string | "all"
	search: string
}

export interface AdminUserSummary {
	id: string
	name: string
	email: string
	role: UserRole
	status: UserStatus
	department?: string
	reviewCategories?: ActivityCategory[]
	lastActive?: number
	totalActivities?: number
}

export interface UpdateUserPayload {
	userId: string
	role?: UserRole
	status?: UserStatus
	department?: string
	reviewCategories?: ActivityCategory[]
}
