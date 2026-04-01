/**
 * Verify Session Cookie (Server-Side)
 * ============================================================
 * Verifies Firebase session cookies created by client-side authentication.
 * Used in server-side middleware and API routes.
 */

import { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "../admin";
import { ApiError } from "@/types/api.types";

const createVerifyApiError = (error: any, fallbackCode: string, message: string) =>
  new ApiError(message, error?.code || fallbackCode, 401, {
    details: error?.message,
  });

/**
 * Verify session cookie and return decoded token
 * @param sessionCookie - Session cookie value
 * @param checkRevoked - Check if token is revoked (slower but more secure)
 * @returns Decoded ID token
 * @throws ApiError on verification failure
 */
export const verifySessionCookie = async (
  sessionCookie: string,
  checkRevoked: boolean = true
): Promise<DecodedIdToken> => {
  try {
    const auth = getAdminAuth();

    const decodedToken = await auth.verifySessionCookie(
      sessionCookie,
      checkRevoked
    );

    return decodedToken;
  } catch (error: any) {
    const message = getErrorMessage(error?.code);

    throw createVerifyApiError(error, "auth/session-verify-failed", message);
  }
};

/**
 * Verify ID token (from Authorization header)
 * @param idToken - ID token from client
 * @param checkRevoked - Check if token is revoked
 * @returns Decoded ID token
 * @throws ApiError on verification failure
 */
export const verifyIdToken = async (
  idToken: string,
  checkRevoked: boolean = true
): Promise<DecodedIdToken> => {
  try {
    const auth = getAdminAuth();

    const decodedToken = await auth.verifyIdToken(idToken, checkRevoked);

    return decodedToken;
  } catch (error: any) {
    const message = getErrorMessage(error?.code);

    throw createVerifyApiError(error, "auth/token-verify-failed", message);
  }
};

/**
 * Get user's custom claims (usually contains role information)
 * @param uid - User ID
 * @returns Custom claims object
 * @throws ApiError on failure
 */
export const getUserCustomClaims = async (uid: string): Promise<Record<string, any>> => {
  try {
    const auth = getAdminAuth();

    const user = await auth.getUser(uid);

    return user.customClaims || {};
  } catch (error: any) {
    throw createVerifyApiError(error, "auth/get-claims-failed", "Failed to get user claims.");
  }
};

/**
 * Verify bearer token from Authorization header
 * Extracts token from "Bearer <token>" format
 * @param authHeader - Authorization header value
 * @param checkRevoked - Check if token is revoked
 * @returns Decoded ID token
 * @throws ApiError on verification failure
 */
export const verifyBearerToken = async (
  authHeader: string | null,
  checkRevoked: boolean = true
): Promise<DecodedIdToken> => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError("Authorization header missing or invalid.", "auth/missing-token", 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  return verifyIdToken(token, checkRevoked);
};

/**
 * Map Firebase error codes to user-friendly messages
 */
const getErrorMessage = (code: string | undefined): string => {
  const messages: Record<string, string> = {
    "auth/session-cookie-revoked": "Session has been revoked. Please log in again.",
    "auth/invalid-session-cookie": "Invalid session. Please log in again.",
    "auth/session-cookie-expired": "Session expired. Please log in again.",
    "auth/invalid-id-token": "Invalid authentication token.",
    "auth/id-token-revoked": "Authentication token has been revoked. Please log in again.",
    "auth/id-token-expired": "Authentication token expired. Please log in again.",
    "auth/user-not-found": "User not found.",
    "auth/user-disabled": "User account is disabled.",
  };

  return messages[code || ""] || "Authentication verification failed. Please log in again.";
};
