/**
 * Activities Repository
 * ============================================================
 * Data access layer for Activity documents in Firestore.
 * Handles CRUD operations, status updates, and filtering.
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
  Query,
  orderBy,
  DocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreInstance } from "../client";
import { Activity, ActivityStatus, ActivityCategory } from "@/types/activity.types";
import { ApiError } from "@/types/api.types";
import {
  buildAndConditions,
  buildOrderBy,
  buildPaginationConstraints,
  processPaginationResult,
  PaginationResult,
} from "./query.helpers";

const COLLECTION_NAME = "activities";

/**
 * Get single activity by ID
 * @param activityId - Activity ID
 * @returns Activity object or null if not found
 * @throws ApiError on database error
 */
export const getActivityById = async (activityId: string): Promise<Activity | null> => {
  try {
    const firestore = await getFirestoreInstance();
    const activityRef = doc(firestore, COLLECTION_NAME, activityId);
    const docSnap = await getDoc(activityRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Activity;
  } catch (error) {
    throw {
      code: "firestore/get-activity-failed",
      message: "Failed to fetch activity. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Get activities by student ID with pagination
 * @param studentId - Student ID
 * @param pageSize - Number of items per page
 * @param cursor - Previous last document for pagination
 * @returns PaginationResult with activities
 * @throws ApiError on database error
 */
export const getActivitiesByStudent = async (
  studentId: string,
  pageSize: number = 20,
  cursor?: DocumentSnapshot
): Promise<PaginationResult<Activity>> => {
  try {
    const firestore = await getFirestoreInstance();
    const activitiesRef = collection(firestore, COLLECTION_NAME);

    const constraints = buildAndConditions([
      ["studentId", "==", studentId],
    ]);
    constraints.push(buildOrderBy("createdAt", "desc"));

    const paginationConstraints = buildPaginationConstraints(
      constraints,
      pageSize,
      cursor
    );

    const q = query(activitiesRef, ...paginationConstraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs as DocumentSnapshot<Activity>[];

    return processPaginationResult(docs, pageSize);
  } catch (error) {
    throw {
      code: "firestore/get-activities-failed",
      message: "Failed to fetch activities. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Get activities pending review for faculty
 * @param institutionId - Institution ID
 * @param pageSize - Number of items per page
 * @param cursor - Previous last document for pagination
 * @returns PaginationResult with activities
 * @throws ApiError on database error
 */
export const getPendingActivities = async (
  institutionId: string,
  pageSize: number = 20,
  cursor?: DocumentSnapshot
): Promise<PaginationResult<Activity>> => {
  try {
    const firestore = await getFirestoreInstance();
    const activitiesRef = collection(firestore, COLLECTION_NAME);

    const constraints = buildAndConditions([
      ["institutionId", "==", institutionId],
      ["status", "==", "under_review"],
    ]);
    constraints.push(buildOrderBy("createdAt", "asc"));

    const paginationConstraints = buildPaginationConstraints(
      constraints,
      pageSize,
      cursor
    );

    const q = query(activitiesRef, ...paginationConstraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs as DocumentSnapshot<Activity>[];

    return processPaginationResult(docs, pageSize);
  } catch (error) {
    throw {
      code: "firestore/get-pending-activities-failed",
      message: "Failed to fetch pending activities. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Get activities by status
 * @param institutionId - Institution ID
 * @param status - Activity status to filter by
 * @param pageSize - Number of items per page
 * @param cursor - Previous last document for pagination
 * @returns PaginationResult with activities
 * @throws ApiError on database error
 */
export const getActivitiesByStatus = async (
  institutionId: string | undefined,
  status: ActivityStatus,
  pageSize: number = 20,
  cursor?: DocumentSnapshot
): Promise<PaginationResult<Activity>> => {
  try {
    const firestore = await getFirestoreInstance();
    const activitiesRef = collection(firestore, COLLECTION_NAME);

    const conditions: [string, any, any][] = [["status", "==", status]];

    if (institutionId) {
      conditions.unshift(["institutionId", "==", institutionId]);
    }

    const constraints = buildAndConditions(conditions);
    constraints.push(buildOrderBy("createdAt", "desc"));

    const paginationConstraints = buildPaginationConstraints(
      constraints,
      pageSize,
      cursor
    );

    const q = query(activitiesRef, ...paginationConstraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs as DocumentSnapshot<Activity>[];

    return processPaginationResult(docs, pageSize);
  } catch (error) {
    throw {
      code: "firestore/get-activities-by-status-failed",
      message: "Failed to fetch activities. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Get activities by category
 * @param institutionId - Institution ID
 * @param category - Activity category
 * @param pageSize - Number of items per page
 * @param cursor - Previous last document for pagination
 * @returns PaginationResult with activities
 * @throws ApiError on database error
 */
export const getActivitiesByCategory = async (
  institutionId: string,
  category: ActivityCategory,
  pageSize: number = 20,
  cursor?: DocumentSnapshot
): Promise<PaginationResult<Activity>> => {
  try {
    const firestore = await getFirestoreInstance();
    const activitiesRef = collection(firestore, COLLECTION_NAME);

    const constraints = buildAndConditions([
      ["institutionId", "==", institutionId],
      ["category", "==", category],
    ]);
    constraints.push(buildOrderBy("createdAt", "desc"));

    const paginationConstraints = buildPaginationConstraints(
      constraints,
      pageSize,
      cursor
    );

    const q = query(activitiesRef, ...paginationConstraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs as DocumentSnapshot<Activity>[];

    return processPaginationResult(docs, pageSize);
  } catch (error) {
    throw {
      code: "firestore/get-activities-by-category-failed",
      message: "Failed to fetch activities. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Create new activity
 * @param activityData - Activity data (without ID)
 * @returns Activity ID of created activity
 * @throws ApiError on database error
 */
export const createActivity = async (
  activityData: Omit<Activity, "id">
): Promise<string> => {
  try {
    const firestore = await getFirestoreInstance();
    const activitiesRef = collection(firestore, COLLECTION_NAME);

    // Generate a new document ID
    const newDocRef = doc(activitiesRef);

    await setDoc(newDocRef, {
      ...activityData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newDocRef.id;
  } catch (error) {
    throw {
      code: "firestore/create-activity-failed",
      message: "Failed to create activity. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Update activity
 * @param activityId - Activity ID
 * @param updates - Partial activity data to update
 * @returns void
 * @throws ApiError on database error
 */
export const updateActivity = async (
  activityId: string,
  updates: Partial<Omit<Activity, "id" | "createdAt">>
): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const activityRef = doc(firestore, COLLECTION_NAME, activityId);

    await updateDoc(activityRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/update-activity-failed",
      message: "Failed to update activity. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Update activity status
 * @param activityId - Activity ID
 * @param status - New status
 * @param remarks - Optional remarks (for rejection)
 * @returns void
 * @throws ApiError on database error
 */
export const updateActivityStatus = async (
  activityId: string,
  status: ActivityStatus,
  remarks?: string
): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const activityRef = doc(firestore, COLLECTION_NAME, activityId);

    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (remarks) {
      updates.remarks = remarks;
    }

    if (status === "approved" || status === "rejected") {
      updates.reviewedAt = new Date();
    }

    await updateDoc(activityRef, updates);
  } catch (error) {
    throw {
      code: "firestore/update-activity-status-failed",
      message: "Failed to update activity status. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Delete activity
 * @param activityId - Activity ID
 * @returns void
 * @throws ApiError on database error
 */
export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const activityRef = doc(firestore, COLLECTION_NAME, activityId);

    await deleteDoc(activityRef);
  } catch (error) {
    throw {
      code: "firestore/delete-activity-failed",
      message: "Failed to delete activity. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Bulk update activities status
 * @param activityIds - Array of activity IDs
 * @param status - New status for all activities
 * @returns void
 * @throws ApiError on database error
 */
export const bulkUpdateActivityStatus = async (
  activityIds: string[],
  status: ActivityStatus
): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();

    const updatePromises = activityIds.map((id) =>
      updateActivityStatus(id, status)
    );

    await Promise.all(updatePromises);
  } catch (error) {
    throw {
      code: "firestore/bulk-update-failed",
      message: "Failed to update activities. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};

/**
 * Get activity statistics for institution
 * @param institutionId - Institution ID
 * @returns Object with activity counts by status
 * @throws ApiError on database error
 */
export const getActivityStats = async (
  institutionId: string
): Promise<Record<ActivityStatus, number>> => {
  try {
    const firestore = await getFirestoreInstance();
    const activitiesRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      activitiesRef,
      where("institutionId", "==", institutionId)
    );
    const querySnapshot = await getDocs(q);

    const stats: Record<ActivityStatus, number> = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      revision_requested: 0,
    };

    querySnapshot.docs.forEach((doc) => {
      const status = doc.data().status as ActivityStatus;
      if (status in stats) {
        stats[status]++;
      }
    });

    return stats;
  } catch (error) {
    throw {
      code: "firestore/get-activity-stats-failed",
      message: "Failed to fetch activity statistics. Please try again.",
      originalError: error,
    } as unknown as ApiError;
  }
};
