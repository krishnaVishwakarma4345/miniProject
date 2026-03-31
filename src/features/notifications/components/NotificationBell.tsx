"use client"

import { motion } from "framer-motion"
import { NotificationBadge } from "@/features/notifications/components/NotificationBadge"
import { NotificationBellAnimation } from "@/features/notifications/types/notification.types"

interface NotificationBellProps {
	count: number
	animation?: NotificationBellAnimation
	isOpen?: boolean
	onToggle: () => void
}

const animationVariants: Record<NotificationBellAnimation, any> = {
	idle: { rotate: 0, scale: 1 },
	ping: { scale: [1, 1.1, 1], rotate: 0 },
	shake: { rotate: [0, -18, 16, -10, 6, 0], scale: 1 },
}

export function NotificationBell({ count, animation = "idle", isOpen = false, onToggle }: NotificationBellProps) {
	const label = count ? `${count} unread notifications` : "Notifications"

	return (
		<motion.button
			type="button"
			aria-label={label}
			aria-expanded={isOpen}
			onClick={onToggle}
			className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
			animate={animationVariants[animation]}
			transition={{ type: "spring", stiffness: 360, damping: 24 }}
		>
			<span className="pointer-events-none text-xl" aria-hidden>
				🔔
			</span>
			<div className="absolute -right-1 -top-1">
				<NotificationBadge count={count} pulse={animation !== "idle"} />
			</div>
			<span
				className={`absolute inset-0 rounded-full border border-slate-200 transition ${isOpen ? "ring-2 ring-slate-900/10" : ""}`}
				aria-hidden
			/>
		</motion.button>
	)
}

export default NotificationBell
