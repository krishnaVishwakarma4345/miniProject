"use client"

import { MouseEvent, useMemo } from "react"
import { motion } from "framer-motion"
import { NotificationViewModel, PRIORITY_BADGE_MAP } from "@/features/notifications/types/notification.types"

interface NotificationItemProps {
	notification: NotificationViewModel
	onMarkRead?: (id: string) => void
	onDismiss?: (id: string) => void
	highlight?: boolean
}

export function NotificationItem({ notification, onDismiss, onMarkRead, highlight = false }: NotificationItemProps) {
	const priorityBadge = useMemo(() => PRIORITY_BADGE_MAP[notification.priority], [notification.priority])

	const handleDismiss = (event?: MouseEvent<HTMLButtonElement>) => {
		event?.stopPropagation()
		onDismiss?.(notification.id)
	}

	const handleMarkRead = (event?: MouseEvent<HTMLButtonElement>) => {
		event?.stopPropagation()
		if (!notification.isRead) {
			onMarkRead?.(notification.id)
		}
	}

	return (
		<motion.li
			layout
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={0.2}
			onDragEnd={(_, info) => {
				if (info.offset.x <= -80) handleDismiss()
			}}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ type: "spring", stiffness: 320, damping: 30 }}
			className={`relative flex gap-3 rounded-2xl border p-3 text-left shadow-sm ${
				notification.isRead ? "border-slate-100 bg-white" : "border-slate-200 bg-slate-50"
			} ${highlight ? "ring-2 ring-sky-200" : ""}`}
		>
			<span
				className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${notification.accentColor} text-white`}
				aria-hidden
			>
				{notification.iconLabel}
			</span>
			<div className="flex-1">
				<div className="flex items-start justify-between gap-2">
					<div>
						<p className="text-sm font-semibold text-slate-900">{notification.title}</p>
						<p className="mt-0.5 text-sm text-slate-600">{notification.message}</p>
					</div>
					<button
						type="button"
						onClick={handleDismiss}
						className="rounded-full p-1 text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
						aria-label="Dismiss notification"
					>
						×
					</button>
				</div>
				<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
					<span>{notification.timeAgo}</span>
					<span className={`rounded-full border px-2 py-0.5 ${priorityBadge.className}`}>{priorityBadge.label}</span>
					{notification.action?.label && notification.action?.target ? (
						<a
							className="text-sky-600 transition hover:text-sky-700"
							href={notification.action.target}
							onClick={handleMarkRead}
						>
							{notification.action.label}
						</a>
					) : null}
					{!notification.isRead ? (
						<button
							type="button"
							onClick={handleMarkRead}
							className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
						>
							Mark read
						</button>
					) : null}
				</div>
			</div>
			{!notification.isRead ? <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-sky-400 animate-[pulse_2s_ease-in-out_infinite]" aria-hidden /> : null}
		</motion.li>
	)
}

export default NotificationItem
