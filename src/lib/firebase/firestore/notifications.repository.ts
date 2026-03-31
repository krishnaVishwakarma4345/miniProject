/**
 * Notifications Repository
 * ============================================================
 * Data access layer for Notification documents in Firestore.
 * Handles CRUD operations and real-time listeners for notifications.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
  DocumentSnapshot,
  orderBy,
} from "firebase/firestore";
import { getFirestoreInstance } from "../client";
import { Notification } from "@/types/notification.types";
import { ApiError } from "@/types/api.types";
import {
  buildAndConditions,
  buildOrderBy,
  buildPaginationConstraints,
  processPaginationResult,
  PaginationResult,
} from "./query.helpers";

const COLLECTION_NAME = "notifications";

/**
 * Get single notification by ID
 * @param notificationId - Notification ID
 * @returns Notification object or null if not found
 * @throws ApiError on database error
 */
export const getNotificationById = async (
  notificationId: string
): Promise<Notification | null> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationRef = doc(firestore, COLLECTION_NAME, notificationId);
    const docSnap = await getDoc(notificationRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Notification;
  } catch (error) {
    throw {
      code: "firestore/get-notification-failed",
      message: "Failed to fetch notification. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get notifications for a user with pagination
 * @param userId - User ID
 * @param pageSize - Number of items per page
 * @param cursor - Previous last document for pagination
 * @returns PaginationResult with notifications
 * @throws ApiError on database error
 */
export const getNotificationsByUser = async (
  userId: string,
  pageSize: number = 20,
  cursor?: DocumentSnapshot
): Promise<PaginationResult<Notification>> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationsRef = collection(firestore, COLLECTION_NAME);

    const constraints = buildAndConditions([["recipientId", "==", userId]]);
    constraints.push(buildOrderBy("createdAt", "desc"));

    const paginationConstraints = buildPaginationConstraints(
      constraints,
      pageSize,
      cursor
    );

    const baseQuery = query(notificationsRef, ...paginationConstraints);
    const querySnapshot = await getDocs(baseQuery);
    const docs = querySnapshot.docs as DocumentSnapshot<Notification>[];

    return processPaginationResult(docs, pageSize);
  } catch (error) {
    throw {
      code: "firestore/get-notifications-failed",
      message: "Failed to fetch notifications. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get unread notifications for a user
 * @param userId - User ID
 * @returns Array of unread Notification objects
 * @throws ApiError on database error
 */
export const getUnreadNotifications = async (
  userId: string
): Promise<Notification[]> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationsRef = collection(firestore, COLLECTION_NAME);

    const constraints = buildAndConditions([
      ["recipientId", "==", userId],
      ["isRead", "==", false],
    ]);
    constraints.push(buildOrderBy("createdAt", "desc"));

    const baseQuery = query(notificationsRef, ...constraints);
    const querySnapshot = await getDocs(baseQuery);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Notification));
  } catch (error) {
    throw {
      code: "firestore/get-unread-notifications-failed",
      message: "Failed to fetch unread notifications. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get unread notifications count for a user
 * @param userId - User ID
 * @returns Count of unread notifications
 * @throws ApiError on database error
 */
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const unread = await getUnreadNotifications(userId);
    return unread.length;
  } catch (error) {
    throw {
      code: "firestore/get-unread-count-failed",
      message: "Failed to fetch unread count. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Create new notification
 * @param notificationData - Notification data (without ID)
 * @returns Notification ID of created notification
 * @throws ApiError on database error
 */
export const createNotification = async (
  notificationData: Omit<Notification, "id">
): Promise<string> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationsRef = collection(firestore, COLLECTION_NAME);

    const newDocRef = doc(notificationsRef);

    await setDoc(newDocRef, {
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false,
    });

    return newDocRef.id;
  } catch (error) {
    throw {
      code: "firestore/create-notification-failed",
      message: "Failed to create notification. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Mark notification as read
 * @param notificationId - Notification ID
 * @returns void
 * @throws ApiError on database error
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationRef = doc(firestore, COLLECTION_NAME, notificationId);

    await updateDoc(notificationRef, {
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/mark-read-failed",
      message: "Failed to mark notification as read. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Mark all notifications as read for a user
 * @param userId - User ID
 * @returns void
 * @throws ApiError on database error
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const unreadNotifications = await getUnreadNotifications(userId);
    const updatePromises = unreadNotifications.map((notification) =>
      markNotificationAsRead(notification.id)
    );

    await Promise.all(updatePromises);
  } catch (error) {
    throw {
      code: "firestore/mark-all-read-failed",
      message: "Failed to mark notifications as read. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Delete notification
 * @param notificationId - Notification ID
 * @returns void
 * @throws ApiError on database error
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationRef = doc(firestore, COLLECTION_NAME, notificationId);

    await deleteDoc(notificationRef);
  } catch (error) {
    throw {
      code: "firestore/delete-notification-failed",
      message: "Failed to delete notification. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Delete all notifications for a user
 * @param userId - User ID
 * @returns void
 * @throws ApiError on database error
 */
export const deleteAllNotifications = async (userId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const notificationsRef = collection(firestore, COLLECTION_NAME);
    const q = query(notificationsRef, where("recipientId", "==", userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    throw {
      code: "firestore/delete-all-notifications-failed",
      message: "Failed to delete notifications. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Real-time listener for user notifications
 * @param userId - User ID
 * @param onNotifications - Callback when notifications change
 * @returns Unsubscribe function to stop listening
 */
export const onNotificationsChange = (
  userId: string,
  onNotifications: (notifications: Notification[]) => void
): Unsubscribe => {
  const unsubscribePromise = (async () => {
    const firestore = await getFirestoreInstance();
    const notificationsRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      notificationsRef,
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Notification));

      onNotifications(notifications);
    });
  })();

  // Return a unsubscribe function that resolves the promise first
  return () => {
    unsubscribePromise.then((unsubscribe) => unsubscribe());
  };
};

/**
 * Real-time listener for unread notification count
 * @param userId - User ID
 * @param onCountChange - Callback with unread count
 * @returns Unsubscribe function to stop listening
 */
export const onUnreadCountChange = (
  userId: string,
  onCountChange: (count: number) => void
): Unsubscribe => {
  const unsubscribePromise = (async () => {
    const firestore = await getFirestoreInstance();
    const notificationsRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      notificationsRef,
      where("recipientId", "==", userId),
      where("isRead", "==", false)
    );

    return onSnapshot(q, (querySnapshot) => {
      onCountChange(querySnapshot.docs.length);
    });
  })();

  return () => {
    unsubscribePromise.then((unsubscribe) => unsubscribe());
  };
};

/**
 * Bulk delete old notifications (cleanup job)
 * @param daysOld - Delete notifications older than this many days
 * @returns Number of deleted notifications
 * @throws ApiError on database error
 */
export const deleteOldNotifications = async (daysOld: number): Promise<number> => {
  try {
    const firestore = await getFirestoreInstance();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const notificationsRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      notificationsRef,
      where("createdAt", "<", cutoffDate)
    );
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);

    return querySnapshot.docs.length;
  } catch (error) {
    throw {
      code: "firestore/delete-old-notifications-failed",
      message: "Failed to delete old notifications. Please try again.",
      originalError: error,
    } as ApiError;
  }
};
