"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import notificationsService, {
	NotificationFetchParams,
} from "@/features/notifications/services/notifications.service"
import {
	DEFAULT_NOTIFICATION_LIMIT,
	NotificationBellAnimation,
	NotificationFeedFilters,
	NotificationViewModel,
	buildNotificationViewModel,
} from "@/features/notifications/types/notification.types"
import { useNotificationsStore } from "@/store/notifications.store"
import { useUIStore } from "@/store/ui.store"
import { connectNotificationRealtime, NotificationRealtimeSubscription } from "@/lib/notifications/realtime.listener"

interface UseNotificationsOptions {
	userId?: string
	autoFetch?: boolean
	enableRealtime?: boolean
	pageSize?: number
}

const buildFetchParams = (
	filters: NotificationFeedFilters,
	overrides: { cursor?: string | null; limit?: number }
): NotificationFetchParams => {
	const params: NotificationFetchParams = {
		limit: overrides.limit,
		cursor: overrides.cursor ?? undefined,
		unreadOnly: filters.unreadOnly,
	}

	if (filters.priority !== "all") params.priority = filters.priority
	if (filters.types !== "all") params.types = filters.types
	return params
}

export function useNotifications(options: UseNotificationsOptions = {}) {
	const { userId, autoFetch = true, enableRealtime = true, pageSize = DEFAULT_NOTIFICATION_LIMIT } = options
	const ui = useUIStore()
	const store = useNotificationsStore()
	const {
		items,
		unreadCount,
		isLoading,
		hasMore,
		cursor,
		filters,
		error,
		isDropdownOpen,
		isMarkingAll,
		realtimeStatus,
		highlightId,
		setNotifications,
		prependNotifications,
		setUnreadCount,
		setLoading,
		setHasMore,
		setCursor,
		setFilters,
		setError,
		setDropdownOpen,
		markAsRead,
		removeNotification,
		setIsMarkingAll,
		setRealtimeStatus,
		setHighlightId,
	} = store

	const realtimeRef = useRef<NotificationRealtimeSubscription | null>(null)
	const [bellAnimation, setBellAnimation] = useState<NotificationBellAnimation>("idle")
	const highlightTimeout = useRef<NodeJS.Timeout | null>(null)

	const formattedNotifications: NotificationViewModel[] = useMemo(() => {
		return items.map((notification) => buildNotificationViewModel(notification))
	}, [items])

	const fetchNotifications = useCallback(
		async (mode: "reset" | "append" = "reset") => {
			if (!userId) return
			const nextCursor = mode === "reset" ? null : cursor
			setLoading(true)
			setError(null)
			try {
				const response = await notificationsService.fetchNotifications(
					buildFetchParams(filters, { cursor: nextCursor ?? undefined, limit: pageSize })
				)
				setNotifications(response.notifications, { replace: mode === "reset" })
				setUnreadCount(response.unreadCount)
				setHasMore(response.hasMore)
				setCursor(response.cursor ?? null)
			} catch (err) {
				const message = err instanceof Error ? err.message : "Unable to load notifications"
				setError(message)
				ui.addToast({ type: "error", title: "Notifications", message })
			} finally {
				setLoading(false)
			}
		},
		[cursor, filters, pageSize, setCursor, setError, setHasMore, setLoading, setNotifications, setUnreadCount, ui, userId]
	)

	const startRealtime = useCallback(async () => {
		if (!userId || !enableRealtime) return
		setRealtimeStatus("connecting")
		try {
			const subscription = await connectNotificationRealtime({
				userId,
				limit: pageSize,
				onPayload: ({ notifications, unreadCount: liveUnread }) => {
					if (notifications.length) {
						prependNotifications(notifications)
						setHighlightId(notifications[0].id)
						setBellAnimation("shake")
						if (highlightTimeout.current) clearTimeout(highlightTimeout.current)
						highlightTimeout.current = setTimeout(() => setHighlightId(null), 4000)
						ui.addToast({
							type: "info",
							title: notifications[0].title,
							message: notifications[0].message,
							icon: "🔔",
						})
					}
					setUnreadCount(liveUnread)
				},
				onError: (error) => {
					console.error("Realtime notifications error", error)
					setRealtimeStatus("error")
				},
			})
			realtimeRef.current?.disconnect()
			realtimeRef.current = subscription
			setRealtimeStatus("connected")
		} catch (error) {
			console.error("Failed to connect realtime notifications", error)
			setRealtimeStatus("error")
		}
	}, [enableRealtime, pageSize, prependNotifications, setHighlightId, setRealtimeStatus, setUnreadCount, ui, userId])

	useEffect(() => {
		if (!autoFetch || !userId) return
		void fetchNotifications("reset")
	}, [autoFetch, fetchNotifications, userId])

	useEffect(() => {
		if (!enableRealtime || !userId) return
		void startRealtime()
		return () => {
			realtimeRef.current?.disconnect()
			realtimeRef.current = null
		}
	}, [enableRealtime, startRealtime, userId])

	useEffect(() => {
		if (bellAnimation === "idle") return
		const timeout = setTimeout(() => setBellAnimation("idle"), 1200)
		return () => clearTimeout(timeout)
	}, [bellAnimation])

	useEffect(() => () => {
		if (highlightTimeout.current) clearTimeout(highlightTimeout.current)
	}, [])

	const loadMore = () => {
		if (!hasMore || isLoading) return
		void fetchNotifications("append")
	}

	const toggleDropdown = () => setDropdownOpen(!isDropdownOpen)

	const handleMarkAsRead = async (id: string) => {
		markAsRead(id)
		try {
			await notificationsService.markAsRead(id)
		} catch (error) {
			ui.addToast({ type: "error", title: "Action failed", message: "Could not mark notification" })
		}
	}

	const handleMarkAll = async () => {
		if (!userId) return
		setIsMarkingAll(true)
		try {
			await notificationsService.markAllAsRead()
			items.forEach((item) => markAsRead(item.id))
			setUnreadCount(0)
		} catch (error) {
			ui.addToast({ type: "error", title: "Action failed", message: "Could not mark all as read" })
		} finally {
			setIsMarkingAll(false)
		}
	}

	const handleDismiss = async (id: string) => {
		removeNotification(id)
		try {
			await notificationsService.dismissNotification(id)
		} catch (error) {
			ui.addToast({ type: "error", title: "Action failed", message: "Could not dismiss" })
		}
	}

	return {
		notifications: formattedNotifications,
		unreadCount,
		bellAnimation,
		realtimeStatus,
		isDropdownOpen,
		isLoading,
		hasMore,
		error,
		filters,
		highlightId,
		isMarkingAll,
		fetchNotifications,
		loadMore,
		toggleDropdown,
		setFilters,
		markAsRead: handleMarkAsRead,
		markAllAsRead: handleMarkAll,
		dismissNotification: handleDismiss,
		setDropdownOpen,
	}
}

export default useNotifications
