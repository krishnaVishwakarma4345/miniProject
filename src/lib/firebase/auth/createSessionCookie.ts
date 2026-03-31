/**
 * Create Session Cookie (Server-Side)
 * ============================================================
 * Creates a secure session cookie from Firebase ID token.
 * Called from client-side after successful authentication.
 */

import { getAdminAuth } from "../admin";
import { ApiError } from "@/types/api.types";

/**
 * Session cookie options
 */
export interface SessionCookieOptions {
  expiresIn?: number; // Milliseconds (default: 5 days)
  secure?: boolean; // HTTPS only
  httpOnly?: boolean; // No JS access
  sameSite?: "strict" | "lax" | "none";
}

/**
 * Default session duration: 5 days
 */
const DEFAULT_SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

/**
 * Create secure session cookie from ID token
 * @param idToken - Firebase ID token from client
 * @param options - Cookie options
 * @returns Session cookie value
 * @throws ApiError on failure
 */
export const createSessionCookie = async (
  idToken: string,
  options?: SessionCookieOptions
): Promise<string> => {
  try {
    const auth = getAdminAuth();

    const expiresIn = options?.expiresIn || DEFAULT_SESSION_DURATION_MS;

    // Verify the ID token first to ensure it's valid
    const decodedToken = await auth.verifyIdToken(idToken);

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    return sessionCookie;
  } catch (error: any) {
    const message = getErrorMessage(error.code);

    throw new ApiError(
      message,
      error?.code || "auth/session-creation-failed",
      401,
      { details: error instanceof Error ? error.message : String(error) }
    );
  }
};

/**
 * Generate Set-Cookie header for response
 * @param sessionCookie - Session cookie value
 * @param options - Cookie options
 * @returns Set-Cookie header value
 */
export const generateSetCookieHeader = (
  sessionCookie: string,
  options?: SessionCookieOptions
): string => {
  const isProduction = process.env.NODE_ENV === "production";
  const secure = options?.secure !== false && isProduction;
  const httpOnly = options?.httpOnly !== false;
  const sameSite = options?.sameSite || (isProduction ? "strict" : "lax");
  const maxAge = options?.expiresIn || DEFAULT_SESSION_DURATION_MS;

  let cookieString = `session=${sessionCookie}`;
  cookieString += `; Path=/`;
  cookieString += `; Max-Age=${Math.floor(maxAge / 1000)}`;
  cookieString += `; SameSite=${sameSite}`;

  if (secure) {
    cookieString += "; Secure";
  }

  if (httpOnly) {
    cookieString += "; HttpOnly";
  }

  return cookieString;
};

/**
 * Parse session cookie from request
 * @param cookieHeader - Cookie header value
 * @returns Session cookie value or null
 */
export const parseSessionCookie = (headers: any): string | null => {
  const cookieHeader = headers.get?.("cookie") || headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "session") {
      return value;
    }
  }

  return null;
};

/**
 * Map Firebase error codes to user-friendly messages
 */
const getErrorMessage = (code: string | undefined): string => {
  const messages: Record<string, string> = {
    "auth/invalid-id-token": "Invalid authentication token.",
    "auth/id-token-revoked": "Authentication token has been revoked.",
    "auth/invalid-id-token-format": "Invalid token format.",
  };

  return (
    messages[code || ""] || "Failed to create session. Please try logging in again."
  );
};

/**
 * Session cookie configuration for Next.js response
 */
export const createCookieOptions = (): SessionCookieOptions => {
  return {
    expiresIn: DEFAULT_SESSION_DURATION_MS,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };
};
