/**
 * Revoke Session (Server-Side)
 * ============================================================
 * Revokes Firebase auth sessions and session cookies.
 * Used for sign-out, security lockdown, and admin operations.
 */

import { getAdminAuth } from "../admin";
import { ApiError } from "@/types/api.types";

const createAuthApiError = (error: any, fallbackCode: string, message: string) =>
  new ApiError(message, error?.code || fallbackCode, 500, {
    details: error?.message,
  });

/**
 * Revoke all sessions for a user
 * Invalidates all refresh tokens for the user
 * @param uid - User ID
 * @returns void
 * @throws ApiError on failure
 */
export const revokeAllUserSessions = async (uid: string): Promise<void> => {
  try {
    const auth = getAdminAuth();

    // Revoke all refresh tokens (this invalidates all sessions)
    await auth.revokeRefreshTokens(uid);
  } catch (error: any) {
    throw createAuthApiError(error, "auth/revoke-failed", "Failed to revoke sessions.");
  }
};

/**
 * Get user's current sessions
 * @param uid - User ID
 * @returns User object with session info
 * @throws ApiError on failure
 */
export const getUserSessions = async (uid: string): Promise<any> => {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);

    return {
      uid: user.uid,
      email: user.email,
      tokensValidAfterTime: user.tokensValidAfterTime,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    };
  } catch (error: any) {
    throw createAuthApiError(error, "auth/get-sessions-failed", "Failed to get user sessions.");
  }
};

/**
 * Disable user account (revokes sessions and prevents new logins)
 * @param uid - User ID
 * @returns void
 * @throws ApiError on failure
 */
export const disableUserAccount = async (uid: string): Promise<void> => {
  try {
    const auth = getAdminAuth();

    // Disable the user
    await auth.updateUser(uid, {
      disabled: true,
    });

    // Revoke all sessions
    await revokeAllUserSessions(uid);
  } catch (error: any) {
    throw createAuthApiError(error, "auth/disable-failed", "Failed to disable user account.");
  }
};

/**
 * Re-enable user account
 * @param uid - User ID
 * @returns void
 * @throws ApiError on failure
 */
export const enableUserAccount = async (uid: string): Promise<void> => {
  try {
    const auth = getAdminAuth();

    await auth.updateUser(uid, {
      disabled: false,
    });
  } catch (error: any) {
    throw createAuthApiError(error, "auth/enable-failed", "Failed to enable user account.");
  }
};

/**
 * Delete user account completely
 * @param uid - User ID
 * @returns void
 * @throws ApiError on failure
 * NOTE: This is irreversible. Use with caution.
 */
export const deleteUserAccount = async (uid: string): Promise<void> => {
  try {
    const auth = getAdminAuth();

    await auth.deleteUser(uid);
  } catch (error: any) {
    throw createAuthApiError(error, "auth/delete-failed", "Failed to delete user account.");
  }
};

/**
 * Force password reset for user
 * User must reset password on next login
 * @param uid - User ID
 * @returns Reset link (should be sent to user via email)
 * @throws ApiError on failure
 */
export const forcePasswordReset = async (uid: string): Promise<string> => {
  try {
    const auth = getAdminAuth();

    // Revoke all sessions first
    await revokeAllUserSessions(uid);

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(
      (await auth.getUser(uid)).email || ""
    );

    return resetLink;
  } catch (error: any) {
    throw createAuthApiError(error, "auth/reset-failed", "Failed to generate password reset link.");
  }
};

/**
 * Set custom claims for a user (e.g., role information)
 * @param uid - User ID
 * @param claims - Custom claims object
 * @returns void
 * @throws ApiError on failure
 */
export const setUserCustomClaims = async (
  uid: string,
  claims: Record<string, any>
): Promise<void> => {
  try {
    const auth = getAdminAuth();

    await auth.setCustomUserClaims(uid, claims);

    // Revoke existing sessions to apply new claims immediately
    await revokeAllUserSessions(uid);
  } catch (error: any) {
    throw createAuthApiError(error, "auth/set-claims-failed", "Failed to set user claims.");
  }
};

/**
 * Delete all users in batch (admin operation)
 * @param uids - Array of user IDs
 * @returns Result with successful and failed deletions
 */
export const bulkDeleteUsers = async (
  uids: string[]
): Promise<{ successful: number; failed: number }> => {
  try {
    const auth = getAdminAuth();
    let successful = 0;
    let failed = 0;

    for (const uid of uids) {
      try {
        await deleteUserAccount(uid);
        successful++;
      } catch (error) {
        console.error(`Failed to delete user ${uid}:`, error);
        failed++;
      }
    }

    return { successful, failed };
  } catch (error: any) {
    throw createAuthApiError(error, "auth/bulk-delete-failed", "Failed to bulk delete users.");
  }
};
