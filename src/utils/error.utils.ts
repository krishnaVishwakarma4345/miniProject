/**
 * Error Handling Utilities
 *
 * Custom error classes, error formatting, and exception handling.
 */

/**
 * Custom application error class
 * Extends Error with additional properties for better error handling
 */
export class AppError extends Error {
  /** HTTP status code */
  statusCode: number;

  /** Machine-readable error code */
  code: string;

  /** User-friendly error message */
  userMessage: string;

  /** Field-level validation errors */
  fieldErrors?: Record<string, string[]>;

  /** Original error (for logging) */
  originalError?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    userMessage?: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage || message;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Validation error (400 Bad Request)
 * Used for form validation failures
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    fieldErrors?: Record<string, string[]>
  ) {
    super(
      message,
      400,
      "VALIDATION_ERROR",
      "Please check your input and try again.",
      fieldErrors
    );
    this.name = "ValidationError";
  }
}

/**
 * Authentication error (401 Unauthorized)
 * User not logged in or session expired
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(
      message,
      401,
      "UNAUTHENTICATED",
      "Please log in to continue."
    );
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error (403 Forbidden)
 * User lacks required permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(
      message,
      403,
      "UNAUTHORIZED",
      "You don't have permission to perform this action."
    );
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error (404 Not Found)
 * Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(
      `${resource} not found`,
      404,
      "NOT_FOUND",
      `${resource} doesn't exist or has been deleted.`
    );
    this.name = "NotFoundError";
  }
}

/**
 * Conflict error (409 Conflict)
 * Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(
      message,
      409,
      "CONFLICT",
      "This resource already exists or there's a conflict."
    );
    this.name = "ConflictError";
  }
}

/**
 * Rate limit error (429 Too Many Requests)
 */
export class RateLimitError extends AppError {
  retryAfter: number;

  constructor(message: string = "Too many requests", retryAfter: number = 60) {
    super(
      message,
      429,
      "RATE_LIMIT_EXCEEDED",
      `Please wait ${retryAfter} seconds before trying again.`
    );
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Server error (500 Internal Server Error)
 */
export class ServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    originalError?: Error
  ) {
    super(
      message,
      500,
      "INTERNAL_ERROR",
      "Something went wrong. Please try again later."
    );
    this.name = "ServerError";
    this.originalError = originalError;
  }
}

/**
 * Firebase-specific error wrapper
 * Converts Firebase error codes to user-friendly messages
 */
export class FirebaseError extends AppError {
  firebaseCode: string;

  constructor(error: any) {
    const code = error?.code || "unknown";
    const message = error?.message || "Firebase error occurred";

    // Map Firebase error codes to user messages
    const userMessageMap: Record<string, string> = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/email-already-in-use": "This email is already registered.",
      "auth/weak-password": "Password is too weak. Use at least 8 characters.",
      "auth/invalid-email": "Invalid email address.",
      "auth/operation-not-allowed": "This operation is not allowed.",
      "auth/too-many-requests": "Too many login attempts. Try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "permission-denied": "You don't have permission to access this resource.",
      "not-found": "The requested resource was not found.",
      "already-exists": "This resource already exists.",
      "invalid-argument": "Invalid request parameters.",
      "failed-precondition": "Operation cannot be completed in current state.",
      "unavailable": "Service is temporarily unavailable.",
      "internal": "An internal error occurred.",
      "data-loss": "Unrecoverable data loss or corruption.",
      "unauthenticated": "Authentication required.",
    };

    const userMessage = userMessageMap[code] || message;
    let statusCode = 500;

    // Map Firebase codes to HTTP status codes
    if (code.includes("auth/")) {
      statusCode = 401;
    } else if (["permission-denied", "unauthenticated"].includes(code)) {
      statusCode = code === "permission-denied" ? 403 : 401;
    } else if (["not-found"].includes(code)) {
      statusCode = 404;
    } else if (["already-exists"].includes(code)) {
      statusCode = 409;
    }

    super(message, statusCode, code, userMessage);
    this.name = "FirebaseError";
    this.firebaseCode = code;
    this.originalError = error;
  }
}

/**
 * Check if error is an API error response
 * @param error - Error object
 * @returns true if error has API error structure
 */
export function isAPIError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if error is a network/timeout error
 * @param error - Error object
 * @returns true if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("fetch")
    );
  }
  return false;
}

/**
 * Get error message for user display
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Get error code for logging/analytics
 * @param error - Error object
 * @returns Machine-readable error code
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }

  if (error instanceof Error) {
    return error.name;
  }

  return "UNKNOWN_ERROR";
}

/**
 * Log error with context
 * @param error - Error object
 * @param context - Additional context (route, action, etc.)
 */
export function logError(
  error: unknown,
  context: Record<string, unknown> = {}
): void {
  const errorMessage = getUserErrorMessage(error);
  const errorCode = getErrorCode(error);

  console.error("[Error]", {
    message: errorMessage,
    code: errorCode,
    context,
    timestamp: new Date().toISOString(),
    ...(error instanceof AppError && {
      statusCode: error.statusCode,
      originalError: error.originalError?.message,
    }),
  });
}

/**
 * Convert error to API response
 * @param error - Error object
 * @returns API error response object
 */
export function toErrorResponse(error: unknown) {
  const appError = error instanceof AppError
    ? error
    : new ServerError(error instanceof Error ? error.message : String(error));

  return {
    success: false,
    data: null,
    message: appError.userMessage,
    error: {
      code: appError.code,
      details: appError.message,
      fieldErrors: appError.fieldErrors,
    },
    statusCode: appError.statusCode,
    timestamp: Date.now(),
  };
}

/**
 * Safe JSON parse with error handling
 * @param jsonString - JSON string to parse
 * @param defaultValue - Value to return on error
 * @returns Parsed object or default value
 */
export function safeJSONParse<T = unknown>(
  jsonString: string,
  defaultValue: T
): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn("JSON parse error:", error);
    return defaultValue;
  }
}

/**
 * Async error handler wrapper
 * Catches errors in async functions
 * @param fn - Async function to wrap
 * @returns Wrapped function that handles errors
 *
 * @example
 * const handleClick = withErrorHandler(async () => {
 *   await api.doSomething();
 * });
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<void> {
  return async (...args: Parameters<T>) => {
    try {
      await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name });
      // Optionally: show toast notification to user
      // toast.error(getUserErrorMessage(error));
    }
  };
}
