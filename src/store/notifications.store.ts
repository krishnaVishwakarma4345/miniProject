import { create } from "zustand"
import { Notification } from "@/types/notification.types"
import { NotificationFeedFilters } from "@/features/notifications/types/notification.types"

type RealtimeStatus = "idle" | "connecting" | "connected" | "error"

const defaultFilters: NotificationFeedFilters = {
	unreadOnly: false,
	priority: "all",
	types: "all",
}

interface NotificationsStoreState {
	items: Notification[]
	unreadCount: number
	isLoading: boolean
	isDropdownOpen: boolean
	hasMore: boolean
	cursor: string | null
	filters: NotificationFeedFilters
	error: string | null
	isMarkingAll: boolean
	realtimeStatus: RealtimeStatus
	highlightId: string | null
	setNotifications: (notifications: Notification[], opts?: { replace?: boolean }) => void
	prependNotifications: (notifications: Notification[]) => void
	updateNotification: (notification: Notification) => void
	removeNotification: (id: string) => void
	markAsRead: (id: string) => void
	setUnreadCount: (count: number) => void
	setLoading: (value: boolean) => void
	setDropdownOpen: (value: boolean) => void
	setHasMore: (value: boolean) => void
	setCursor: (cursor: string | null) => void
	setFilters: (filters: Partial<NotificationFeedFilters>) => void
	setError: (error: string | null) => void
	setIsMarkingAll: (value: boolean) => void
	setRealtimeStatus: (status: RealtimeStatus) => void
	setHighlightId: (id: string | null) => void
	reset: () => void
}

const toTimestamp = (value: Notification["createdAt"]): number => {
	if (typeof value === "number") return value
	if (value && typeof value === "object") {
		const maybeTimestamp = value as { seconds?: number; toDate?: () => Date }
		if (typeof maybeTimestamp.toDate === "function") {
			return maybeTimestamp.toDate().getTime()
		}
		if (typeof maybeTimestamp.seconds === "number") {
			return maybeTimestamp.seconds * 1000
		}
	}
	return Date.now()
}

const mergeNotifications = (
	current: Notification[],
	incoming: Notification[],
	options: { prepend?: boolean } = {}
) => {
	const ordered = options.prepend ? [...incoming, ...current] : [...current, ...incoming]
	const map = new Map<string, Notification>()
	ordered.forEach((item) => {
		map.set(item.id, { ...map.get(item.id), ...item })
	})
	return Array.from(map.values()).sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
}

export const useNotificationsStore = create<NotificationsStoreState>((set) => ({
	items: [],
	unreadCount: 0,
	isLoading: false,
	isDropdownOpen: false,
	hasMore: true,
	cursor: null,
	filters: defaultFilters,
	error: null,
	isMarkingAll: false,
	realtimeStatus: "idle",
	highlightId: null,
	setNotifications: (notifications, opts = { replace: false }) =>
		set((state) => ({
			items: opts.replace
				? [...notifications].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
				: mergeNotifications(state.items, notifications),
		})),
	prependNotifications: (notifications) =>
		set((state) => ({
			items: mergeNotifications(state.items, notifications, { prepend: true }),
		})),
	updateNotification: (notification) =>
		set((state) => ({
			items: state.items.map((item) => (item.id === notification.id ? { ...item, ...notification } : item)),
		})),
	removeNotification: (id) =>
		set((state) => ({
			items: state.items.filter((item) => item.id !== id),
		})),
	markAsRead: (id) =>
		set((state) => {
			const wasUnread = state.items.some((item) => item.id === id && !item.isRead)
			return {
				items: state.items.map((item) => (item.id === id ? { ...item, isRead: true, readAt: Date.now() } : item)),
				unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
			}
		}),
	setUnreadCount: (count) => set({ unreadCount: count }),
	setLoading: (isLoading) => set({ isLoading }),
	setDropdownOpen: (isDropdownOpen) => set({ isDropdownOpen }),
	setHasMore: (hasMore) => set({ hasMore }),
	setCursor: (cursor) => set({ cursor }),
	setFilters: (filters) =>
		set((state) => ({
			filters: { ...state.filters, ...filters },
		})),
	setError: (error) => set({ error }),
	setIsMarkingAll: (isMarkingAll) => set({ isMarkingAll }),
	setRealtimeStatus: (realtimeStatus) => set({ realtimeStatus }),
	setHighlightId: (highlightId) => set({ highlightId }),
	reset: () =>
		set({
			items: [],
			unreadCount: 0,
			isLoading: false,
			hasMore: true,
			cursor: null,
			filters: defaultFilters,
			error: null,
			isDropdownOpen: false,
			isMarkingAll: false,
			realtimeStatus: "idle",
			highlightId: null,
		}),
}))

export default useNotificationsStore
