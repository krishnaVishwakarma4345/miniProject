"use client"

import { UserRole, UserStatus } from "@/types/user.types"

export interface UserRoleBadgeProps {
	role: UserRole
	status?: UserStatus
}

const roleStyles: Record<UserRole, { label: string; className: string }> = {
	admin: { label: "Admin", className: "bg-slate-900 text-white" },
	faculty: { label: "Faculty", className: "bg-amber-100 text-amber-700" },
	student: { label: "Student", className: "bg-sky-100 text-sky-700" },
}

export function UserRoleBadge({ role, status }: UserRoleBadgeProps) {
	const style = roleStyles[role]

	return (
		<div className="flex items-center gap-2 text-xs">
			<span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${style.className}`}>
				{style.label}
			</span>
			{status ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{status}</span> : null}
		</div>
	)
}

export default UserRoleBadge
