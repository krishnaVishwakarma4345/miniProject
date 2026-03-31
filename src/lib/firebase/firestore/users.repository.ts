/**
 * Users Repository
 * ============================================================
 * Data access layer for User documents in Firestore.
 * Provides CRUD operations with proper error handling and validation.
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
  QueryConstraint,
} from "firebase/firestore";
import { getFirestoreInstance } from "../client";
import { User, UserRole } from "@/types/user.types";
import { ApiError } from "@/types/api.types";

const COLLECTION_NAME = "users";

/**
 * Get single user by ID
 * @param userId - User ID
 * @returns User object or null if not found
 * @throws ApiError on database error
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as User;
  } catch (error) {
    throw {
      code: "firestore/get-user-failed",
      message: "Failed to fetch user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get user by email
 * @param email - User email
 * @returns User object or null if not found
 * @throws ApiError on database error
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const firestore = await getFirestoreInstance();
    const usersRef = collection(firestore, COLLECTION_NAME);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as User;
  } catch (error) {
    throw {
      code: "firestore/get-user-failed",
      message: "Failed to fetch user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get all users by institution
 * @param institutionId - Institution ID
 * @returns Array of User objects
 * @throws ApiError on database error
 */
export const getUsersByInstitution = async (
  institutionId: string
): Promise<User[]> => {
  try {
    const firestore = await getFirestoreInstance();
    const usersRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      usersRef,
      where("institutionId", "==", institutionId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    throw {
      code: "firestore/get-users-failed",
      message: "Failed to fetch users. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get users by role
 * @param institutionId - Institution ID
 * @param role - User role to filter by
 * @returns Array of User objects
 * @throws ApiError on database error
 */
export const getUsersByRole = async (
  institutionId: string,
  role: UserRole
): Promise<User[]> => {
  try {
    const firestore = await getFirestoreInstance();
    const usersRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      usersRef,
      where("institutionId", "==", institutionId),
      where("role", "==", role)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    throw {
      code: "firestore/get-users-failed",
      message: "Failed to fetch users. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Get faculty advisors for an institution
 * @param institutionId - Institution ID
 * @returns Array of faculty User objects
 * @throws ApiError on database error
 */
export const getFacultyAdvisors = async (institutionId: string): Promise<User[]> => {
  return getUsersByRole(institutionId, "faculty");
};

/**
 * Create new user document
 * @param userId - User ID (from Firebase Auth)
 * @param userData - User data (without ID)
 * @returns void
 * @throws ApiError on database error
 */
export const setUser = async (
  userId: string,
  userData: Omit<User, "id">
): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);

    await setDoc(userRef, {
      ...userData,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/create-user-failed",
      message: "Failed to create user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Update user document
 * @param userId - User ID
 * @param updates - Partial user data to update
 * @returns void
 * @throws ApiError on database error
 */
export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/update-user-failed",
      message: "Failed to update user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Delete user document
 * @param userId - User ID
 * @returns void
 * @throws ApiError on database error
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);

    await deleteDoc(userRef);
  } catch (error) {
    throw {
      code: "firestore/delete-user-failed",
      message: "Failed to delete user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Update user's last login timestamp
 * @param userId - User ID
 * @returns void
 * @throws ApiError on database error
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);

    await updateDoc(userRef, {
      lastLogin: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/update-last-login-failed",
      message: "Failed to update last login. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Deactivate user account
 * @param userId - User ID
 * @returns void
 * @throws ApiError on database error
 */
export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);

    await updateDoc(userRef, {
      isActive: false,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/deactivate-user-failed",
      message: "Failed to deactivate user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Reactivate user account
 * @param userId - User ID
 * @returns void
 * @throws ApiError on database error
 */
export const reactivateUser = async (userId: string): Promise<void> => {
  try {
    const firestore = await getFirestoreInstance();
    const userRef = doc(firestore, COLLECTION_NAME, userId);

    await updateDoc(userRef, {
      isActive: true,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      code: "firestore/reactivate-user-failed",
      message: "Failed to reactivate user. Please try again.",
      originalError: error,
    } as ApiError;
  }
};

/**
 * Search users by name or email
 * @param institutionId - Institution ID
 * @param searchTerm - Search term
 * @returns Array of User objects
 */
export const searchUsers = async (
  institutionId: string,
  searchTerm: string
): Promise<User[]> => {
  try {
    const firestore = await getFirestoreInstance();
    const usersRef = collection(firestore, COLLECTION_NAME);
    const q = query(
      usersRef,
      where("institutionId", "==", institutionId)
    );
    const querySnapshot = await getDocs(q);

    const searchLower = searchTerm.toLowerCase();
    return querySnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as User)
      )
      .filter(
        (user) =>
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
  } catch (error) {
    throw {
      code: "firestore/search-users-failed",
      message: "Failed to search users. Please try again.",
      originalError: error,
    } as ApiError;
  }
};
