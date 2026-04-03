/**
 * Sign In Service
 * ============================================================
 * Handles email/password and Google OAuth sign-in flows.
 */

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  AuthError,
} from "firebase/auth";
import { getAuthInstance } from "../client";
import { ApiError } from "@/types/api.types";

/**
 * Error messages mapped to specific Firebase error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "Email not registered. Please sign up first.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Invalid email format.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many failed login attempts. Please try again later.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Pop-up was blocked. Please allow popups and try again.",
  "auth/operation-not-allowed": "Google sign-in is not available.",
  "auth/invalid-credential": "Invalid credentials. Please try again.",
  "auth/invalid-login-credentials": "Invalid email or password.",
  "auth/network-request-failed": "Network error while contacting Firebase. Check your connection and try again.",
};

/**
 * Sign in with email and password
 * @param email - User email
 * @param password - User password
 * @returns UserCredential on success
 * @throws ApiError with formatted message on failure
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const auth = await getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    return userCredential;
  } catch (error) {
    const authError = error as AuthError;
    const baseMessage =
      ERROR_MESSAGES[authError.code] || "Failed to sign in. Please try again.";
    const message =
      authError.code === "auth/invalid-credential" || authError.code === "auth/invalid-login-credentials"
        ? `${baseMessage} If this account works on localhost but not on deployed app, it is likely in a different Firebase project.`
        : baseMessage;

    throw new ApiError(message, authError.code || "LOGIN_ERROR", 401, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Sign in with Google OAuth
 * @returns UserCredential on success
 * @throws ApiError with formatted message on failure
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const auth = await getAuthInstance();
    const provider = new GoogleAuthProvider();

    // Request additional scopes if needed
    provider.addScope("profile");
    provider.addScope("email");

    // Force account selection for users with multiple accounts
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error) {
    const authError = error as AuthError;
    const message =
      ERROR_MESSAGES[authError.code] ||
      "Failed to sign in with Google. Please try again.";

    throw new ApiError(message, authError.code || "GOOGLE_LOGIN_ERROR", 401, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Verify email format
 * @param email - Email to verify
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Verify password strength
 * @param password - Password to verify
 * @returns Object with validation result and message
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number.",
    };
  }

  return {
    isValid: true,
    message: "Password is strong.",
  };
};
