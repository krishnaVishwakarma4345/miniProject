"use client"

import { AnimatePresence, motion } from "framer-motion"

interface NotificationBadgeProps {
  count: number
  pulse?: boolean
}

export function NotificationBadge({ count, pulse = false }: NotificationBadgeProps) {
  return (
    <span className="relative inline-flex min-w-[1.5rem] justify-center" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false} mode="popLayout">
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ y: 8, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full border border-emerald-200 bg-emerald-500/10 px-2 text-xs font-semibold text-emerald-700 shadow-sm ${pulse ? "animate-[pulse_1.2s_ease-in-out_1]" : ""}`}
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}

export default NotificationBadge
