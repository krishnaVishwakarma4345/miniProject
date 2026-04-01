/**
 * Sign Out Service
 * ============================================================
 * Handles user sign-out and session cleanup.
 */

import { signOut as firebaseSignOut, AuthError } from "firebase/auth";
import { getAuthInstance } from "../client";
import { ApiError } from "@/types/api.types";

/**
 * Sign out the current user
 * Clears Auth session and calls API endpoint to revoke session cookie
 * @returns void
 * @throws ApiError on failure
 */
export const signOut = async (): Promise<void> => {
  try {
    const auth = await getAuthInstance();

    // Clear session cookie on server
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Sign out from Firebase
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as AuthError;

    throw new ApiError(
      "Failed to sign out. Please try again.",
      authError.code || "auth/sign-out-failed",
      500,
      { details: authError.message }
    );
  }
};

/**
 * Sign out and redirect to a specific URL
 * @param redirectUrl - URL to redirect to after sign out
 * @returns void
 */
export const signOutAndRedirect = async (redirectUrl: string): Promise<void> => {
  try {
    await signOut();
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("Sign out failed:", error);
    // Still redirect even if sign out partially fails
    window.location.href = redirectUrl;
  }
};

/**
 * Sign out all sessions for a user (admin function, called from server)
 * @param userId - User ID to revoke all sessions for
 * @returns void
 */
export const signOutAllSessions = async (userId: string): Promise<void> => {
  try {
    const response = await fetch("/api/auth/revoke-all-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke sessions: ${response.statusText}`);
    }
  } catch (error) {
    throw new ApiError("Failed to revoke sessions.", "auth/revoke-sessions-failed", 500, {
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
