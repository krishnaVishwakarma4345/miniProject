/**
 * Create User Service
 * ============================================================
 * Handles user registration with email/password and Google OAuth.
 * Creates user in Auth and corresponding Firestore document.
 */

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  AuthError,
} from "firebase/auth";
import { getAuthInstance, getFirestoreInstance } from "../client";
import { setUser } from "./../../firebase/firestore/users.repository";
import { UserRole, User } from "@/types/user.types";
import { ApiError } from "@/types/api.types";

/**
 * Error messages mapped to Firebase error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Email is already in use. Please sign in instead.",
  "auth/weak-password": "Password is too weak. Please use a stronger password.",
  "auth/invalid-email": "Invalid email format.",
  "auth/operation-not-allowed": "User registration is not available.",
  "auth/popup-closed-by-user": "Google sign-up was cancelled.",
  "auth/popup-blocked": "Pop-up was blocked. Please allow popups and try again.",
  "auth/operation-not-allowed": "Google sign-up is not available.",
};

/**
 * Register user with email and password
 * @param email - User email
 * @param password - User password
 * @param displayName - User's full name
 * @param role - User role (student, faculty, admin)
 * @param institutionId - Institution ID for multi-tenant support
 * @returns UserCredential on success
 * @throws ApiError on failure
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  institutionId: string
): Promise<UserCredential> => {
  try {
    const auth = await getAuthInstance();

    // Create user in Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName,
      });

      // Create user document in Firestore
      const newUser: Omit<User, "id"> = {
        email,
        displayName,
        role,
        institutionId,
        photoURL: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: false,
        lastLogin: new Date(),
        metadata: {
          signUpMethod: "email",
          loginCount: 1,
        },
      };

      await setUser(userCredential.user.uid, newUser);
    }

    return userCredential;
  } catch (error) {
    const authError = error as AuthError;
    const message =
      ERROR_MESSAGES[authError.code] ||
      "Failed to create account. Please try again.";

    throw {
      code: authError.code,
      message,
      originalError: error,
    } as ApiError;
  }
};

/**
 * Register user with Google OAuth
 * @param role - User role (student, faculty, admin)
 * @param institutionId - Institution ID for multi-tenant support
 * @returns UserCredential on success
 * @throws ApiError on failure
 */
export const registerWithGoogle = async (
  role: UserRole,
  institutionId: string
): Promise<UserCredential> => {
  try {
    const auth = await getAuthInstance();
    const provider = new GoogleAuthProvider();

    provider.addScope("profile");
    provider.addScope("email");
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const userCredential = await signInWithPopup(auth, provider);

    // Create user document in Firestore if new user
    if (userCredential.user) {
      const newUser: Omit<User, "id"> = {
        email: userCredential.user.email || "",
        displayName: userCredential.user.displayName || "",
        role,
        institutionId,
        photoURL: userCredential.user.photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: userCredential.user.emailVerified,
        lastLogin: new Date(),
        metadata: {
          signUpMethod: "google",
          loginCount: 1,
        },
      };

      await setUser(userCredential.user.uid, newUser);
    }

    return userCredential;
  } catch (error) {
    const authError = error as AuthError;
    const message =
      ERROR_MESSAGES[authError.code] ||
      "Failed to sign up with Google. Please try again.";

    throw {
      code: authError.code,
      message,
      originalError: error,
    } as ApiError;
  }
};

/**
 * Verify if email already exists
 * This hits the `/api/auth/check-email` endpoint
 * @param email - Email to check
 * @returns True if email exists
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to check email");
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};
