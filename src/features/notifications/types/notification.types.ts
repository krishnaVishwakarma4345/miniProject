import { Notification, NotificationPriority, NotificationType } from "@/types/notification.types"

export const DEFAULT_NOTIFICATION_LIMIT = 20

export type NotificationBellAnimation = "idle" | "ping" | "shake"

export interface NotificationFeedFilters {
	unreadOnly: boolean
	priority: NotificationPriority | "all"
	types: NotificationType[] | "all"
}

export interface NotificationViewModel extends Notification {
	timeAgo: string
	accentColor: string
	iconLabel: string
}

export interface NotificationRealtimePayload {
	notifications: Notification[]
	unreadCount: number
}

export const PRIORITY_BADGE_MAP: Record<NotificationPriority, { label: string; className: string }> = {
	low: { label: "Low", className: "border-slate-200 text-slate-500" },
	normal: { label: "Normal", className: "border-sky-200 text-sky-600" },
	high: { label: "High", className: "border-amber-200 text-amber-600" },
	critical: { label: "Critical", className: "border-rose-200 text-rose-600" },
}

export const TYPE_META: Record<NotificationType, { label: string; icon: string; accent: string }> = {
	activity_submitted: { label: "Activity submitted", icon: "📝", accent: "bg-sky-500" },
	activity_under_review: { label: "Under review", icon: "🕑", accent: "bg-indigo-500" },
	activity_approved: { label: "Activity approved", icon: "✅", accent: "bg-emerald-500" },
	activity_rejected: { label: "Activity rejected", icon: "⚠️", accent: "bg-amber-500" },
	activity_revision_requested: { label: "Revision requested", icon: "✏️", accent: "bg-amber-500" },
	activity_comment_added: { label: "New comment", icon: "💬", accent: "bg-sky-500" },
	announcement: { label: "Announcement", icon: "📢", accent: "bg-violet-500" },
	system_update: { label: "System update", icon: "⚙️", accent: "bg-slate-500" },
	deadline_reminder: { label: "Deadline", icon: "⏰", accent: "bg-rose-500" },
	maintenance: { label: "Maintenance", icon: "🛠", accent: "bg-slate-500" },
	user_registered: { label: "New user", icon: "✨", accent: "bg-emerald-500" },
	profile_updated: { label: "Profile updated", icon: "👤", accent: "bg-blue-500" },
	password_changed: { label: "Password changed", icon: "🔒", accent: "bg-slate-700" },
	session_expired: { label: "Session expired", icon: "🔔", accent: "bg-slate-700" },
	new_submission_assigned: { label: "Submission assigned", icon: "📬", accent: "bg-purple-500" },
	bulk_assignment: { label: "Bulk assignment", icon: "📦", accent: "bg-purple-500" },
	suspicious_activity: { label: "Security alert", icon: "🚨", accent: "bg-rose-600" },
	user_role_changed: { label: "Role changed", icon: "🛡", accent: "bg-indigo-500" },
}

export const buildNotificationViewModel = (notification: Notification, now: number = Date.now()): NotificationViewModel => {
	const meta = TYPE_META[notification.type] ?? { label: "Update", icon: "🔔", accent: "bg-slate-500" }
	const milliseconds = typeof notification.createdAt === "number" ? notification.createdAt : new Date(notification.createdAt).getTime()
	const timeAgo = formatRelative(milliseconds, now)

	return {
		...notification,
		timeAgo,
		accentColor: meta.accent,
		iconLabel: meta.icon,
	}
}

const formatRelative = (timestamp: number, now: number): string => {
	const diff = Math.max(0, now - timestamp)
	const seconds = Math.floor(diff / 1000)
	if (seconds < 60) return "just now"
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	if (days < 7) return `${days}d ago`
	const weeks = Math.floor(days / 7)
	return `${weeks}w ago`
}
