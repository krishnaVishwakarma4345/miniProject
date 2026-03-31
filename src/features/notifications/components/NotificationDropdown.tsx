"use client"

import { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { NotificationItem } from "@/features/notifications/components/NotificationItem"
import { NotificationViewModel } from "@/features/notifications/types/notification.types"

interface NotificationDropdownProps {
	notifications: NotificationViewModel[]
	isOpen: boolean
	isLoading: boolean
	hasMore: boolean
	unreadCount: number
	isMarkingAll: boolean
	highlightId: string | null
	error?: string | null
	onClose: () => void
	onLoadMore: () => void
	onMarkRead: (id: string) => void
	onMarkAll: () => void
	onDismiss: (id: string) => void
	onRetry?: () => void
}

export function NotificationDropdown({
	notifications,
	isOpen,
	isLoading,
	hasMore,
	unreadCount,
	isMarkingAll,
	highlightId,
	error,
	onClose,
	onLoadMore,
	onMarkRead,
	onMarkAll,
	onDismiss,
	onRetry,
}: NotificationDropdownProps) {
	const [listRef] = useAutoAnimate({ duration: 220, easing: "ease-out" })

	const headerLabel = useMemo(() => (unreadCount ? `${unreadCount} unread` : "You're all caught up"), [unreadCount])

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					initial={{ opacity: 0, y: -12, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -12, scale: 0.97 }}
					transition={{ type: "spring", stiffness: 320, damping: 32 }}
					className="absolute right-0 top-14 z-50 w-[420px] max-w-[92vw] rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-2xl backdrop-blur"
				>
					<div className="mb-4 flex items-center justify-between gap-2">
						<div>
							<p className="text-sm font-semibold text-slate-900">Notifications</p>
							<p className="text-xs text-slate-500">{headerLabel}</p>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={onMarkAll}
								disabled={!unreadCount || isMarkingAll}
								className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isMarkingAll ? "Marking..." : "Mark all"}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="rounded-full border border-transparent p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
								aria-label="Close notifications"
							>
								×
							</button>
						</div>
					</div>

					{error ? (
						<div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
							<p>{error}</p>
							{onRetry ? (
								<button type="button" onClick={onRetry} className="mt-2 text-rose-900 underline">
									Try again
								</button>
							) : null}
						</div>
					) : null}

					<div className="max-h-[420px] space-y-3 overflow-y-auto pr-1" ref={listRef}>
						{notifications.length ? (
							notifications.map((notification) => (
								<NotificationItem
									key={notification.id}
									notification={notification}
									onMarkRead={onMarkRead}
									onDismiss={onDismiss}
									highlight={highlightId === notification.id}
								/>
							))
						) : (
							<div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
								<p>No notifications yet.</p>
								<p className="mt-1">We'll drop them here in real-time.</p>
							</div>
						)}
						{isLoading ? (
							<div className="flex items-center justify-center py-3 text-xs text-slate-500">Loading...</div>
						) : null}
					</div>

					{hasMore ? (
						<button
							type="button"
							onClick={onLoadMore}
							className="mt-4 w-full rounded-2xl border border-slate-200 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
						>
							Load more
						</button>
					) : null}
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}

export default NotificationDropdown
