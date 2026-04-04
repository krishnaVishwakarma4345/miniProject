/**
 * Create User Service
 * ============================================================
 * Handles user registration with email/password and Google OAuth.
 * Creates user in Auth and corresponding Firestore document.
 */

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  AuthError,
} from "firebase/auth";
import { getAuthInstance, getFirestoreInstance } from "../client";
import { setUser } from "./../../firebase/firestore/users.repository";
import { getEmailVerificationActionCodeSettings } from "./actionCode";
import { UserRole, User, UserStatus } from "@/types/user.types";
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
};

/**
 * Register user with email and password
 * @param email - User email
 * @param password - User password
 * @param displayName - User's full name
 * @param institutionId - Institution ID for multi-tenant support
 * @returns UserCredential on success
 * @throws ApiError on failure
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  institutionId: string
): Promise<UserCredential> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const auth = await getAuthInstance();

    // Create user in Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName,
      });

      await sendEmailVerification(
        userCredential.user,
        getEmailVerificationActionCodeSettings()
      );

      // Attempt to create user profile document. If Firestore client is unavailable,
      // keep auth registration successful and let profile bootstrap happen later.
      const newUser: Omit<User, "id"> = {
        uid: userCredential.user.uid,
        fullName: displayName,
        email: normalizedEmail,
        displayName,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        language: "en",
        mfaEnabled: false,
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

      try {
        await setUser(userCredential.user.uid, newUser);
      } catch (profileError) {
        console.warn("User auth created, but profile document creation failed.", profileError);
      }
    }

    return userCredential;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const authError = error as Partial<AuthError>;
    const message =
      (authError.code ? ERROR_MESSAGES[authError.code] : undefined) ||
      (error instanceof Error ? error.message : undefined) ||
      "Failed to create account. Please try again.";

    throw new ApiError(message, authError.code || "REGISTER_ERROR", 400, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Register user with Google OAuth
 * @param institutionId - Institution ID for multi-tenant support
 * @returns UserCredential on success
 * @throws ApiError on failure
 */
export const registerWithGoogle = async (
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
        uid: userCredential.user.uid,
        fullName: userCredential.user.displayName || "",
        email: userCredential.user.email || "",
        displayName: userCredential.user.displayName || "",
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        language: "en",
        mfaEnabled: false,
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

      try {
        await setUser(userCredential.user.uid, newUser);
      } catch (profileError) {
        console.warn("Google auth created, but profile document creation failed.", profileError);
      }
    }

    return userCredential;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const authError = error as Partial<AuthError>;
    const message =
      (authError.code ? ERROR_MESSAGES[authError.code] : undefined) ||
      (error instanceof Error ? error.message : undefined) ||
      "Failed to sign up with Google. Please try again.";

    throw new ApiError(message, authError.code || "GOOGLE_REGISTER_ERROR", 400, {
      details: error instanceof Error ? error.message : String(error),
    });
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
