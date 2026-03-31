import { collection, limit as firestoreLimit, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/client"
import { Notification } from "@/types/notification.types"
import {
	DEFAULT_NOTIFICATION_LIMIT,
	NotificationRealtimePayload,
} from "@/features/notifications/types/notification.types"

export interface NotificationRealtimeOptions {
	userId: string
	limit?: number
	onPayload: (payload: NotificationRealtimePayload) => void
	onError?: (error: Error) => void
}

export interface NotificationRealtimeSubscription {
	disconnect: () => void
}

export const connectNotificationRealtime = async (
	options: NotificationRealtimeOptions
): Promise<NotificationRealtimeSubscription> => {
	const firestore = await getFirestoreInstance()
	const limit = options.limit ?? DEFAULT_NOTIFICATION_LIMIT

	const notificationsQuery = query(
		collection(firestore, "notifications"),
		where("recipientId", "==", options.userId),
		orderBy("createdAt", "desc"),
		firestoreLimit(limit)
	)

	const unreadQuery = query(
		collection(firestore, "notifications"),
		where("recipientId", "==", options.userId),
		where("isRead", "==", false)
	)

	let latestNotifications: Notification[] = []
	let latestUnread = 0

	const emit = () => {
		options.onPayload({ notifications: latestNotifications, unreadCount: latestUnread })
	}

	const handleError = (error: Error) => {
		options.onError?.(error)
	}

	const unsubscribeNotifications = onSnapshot(
		notificationsQuery,
		(snapshot) => {
			latestNotifications = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Notification[]
			emit()
		},
		handleError
	)

	const unsubscribeUnread = onSnapshot(
		unreadQuery,
		(snapshot) => {
			latestUnread = snapshot.docs.length
			emit()
		},
		handleError
	)

	return {
		disconnect: () => {
			unsubscribeNotifications()
			unsubscribeUnread()
		},
	}
}
